'use client';

import { useState } from 'react';
import { SubKeyword } from '@/types';
import { getAISettings } from '@/lib/storage';

interface Props {
  keyword: string;
  onKeywordChange: (keyword: string) => void;
  subKeywords: SubKeyword[];
  onSubKeywordsChange: (keywords: SubKeyword[]) => void;
  aiSettings: { model: string; openaiKey: string; geminiKey: string };
}

export default function KeywordInput({
  keyword,
  onKeywordChange,
  subKeywords,
  onSubKeywordsChange,
  aiSettings,
}: Props) {
  const [loading, setLoading] = useState(false);

  const getApiKey = () => {
    // props에서 먼저 확인
    const key = aiSettings.model === 'chatgpt' ? aiSettings.openaiKey : aiSettings.geminiKey;
    if (key) return key;
    // props가 아직 동기화되지 않았을 수 있으므로 localStorage에서 직접 읽기
    const stored = getAISettings();
    return stored.model === 'chatgpt' ? stored.openaiKey : stored.geminiKey;
  };

  const suggestKeywords = async () => {
    if (!keyword.trim()) return;
    const apiKey = getApiKey();
    if (!apiKey) {
      alert('API 키를 먼저 설정해주세요.');
      return;
    }
    setLoading(true);
    try {
      const currentModel = aiSettings.model || getAISettings().model;
      const res = await fetch('/api/suggest-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword, model: currentModel, apiKey }),
      });
      const data = await res.json();
      if (data.keywords) {
        onSubKeywordsChange(
          data.keywords.map((k: string) => ({ keyword: k, selected: false }))
        );
      } else {
        alert(data.error || '서브 키워드 추천에 실패했습니다.');
      }
    } catch (err) {
      alert('서브 키워드 추천에 실패했습니다: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setLoading(false);
    }
  };

  const toggleKeyword = (index: number) => {
    const updated = [...subKeywords];
    updated[index] = { ...updated[index], selected: !updated[index].selected };
    onSubKeywordsChange(updated);
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        키워드 입력
      </h3>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={keyword}
          onChange={(e) => onKeywordChange(e.target.value)}
          placeholder="메인 키워드를 입력하세요"
        />
        <button
          className="btn-secondary whitespace-nowrap"
          onClick={suggestKeywords}
          disabled={!keyword.trim() || loading}
        >
          {loading ? '추천 중...' : '서브키워드 추천'}
        </button>
      </div>

      {subKeywords.length > 0 && (
        <div>
          <p className="text-sm text-[var(--text-muted)] mb-2">추천 서브키워드:</p>
          <div className="flex flex-wrap gap-2">
            {subKeywords.map((sub, i) => (
              <label key={i} className="checkbox-item">
                <input
                  type="checkbox"
                  checked={sub.selected}
                  onChange={() => toggleKeyword(i)}
                  className="w-4 h-4 accent-[var(--accent)]"
                />
                <span className="text-sm">{sub.keyword}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
