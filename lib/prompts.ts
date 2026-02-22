import { ContentRatio, ProductConnection } from '@/types';

const CONTENT_RATIO_LABELS: Record<ContentRatio, string> = {
  experience: '경험 중심 (70% 경험 + 30% 정보)',
  balanced: '균형형 (50% 경험 + 50% 정보)',
  info: '정보 중심 (30% 경험 + 70% 정보)',
  'pure-info': '순수 정보글 (100% 정보)',
};

const PRODUCT_CONNECTION_LABELS: Record<ProductConnection, string> = {
  natural: '제품 자연스럽게 연결 (본문 중간에 제품 소개)',
  end: '제품 마지막에 추천 (글 끝에 제품 링크)',
  none: '제품 언급 없이 정보글만',
};

export function buildTitlePrompt(
  keyword: string,
  subKeywords: string[],
  productInfo: string
): string {
  return `당신은 네이버 블로그 SEO 전문가입니다.
다음 정보를 바탕으로 클릭을 유도하는 블로그 제목 3개를 생성해주세요.

키워드: ${keyword}
서브키워드: ${subKeywords.join(', ')}
상품 정보: ${productInfo}

조건:
- 검색 의도에 맞는 제목
- 궁금증 유발 또는 해결책 제시 형태
- 25자 내외
- 숫자나 구체적 표현 포함

JSON 형식으로만 출력 (다른 텍스트 없이):
{"titles": ["제목1", "제목2", "제목3"]}`;
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
}): string {
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

작성 규칙:
1. 친근하고 자연스러운 어투 (존댓말)
2. 경험담은 구체적인 상황 묘사 포함
3. 정보는 신뢰할 수 있는 내용으로
4. 문단 사이에 [사진: 설명] 형태로 이미지 가이드 삽입
5. 총 1500-2000자
6. 제품 언급 시 광고 느낌 없이 자연스럽게

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
