'use client';

import { useState } from 'react';
import { Product } from '@/types';

interface Props {
  onClose: () => void;
  onSave: (product: Product) => void;
  aiSettings: { model: string; openaiKey: string; geminiKey: string };
}

export default function ProductModal({ onClose, onSave, aiSettings }: Props) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [sellingPoints, setSellingPoints] = useState<string[]>([]);
  const [selectedPoints, setSelectedPoints] = useState<Set<number>>(new Set());
  const [analyzing, setAnalyzing] = useState(false);
  const [summary, setSummary] = useState('');

  const analyzeUrl = async () => {
    if (!url.trim()) return;
    setAnalyzing(true);
    try {
      const apiKey = aiSettings.model === 'chatgpt' ? aiSettings.openaiKey : aiSettings.geminiKey;
      const res = await fetch('/api/analyze-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, model: aiSettings.model, apiKey }),
      });
      const data = await res.json();
      if (data.summary) setSummary(data.summary);
      if (data.sellingPoints) {
        setSellingPoints(data.sellingPoints);
        setSelectedPoints(new Set(data.sellingPoints.map((_: string, i: number) => i)));
      }
    } catch {
      alert('URL 분석에 실패했습니다.');
    } finally {
      setAnalyzing(false);
    }
  };

  const togglePoint = (index: number) => {
    setSelectedPoints((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleSave = () => {
    if (!name.trim()) return;
    const product: Product = {
      id: Date.now().toString(),
      name: name.trim(),
      description: description.trim(),
      url: url.trim() || undefined,
      sellingPoints: sellingPoints.filter((_, i) => selectedPoints.has(i)),
    };
    onSave(product);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">상품 추가</h2>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
          >
            닫기
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              상품명 <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="상품명을 입력하세요"
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              상품 설명
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상품에 대한 설명을 입력하세요"
              rows={3}
              style={{ resize: 'vertical' }}
            />
          </div>

          <div>
            <label className="block text-sm text-[var(--text-secondary)] mb-2">
              상세페이지 URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
              />
              <button
                className="btn-secondary whitespace-nowrap"
                onClick={analyzeUrl}
                disabled={!url.trim() || analyzing}
              >
                {analyzing ? 'URL 분석 중...' : 'URL 분석'}
              </button>
            </div>
          </div>

          {summary && (
            <div className="p-3 rounded-lg" style={{ backgroundColor: 'var(--bg-tertiary)' }}>
              <p className="text-sm text-[var(--text-secondary)]">{summary}</p>
            </div>
          )}

          {sellingPoints.length > 0 && (
            <div>
              <label className="block text-sm text-[var(--text-secondary)] mb-2">
                셀링포인트 선택
              </label>
              <div className="space-y-2">
                {sellingPoints.map((point, i) => (
                  <label key={i} className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedPoints.has(i)}
                      onChange={() => togglePoint(i)}
                      className="w-4 h-4 accent-[var(--accent)]"
                    />
                    <span className="text-sm">{point}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>
            취소
          </button>
          <button
            className="btn-primary flex-1"
            onClick={handleSave}
            disabled={!name.trim()}
          >
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
