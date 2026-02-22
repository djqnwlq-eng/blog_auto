'use client';

import { useState } from 'react';
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

  const handleModelChange = (newModel: AIModel) => {
    setModel(newModel);
    onSave({
      model: newModel,
      openaiKey,
      geminiKey,
    });
  };

  const handleSave = () => {
    onSave({ model, openaiKey, geminiKey });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const currentKey = model === 'chatgpt' ? openaiKey : geminiKey;
  const setCurrentKey = model === 'chatgpt' ? setOpenaiKey : setGeminiKey;
  const hasKey = currentKey.trim().length > 0;

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        AI 설정
      </h3>

      <div className="flex gap-4 mb-4">
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

      <div className="flex gap-2">
        <input
          type="password"
          value={currentKey}
          onChange={(e) => setCurrentKey(e.target.value)}
          placeholder={`${model === 'chatgpt' ? 'OpenAI' : 'Gemini'} API Key 입력`}
        />
        <button className="btn-primary whitespace-nowrap" onClick={handleSave}>
          {saved ? '저장됨' : '저장'}
        </button>
      </div>

      {!hasKey && (
        <p className="text-xs text-red-400 mt-2">
          {model === 'chatgpt'
            ? 'OpenAI API 키를 입력하고 저장해주세요.'
            : 'Gemini API 키를 입력하고 저장해주세요. (aistudio.google.com 에서 무료 발급)'}
        </p>
      )}
    </div>
  );
}
