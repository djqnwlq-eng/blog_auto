import { ContentRatio, ProductConnection } from '@/types';

const CONTENT_RATIO_LABELS: Record<ContentRatio, string> = {
  experience: '경험 중심 (70% 경험 + 30% 정보)',
  'experience-rec': '경험 + 추천 (60% 경험 + 40% 정보/추천)',
  balanced: '균형형 (50% 경험 + 50% 정보)',
  info: '정보 중심 (30% 경험 + 70% 정보)',
  'pure-info': '순수 정보글 (100% 정보)',
};

const PRODUCT_CONNECTION_LABELS: Record<ProductConnection, string> = {
  ingredient: '제품의 주요 성분을 근거로 논리적으로 설명하며 소개',
  diary: '일자별 사용 후기를 상세하게 공유하며 소개',
  mixed: '주요 성분 논리적 설명 + 일자별 사용 후기를 함께 활용',
  none: '제품 언급 없이 정보글만',
};

export function buildTitlePrompt(params: {
  keyword: string;
  subKeywords: string[];
  productInfo: string;
  persona: string;
  contentRatio: ContentRatio;
  productConnection: ProductConnection;
}): string {
  return `당신은 네이버 블로그 SEO 전문가이자 카피라이터입니다.
다음 정보를 바탕으로 클릭을 유도하는 블로그 제목 3개를 생성해주세요.

키워드: ${params.keyword}
서브키워드: ${params.subKeywords.join(', ')}
글쓴이 페르소나: ${params.persona}
글 구성: ${CONTENT_RATIO_LABELS[params.contentRatio]}
제품 연결 방식: ${PRODUCT_CONNECTION_LABELS[params.productConnection]}

절대 지켜야 할 규칙:
- 제목에 제품명이나 브랜드명을 절대 포함하지 마세요
- 검색자가 클릭하고 싶어지는 강력한 훅이 있어야 합니다
- 궁금증 유발, 충격적 사실, 의외의 정보, 경고성 문구 등 활용
- 페르소나의 관점과 글 구성 방식에 맞는 톤의 제목
- 25자 내외
- 숫자나 구체적 표현 포함
- 검색 의도에 정확히 부합하는 제목

참고할 상품 정보 (제목에 직접 사용하지 말 것): ${params.productInfo}

좋은 제목 예시:
- "이것 모르고 바르면 오히려 악화됩니다"
- "피부과 의사가 절대 안 쓰는 3가지"
- "3일 만에 효과 본 방법 공개합니다"

JSON 형식으로만 출력 (다른 텍스트 없이):
{"titles": ["제목1", "제목2", "제목3"]}`;
}

export function buildSubtitlePrompt(params: {
  keyword: string;
  subKeywords: string[];
  persona: string;
  contentRatio: ContentRatio;
  productConnection: ProductConnection;
  title: string;
}): string {
  return `당신은 네이버 블로그 SEO 전문가입니다.

주제: ${params.keyword}
페르소나: ${params.persona}
글 구성: ${CONTENT_RATIO_LABELS[params.contentRatio]}
제품 연결 방식: ${PRODUCT_CONNECTION_LABELS[params.productConnection]}
선택된 제목: ${params.title}
서브키워드: ${params.subKeywords.join(', ')}

위 주제와 관련하여 사람들이 실제로 구글이나 네이버에 검색할 법한 '질문형 롱테일 키워드' 소제목을 4개 만들어주세요.

조건:
- 정보 검색자의 불안함이나 궁금증을 해소하는 구체적인 문장일 것
- '방법', '이유', '시기', '주의사항' 등이 포함된 15자 내외의 질문 형태
- 단순 단어 나열이 아닌, 대화하듯 자연스러운 문구로 작성할 것
- 선택된 제목 및 페르소나의 관점에 맞는 흐름으로 구성
- 서브키워드를 자연스럽게 반영
- 글의 논리적 흐름에 맞게 순서 배치 (원인/현상 → 해결/방법 → 주의사항/팁 → 제품/추천)

JSON 형식으로만 출력 (다른 텍스트 없이):
{"subtitles": ["소제목1", "소제목2", "소제목3", "소제목4"]}`;
}

export function buildPersonaPrompt(keyword: string): string {
  return `당신은 블로그 마케팅 전문가입니다.
다음 키워드를 검색하는 사람들의 페르소나를 분석해주세요.

키워드: ${keyword}

이 키워드를 검색하는 사람은 어떤 상황에 있을까요?
검색 의도를 분석하여 가장 적합한 글쓴이 페르소나 4개를 생성해주세요.

조건:
- 각 페르소나는 구체적인 상황과 감정이 담겨야 합니다
- 키워드의 검색 의도에 맞는 현실적인 인물 설정
- 일반적이거나 뻔한 설정은 피하세요
- 각 페르소나는 서로 다른 관점이어야 합니다

JSON 형식으로만 출력 (다른 텍스트 없이):
{"personas": ["페르소나1", "페르소나2", "페르소나3", "페르소나4"]}`;
}

