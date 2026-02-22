'use client';

import { useState, useEffect, useRef } from 'react';
import { AIModel, AISettings } from '@/types';

interface Props {
  settings: AISettings;
  onSave: (settings: AISettings) => void;
}

export default function ApiSettings({ settings, onSave }: Props) {
  const [model, setModel] = useState<AIModel>(settings.model);
  const [openaiKey, setOpenaiKey] = useState(settings.openaiKey);
  const [geminiKey, setGeminiKey] = useState(settings.geminiKey);
  const [saved, setSaved] = useState(false);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // localStorage에서 불러온 값이 반영되도록 동기화
  useEffect(() => {
    setModel(settings.model);
    setOpenaiKey(settings.openaiKey);
    setGeminiKey(settings.geminiKey);
  }, [settings.model, settings.openaiKey, settings.geminiKey]);

  const showSaved = () => {
    setSaved(true);
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => setSaved(false), 1500);
  };

  const handleModelChange = (newModel: AIModel) => {
    setModel(newModel);
    onSave({ model: newModel, openaiKey, geminiKey });
    showSaved();
  };

  const handleKeyChange = (value: string) => {
    if (model === 'chatgpt') {
      setOpenaiKey(value);
      onSave({ model, openaiKey: value, geminiKey });
    } else {
      setGeminiKey(value);
      onSave({ model, openaiKey, geminiKey: value });
    }
    if (value.trim()) showSaved();
  };

  const currentKey = model === 'chatgpt' ? openaiKey : geminiKey;

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          AI 설정
        </h3>
        {saved && (
          <span className="text-xs text-[var(--accent)]">자동 저장됨</span>
        )}
      </div>

      <div className="flex gap-4 mb-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="ai-model"
            checked={model === 'chatgpt'}
            onChange={() => handleModelChange('chatgpt')}
            className="accent-[var(--accent)]"
          />
          <span className="text-sm">ChatGPT (gpt-4o)</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            name="ai-model"
            checked={model === 'gemini'}
            onChange={() => handleModelChange('gemini')}
            className="accent-[var(--accent)]"
          />
          <span className="text-sm">Gemini (2.5 Flash)</span>
        </label>
      </div>

      <input
        type="password"
        value={currentKey}
        onChange={(e) => handleKeyChange(e.target.value)}
        placeholder={`${model === 'chatgpt' ? 'OpenAI' : 'Gemini'} API Key 입력`}
      />

      {!currentKey.trim() && (
        <p className="text-xs text-red-400 mt-2">
          {model === 'chatgpt'
            ? 'OpenAI API 키를 입력해주세요.'
            : 'Gemini API 키를 입력해주세요. (aistudio.google.com 에서 무료 발급)'}
        </p>
      )}
    </div>
  );
}
