'use client';

import { useState } from 'react';
import {
  ContentRatio,
  Persona,
  ProductConnection,
  StepSelections,
} from '@/types';

interface Props {
  titles: string[];
  onTitlesRequest: () => void;
  onRegenerateTitles: () => void;
  loadingTitles: boolean;
  onComplete: (selections: StepSelections) => void;
  started: boolean;
}

const PERSONAS: { label: string; value: Persona }[] = [
  { label: '아이 키우는 엄마', value: '아이 키우는 엄마' },
  { label: '자기관리에 철저한 직장인', value: '자기관리에 철저한 직장인' },
  { label: '피부 고민이 많은 예민러', value: '피부 고민이 많은 예민러' },
  { label: '뷰티에 관심 많은 20대', value: '뷰티에 관심 많은 20대' },
];

const CONTENT_RATIOS: { label: string; value: ContentRatio }[] = [
  { label: '경험 중심 (70% 경험 + 30% 정보)', value: 'experience' },
  { label: '균형형 (50% 경험 + 50% 정보)', value: 'balanced' },
  { label: '정보 중심 (30% 경험 + 70% 정보)', value: 'info' },
  { label: '순수 정보글 (100% 정보)', value: 'pure-info' },
];

const PRODUCT_CONNECTIONS: { label: string; value: ProductConnection }[] = [
  { label: '제품 자연스럽게 연결 (본문 중간에 제품 소개)', value: 'natural' },
  { label: '제품 마지막에 추천 (글 끝에 제품 링크)', value: 'end' },
  { label: '제품 언급 없이 정보글만', value: 'none' },
];

export default function StepSelector({
  titles,
  onTitlesRequest,
  onRegenerateTitles,
  loadingTitles,
  onComplete,
  started,
}: Props) {
  const [step, setStep] = useState(1);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [selectedPersona, setSelectedPersona] = useState<Persona>('');
  const [customPersona, setCustomPersona] = useState('');
  const [useCustomPersona, setUseCustomPersona] = useState(false);
  const [selectedRatio, setSelectedRatio] = useState<ContentRatio>('balanced');
  const [selectedConnection, setSelectedConnection] =
    useState<ProductConnection>('natural');

  if (!started) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          글 작성
        </h3>
        <button className="btn-primary w-full" onClick={onTitlesRequest}>
          글 작성 시작
        </button>
      </div>
    );
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return selectedTitle !== '';
      case 2:
        return useCustomPersona ? customPersona.trim() !== '' : selectedPersona !== '';
      case 3:
        return true;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      onComplete({
        title: selectedTitle,
        persona: useCustomPersona ? customPersona : selectedPersona,
        contentRatio: selectedRatio,
        productConnection: selectedConnection,
      });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          단계별 선택
        </h3>
        <span className="text-xs text-[var(--text-muted)]">
          Step {step}/4
        </span>
      </div>

      <div className="step-indicator">
        {[1, 2, 3, 4].map((s) => (
          <div
            key={s}
            className={`step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      {/* Step 1: 제목 선택 */}
      {step === 1 && (
        <div>
          <p className="text-sm font-medium mb-3">제목 선택</p>
          {loadingTitles ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="spinner" />
              <span className="text-sm text-[var(--text-muted)]">
                제목을 생성하고 있습니다...
              </span>
            </div>
          ) : titles.length > 0 ? (
            <div className="space-y-2">
              {titles.map((title, i) => (
                <div
                  key={i}
                  className={`radio-option ${selectedTitle === title ? 'selected' : ''}`}
                  onClick={() => setSelectedTitle(title)}
                >
                  <div
                    className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                    style={{
                      borderColor:
                        selectedTitle === title
                          ? 'var(--accent)'
                          : 'var(--border-hover)',
                    }}
                  >
                    {selectedTitle === title && (
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: 'var(--accent)' }}
                      />
                    )}
                  </div>
                  <span className="text-sm">{title}</span>
                </div>
              ))}
              <button
                className="btn-secondary text-sm mt-2"
                onClick={onRegenerateTitles}
                disabled={loadingTitles}
              >
                다른 제목 생성
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Step 2: 페르소나 선택 */}
      {step === 2 && (
        <div>
          <p className="text-sm font-medium mb-3">페르소나 선택</p>
          <div className="space-y-2">
            {PERSONAS.map((p) => (
              <div
                key={p.value}
                className={`radio-option ${!useCustomPersona && selectedPersona === p.value ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedPersona(p.value);
                  setUseCustomPersona(false);
                }}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor:
                      !useCustomPersona && selectedPersona === p.value
                        ? 'var(--accent)'
                        : 'var(--border-hover)',
                  }}
                >
                  {!useCustomPersona && selectedPersona === p.value && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </div>
                <span className="text-sm">{p.label}</span>
              </div>
            ))}
            <div
              className={`radio-option ${useCustomPersona ? 'selected' : ''}`}
              onClick={() => setUseCustomPersona(true)}
            >
              <div
                className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                style={{
                  borderColor: useCustomPersona
                    ? 'var(--accent)'
                    : 'var(--border-hover)',
                }}
              >
                {useCustomPersona && (
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: 'var(--accent)' }}
                  />
                )}
              </div>
              <div className="flex-1">
                <span className="text-sm">직접 입력</span>
                {useCustomPersona && (
                  <input
                    type="text"
                    value={customPersona}
                    onChange={(e) => setCustomPersona(e.target.value)}
                    placeholder="페르소나를 입력하세요"
                    className="mt-2"
                    onClick={(e) => e.stopPropagation()}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: 글 구성 비율 */}
      {step === 3 && (
        <div>
          <p className="text-sm font-medium mb-3">글 구성 비율 선택</p>
          <div className="space-y-2">
            {CONTENT_RATIOS.map((r) => (
              <div
                key={r.value}
                className={`radio-option ${selectedRatio === r.value ? 'selected' : ''}`}
                onClick={() => setSelectedRatio(r.value)}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor:
                      selectedRatio === r.value
                        ? 'var(--accent)'
                        : 'var(--border-hover)',
                  }}
                >
                  {selectedRatio === r.value && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </div>
                <span className="text-sm">{r.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: 제품 연결 방식 */}
      {step === 4 && (
        <div>
          <p className="text-sm font-medium mb-3">제품 연결 방식 선택</p>
          <div className="space-y-2">
            {PRODUCT_CONNECTIONS.map((c) => (
              <div
                key={c.value}
                className={`radio-option ${selectedConnection === c.value ? 'selected' : ''}`}
                onClick={() => setSelectedConnection(c.value)}
              >
                <div
                  className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                  style={{
                    borderColor:
                      selectedConnection === c.value
                        ? 'var(--accent)'
                        : 'var(--border-hover)',
                  }}
                >
                  {selectedConnection === c.value && (
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--accent)' }}
                    />
                  )}
                </div>
                <span className="text-sm">{c.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3 mt-4">
        {step > 1 && (
          <button className="btn-secondary flex-1" onClick={handleBack}>
            이전
          </button>
        )}
        <button
          className="btn-primary flex-1"
          onClick={handleNext}
          disabled={!canProceed()}
        >
          {step === 4 ? '글 생성하기' : '다음 단계'}
        </button>
      </div>
    </div>
  );
}