export function buildContentPrompt(params: {
  title: string;
  keyword: string;
  subKeywords: string[];
  persona: string;
  contentRatio: ContentRatio;
  productConnection: ProductConnection;
  productInfo: string;
  sellingPoints: string[];
  subtitles: string[];
}): string {
  const subtitleSection = params.subtitles.length > 0
    ? `\n\n글 구조 (반드시 이 소제목 순서대로 작성):
도입부: 페르소나의 상황 묘사 + 공감 유도
${params.subtitles.map((s, i) => `소제목 ${i + 1}: ${s}`).join('\n')}

각 소제목은 질문형이므로, 해당 소제목 아래 본문 첫 문장은 결론부터 직관적으로 제시해주세요.`
    : '';

  return `당신은 경험을 바탕으로 글을 쓰는 블로거입니다.

작성 조건:
- 제목: ${params.title}
- 키워드: ${params.keyword} (자연스럽게 3회 이상 포함)
- 서브키워드: ${params.subKeywords.join(', ')} (각각 1회 이상 자연스럽게 포함)
- 페르소나: ${params.persona}
- 글 구성: ${CONTENT_RATIO_LABELS[params.contentRatio]}
- 제품 연결: ${PRODUCT_CONNECTION_LABELS[params.productConnection]}
- 상품 정보: ${params.productInfo}
- 강조할 셀링포인트: ${params.sellingPoints.join(', ')}
${subtitleSection}

작성 규칙:
1. 친근하고 자연스러운 어투 (존댓말)
2. 경험담은 구체적인 상황 묘사 포함
3. 정보는 신뢰할 수 있는 내용으로
4. 문단 사이에 [사진: 설명] 형태로 이미지 가이드 삽입
5. 총 1500-2000자
6. 제품 언급 시 광고 느낌 없이 자연스럽게
${params.productConnection === 'ingredient' ? '7. 제품의 주요 성분(예: 유효 성분, 특허 성분 등)을 근거로 왜 효과가 있는지 논리적으로 설명' : ''}
${params.productConnection === 'diary' ? '7. 1일차, 3일차, 7일차 등 일자별 사용 경험을 구체적으로 서술' : ''}
${params.productConnection === 'mixed' ? '7. 성분에 대한 논리적 설명과 일자별 사용 후기를 자연스럽게 섞어서 구성' : ''}

마크다운 형식으로 출력해주세요.`;
}

export function buildSubKeywordPrompt(keyword: string): string {
  return `당신은 네이버 블로그 SEO 전문가입니다.
다음 메인 키워드에 대한 연관 서브 키워드 5개를 추천해주세요.

메인 키워드: ${keyword}

조건:
- 실제 사용자들이 검색할 만한 키워드
- 메인 키워드와 관련성이 높은 키워드
- 롱테일 키워드 포함

JSON 형식으로만 출력 (다른 텍스트 없이):
{"keywords": ["키워드1", "키워드2", "키워드3", "키워드4", "키워드5"]}`;
}

export function buildThreadPrompt(blogContent: string): string {
  return `다음 블로그 글을 스레드(SNS) 마케팅용으로 변환해주세요.

원문:
${blogContent}

변환 규칙:
1. 반말 어투
2. 첫 줄은 강렬한 훅 (궁금증 유발)
3. 메인 글 280자 이내
4. 핵심 정보만 압축
5. 이어지는 댓글 3개 제안 (각 100자 이내)

JSON 형식으로만 출력 (다른 텍스트 없이):
{
  "main": "메인 글",
  "comments": ["댓글1", "댓글2", "댓글3"]
}`;
}

export function buildUrlAnalysisPrompt(pageContent: string): string {
  return `다음은 상품 상세페이지의 내용입니다. 이 상품의 핵심 셀링포인트를 추출해주세요.

페이지 내용:
${pageContent}

조건:
- 주요 셀링포인트를 5-8개 추출
- 각 셀링포인트는 간결하게 한 문장으로
- 소비자 관점에서 매력적인 포인트 위주

JSON 형식으로만 출력 (다른 텍스트 없이):
{"summary": "상품 요약 설명", "sellingPoints": ["포인트1", "포인트2", ...]}`;
}
