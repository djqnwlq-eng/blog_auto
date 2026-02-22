import { Product, AISettings } from '@/types';

const PRODUCTS_KEY = 'blog-writer-products';
const AI_SETTINGS_KEY = 'blog-writer-ai-settings';

export function getProducts(): Product[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(PRODUCTS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveProducts(products: Product[]) {
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
}

export function getAISettings(): AISettings {
  if (typeof window === 'undefined') {
    return { model: 'chatgpt', openaiKey: '', geminiKey: '' };
  }
  const data = localStorage.getItem(AI_SETTINGS_KEY);
  return data
    ? JSON.parse(data)
    : { model: 'chatgpt', openaiKey: '', geminiKey: '' };
}

export function saveAISettings(settings: AISettings) {
  localStorage.setItem(AI_SETTINGS_KEY, JSON.stringify(settings));
}
