export interface Product {
  id: string;
  name: string;
  description: string;
  url?: string;
  sellingPoints: string[];
}

export interface SubKeyword {
  keyword: string;
  selected: boolean;
}

export type AIModel = 'chatgpt' | 'gemini';

export interface AISettings {
  model: AIModel;
  openaiKey: string;
  geminiKey: string;
}

export type Persona = string;

export type ContentRatio =
  | 'experience'      // 경험 중심 70/30
  | 'experience-rec'  // 경험 + 추천 60/40
  | 'balanced'        // 균형형 50/50
  | 'info'            // 정보 중심 30/70
  | 'pure-info';      // 순수 정보글 100

export type ProductConnection =
  | 'ingredient'  // 주요성분 논리적 설명
  | 'diary'       // 일자별 사용후기
  | 'mixed'       // 성분 + 후기 믹싱
  | 'none';       // 제품 언급 없음

export interface StepSelections {
  persona: Persona;
  contentRatio: ContentRatio;
  productConnection: ProductConnection;
  title: string;
  subtitles: string[];
}

export interface GeneratedContent {
  title: string;
  body: string;
}

export interface ThreadContent {
  main: string;
  comments: string[];
}
