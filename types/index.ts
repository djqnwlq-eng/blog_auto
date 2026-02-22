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

export type Persona =
  | '아이 키우는 엄마'
  | '자기관리에 철저한 직장인'
  | '피부 고민이 많은 예민러'
  | '뷰티에 관심 많은 20대'
  | string;

export type ContentRatio =
  | 'experience' // 경험 중심 70/30
  | 'balanced'   // 균형형 50/50
  | 'info'       // 정보 중심 30/70
  | 'pure-info'; // 순수 정보글 100

export type ProductConnection =
  | 'natural'    // 본문 중간에 자연스럽게
  | 'end'        // 글 끝에 추천
  | 'none';      // 제품 언급 없음

export interface StepSelections {
  title: string;
  persona: Persona;
  contentRatio: ContentRatio;
  productConnection: ProductConnection;
}

export interface GeneratedContent {
  title: string;
  body: string;
}

export interface ThreadContent {
  main: string;
  comments: string[];
}
