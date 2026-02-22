'use client';

import { useEffect, useState } from 'react';
import {
  Product,
  AISettings,
  SubKeyword,
  StepSelections,
  GeneratedContent as ContentType,
  ThreadContent,
} from '@/types';
import { getProducts, saveProducts, getAISettings, saveAISettings } from '@/lib/storage';
import ProductList from '@/components/ProductList';
import ApiSettings from '@/components/ApiSettings';
import KeywordInput from '@/components/KeywordInput';
import StepSelector from '@/components/StepSelector';
import GeneratedContent from '@/components/GeneratedContent';
import ThreadConverter from '@/components/ThreadConverter';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [aiSettings, setAiSettings] = useState<AISettings>({
    model: 'chatgpt',
    openaiKey: '',
    geminiKey: '',
  });
  const [keyword, setKeyword] = useState('');
  const [subKeywords, setSubKeywords] = useState<SubKeyword[]>([]);
  const [stepStarted, setStepStarted] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<ContentType | null>(null);
  const [generatingContent, setGeneratingContent] = useState(false);
  const [threadContent, setThreadContent] = useState<ThreadContent | null>(null);
  const [loadingThread, setLoadingThread] = useState(false);

  useEffect(() => {
    setProducts(getProducts());
    setAiSettings(getAISettings());
  }, []);

  const handleAddProduct = (product: Product) => {
    const updated = [...products, product];
    setProducts(updated);
    saveProducts(updated);
  };

  const handleDeleteProduct = (id: string) => {
    const updated = products.filter((p) => p.id !== id);
    setProducts(updated);
    saveProducts(updated);
    if (selectedProductId === id) setSelectedProductId(null);
  };

  const handleSelectProduct = (id: string) => {
    setSelectedProductId(selectedProductId === id ? null : id);
  };

  const handleSaveAISettings = (settings: AISettings) => {
    setAiSettings(settings);
    saveAISettings(settings);
  };

  const getSelectedProduct = () => {
    return products.find((p) => p.id === selectedProductId) || null;
  };

  const getProductInfoString = () => {
    const product = getSelectedProduct();
    if (!product) return '';
    let info = `상품명: ${product.name}`;
    if (product.description) info += `\n설명: ${product.description}`;
    if (product.sellingPoints.length > 0) {
      info += `\n셀링포인트: ${product.sellingPoints.join(', ')}`;
    }
    return info;
  };

  const getApiKey = () => {
    return aiSettings.model === 'chatgpt' ? aiSettings.openaiKey : aiSettings.geminiKey;
  };

  const getSelectedSubs = () =>
    subKeywords.filter((s) => s.selected).map((s) => s.keyword);

  const handleStart = () => {
    const apiKey = getApiKey();
    if (!apiKey) {
      alert('API 키를 먼저 설정해주세요.');
      return;
    }
    if (!keyword.trim()) {
      alert('키워드를 입력해주세요.');
      return;
    }
    setStepStarted(true);
    setGeneratedContent(null);
    setThreadContent(null);
  };

  const handleStepComplete = async (selections: StepSelections) => {
    const apiKey = getApiKey();
    if (!apiKey) return;

    setGeneratingContent(true);
    setGeneratedContent(null);
    setThreadContent(null);

    try {
      const product = getSelectedProduct();

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'content',
          model: aiSettings.model,
          apiKey,
          title: selections.title,
          keyword,
          subKeywords: getSelectedSubs(),
          persona: selections.persona,
          contentRatio: selections.contentRatio,
          productConnection: selections.productConnection,
          productInfo: getProductInfoString(),
          sellingPoints: product?.sellingPoints || [],
          subtitles: selections.subtitles,
        }),
      });

      const data = await res.json();
      if (data.content) {
        setGeneratedContent({
          title: selections.title,
          body: data.content,
        });
      } else {
        alert(data.error || '글 생성에 실패했습니다.');
      }
    } catch {
      alert('글 생성에 실패했습니다.');
    } finally {
      setGeneratingContent(false);
    }
  };

  const convertToThread = async () => {
    if (!generatedContent) return;
    const apiKey = getApiKey();
    if (!apiKey) return;

    setLoadingThread(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'thread',
          model: aiSettings.model,
          apiKey,
          blogContent: `${generatedContent.title}\n\n${generatedContent.body}`,
        }),
      });

      const data = await res.json();
      if (data.main && data.comments) {
        setThreadContent(data);
      } else {
        alert(data.error || '스레드 변환에 실패했습니다.');
      }
    } catch {
      alert('스레드 변환에 실패했습니다.');
    } finally {
      setLoadingThread(false);
    }
  };

  return (
    <main className="min-h-screen py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">블로그 글쓰기</h1>
          <p className="text-sm text-[var(--text-muted)]">
            효율적인 블로그 포스팅을 위한 AI 글쓰기 도구
          </p>
        </div>

        <div className="space-y-4">
          <ProductList
            products={products}
            selectedId={selectedProductId}
            onSelect={handleSelectProduct}
            onAdd={handleAddProduct}
            onDelete={handleDeleteProduct}
            aiSettings={aiSettings}
          />

          <KeywordInput
            keyword={keyword}
            onKeywordChange={setKeyword}
            subKeywords={subKeywords}
            onSubKeywordsChange={setSubKeywords}
            aiSettings={aiSettings}
          />

          <StepSelector
            onComplete={handleStepComplete}
            started={stepStarted}
            onStart={handleStart}
            keyword={keyword}
            subKeywords={getSelectedSubs()}
            productInfo={getProductInfoString()}
            aiSettings={aiSettings}
          />

          {generatingContent && (
            <div className="card flex items-center justify-center gap-3 py-12">
              <div className="spinner" />
              <span className="text-sm text-[var(--text-muted)]">
                글을 작성하고 있습니다...
              </span>
            </div>
          )}

          {generatedContent && !generatingContent && (
            <GeneratedContent
              content={generatedContent}
              onConvertThread={convertToThread}
              loadingThread={loadingThread}
            />
          )}

          {threadContent && <ThreadConverter thread={threadContent} />}

          <ApiSettings settings={aiSettings} onSave={handleSaveAISettings} />
        </div>
      </div>
    </main>
  );
}
