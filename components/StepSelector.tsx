'use client';

import { useState, useEffect } from 'react';
import {
  ContentRatio,
  ProductConnection,
  StepSelections,
} from '@/types';

interface Props {
  onComplete: (selections: StepSelections) => void;
  started: boolean;
  onStart: () => void;
  keyword: string;
  subKeywords: string[];
  productInfo: string;
  aiSettings: { model: string; openaiKey: string; geminiKey: string };
}

const CONTENT_RATIOS: { label: string; desc: string; value: ContentRatio }[] = [
  { label: '경험 중심', desc: '70% 경험 + 30% 정보', value: 'experience' },
  { label: '경험 + 추천', desc: '60% 경험 + 40% 정보/추천', value: 'experience-rec' },
  { label: '균형형', desc: '50% 경험 + 50% 정보', value: 'balanced' },
  { label: '정보 중심', desc: '30% 경험 + 70% 정보', value: 'info' },
  { label: '순수 정보글', desc: '100% 정보', value: 'pure-info' },
];

const PRODUCT_CONNECTIONS: { label: string; desc: string; value: ProductConnection }[] = [
  { label: '성분 논리형', desc: '제품의 주요성분으로 논리적 설명', value: 'ingredient' },
  { label: '일자별 후기형', desc: '일자별 사용후기가 담긴 상세한 내용 공유', value: 'diary' },
  { label: '믹싱형', desc: '성분 설명 + 일자별 후기를 함께 활용', value: 'mixed' },
  { label: '정보글만', desc: '제품 언급 없이 정보글만', value: 'none' },
];

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
      style={{ borderColor: selected ? 'var(--accent)' : 'var(--border-hover)' }}
    >
      {selected && (
        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--accent)' }} />
      )}
    </div>
  );
}

const STEP_LABELS = ['페르소나', '글 구성 비율', '제품 연결 방식', '제목 선택', '글 구성 확인'];

export default function StepSelector({
  onComplete,
  started,
  onStart,
  keyword,
  subKeywords,
  productInfo,
  aiSettings,
}: Props) {
  const [step, setStep] = useState(1);

  // Step 1: Persona
  const [personas, setPersonas] = useState<string[]>([]);
  const [loadingPersonas, setLoadingPersonas] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState('');
  const [customPersona, setCustomPersona] = useState('');
  const [useCustomPersona, setUseCustomPersona] = useState(false);

  // Step 2: Content ratio
  const [selectedRatio, setSelectedRatio] = useState<ContentRatio>('experience-rec');

  // Step 3: Product connection
  const [selectedConnection, setSelectedConnection] = useState<ProductConnection>('mixed');

  // Step 4: Titles
  const [titles, setTitles] = useState<string[]>([]);
  const [loadingTitles, setLoadingTitles] = useState(false);
  const [selectedTitle, setSelectedTitle] = useState('');

  // Step 5: Subtitles
  const [subtitles, setSubtitles] = useState<string[]>([]);
  const [loadingSubtitles, setLoadingSubtitles] = useState(false);

  const getApiKey = () =>
    aiSettings.model === 'chatgpt' ? aiSettings.openaiKey : aiSettings.geminiKey;

  const callApi = async (action: string, extra: Record<string, unknown>) => {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action,
        model: aiSettings.model,
        apiKey: getApiKey(),
        ...extra,
      }),
    });
    return res.json();
  };

  // Step 1 진입: 페르소나 자동 생성
  useEffect(() => {
    if (started && step === 1 && personas.length === 0 && !loadingPersonas && keyword) {
      loadPersonas();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [started, step]);

  const loadPersonas = async () => {
    if (!getApiKey() || !keyword) return;
    setLoadingPersonas(true);
    try {
      const data = await callApi('personas', { keyword });
      if (data.personas) setPersonas(data.personas);
    } catch { /* 직접 입력으로 대체 가능 */ }
    finally { setLoadingPersonas(false); }
  };

  // Step 4 진입: 제목 자동 생성
  useEffect(() => {
    if (step === 4 && titles.length === 0 && !loadingTitles) {
      loadTitles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadTitles = async () => {
    if (!getApiKey()) return;
    setLoadingTitles(true);
    setSelectedTitle('');
    try {
      const persona = useCustomPersona ? customPersona : selectedPersona;
      const data = await callApi('titles', {
        keyword,
        subKeywords,
        productInfo,
        persona,
        contentRatio: selectedRatio,
        productConnection: selectedConnection,
      });
      if (data.titles) setTitles(data.titles);
      else alert(data.error || '제목 생성에 실패했습니다.');
    } catch { alert('제목 생성에 실패했습니다.'); }
    finally { setLoadingTitles(false); }
  };

  // Step 5 진입: 소제목 자동 생성
  useEffect(() => {
    if (step === 5 && subtitles.length === 0 && !loadingSubtitles) {
      loadSubtitles();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const loadSubtitles = async () => {
    if (!getApiKey()) return;
    setLoadingSubtitles(true);
    try {
      const persona = useCustomPersona ? customPersona : selectedPersona;
      const data = await callApi('subtitles', {
        keyword,
        subKeywords,
        persona,
        contentRatio: selectedRatio,
        productConnection: selectedConnection,
        title: selectedTitle,
      });
      if (data.subtitles) setSubtitles(data.subtitles);
      else alert(data.error || '소제목 생성에 실패했습니다.');
    } catch { alert('소제목 생성에 실패했습니다.'); }
    finally { setLoadingSubtitles(false); }
  };

  if (!started) {
    return (
      <div className="card">
        <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
          글 작성
        </h3>
        <button className="btn-primary w-full" onClick={onStart}>
          글 작성 시작
        </button>
      </div>
    );
  }

  const canProceed = () => {
    switch (step) {
      case 1: return useCustomPersona ? customPersona.trim() !== '' : selectedPersona !== '';
      case 2: return true;
      case 3: return true;
      case 4: return selectedTitle !== '';
      case 5: return subtitles.length > 0 && !loadingSubtitles;
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      onComplete({
        persona: useCustomPersona ? customPersona : selectedPersona,
        contentRatio: selectedRatio,
        productConnection: selectedConnection,
        title: selectedTitle,
        subtitles,
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
          {STEP_LABELS[step - 1]}
        </h3>
        <span className="text-xs text-[var(--text-muted)]">Step {step}/5</span>
      </div>

      <div className="step-indicator">
        {[1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`step-dot ${s === step ? 'active' : s < step ? 'completed' : ''}`}
          />
        ))}
      </div>

      {/* Step 1: 페르소나 */}
      {step === 1 && (
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            &quot;{keyword}&quot; 검색자에 맞는 글쓴이 설정
          </p>
          {loadingPersonas ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="spinner" />
              <span className="text-sm text-[var(--text-muted)]">페르소나를 생성하고 있습니다...</span>
            </div>
          ) : (
            <div className="space-y-2">
              {personas.map((p, i) => (
                <div
                  key={i}
                  className={`radio-option ${!useCustomPersona && selectedPersona === p ? 'selected' : ''}`}
                  onClick={() => { setSelectedPersona(p); setUseCustomPersona(false); }}
                >
                  <RadioDot selected={!useCustomPersona && selectedPersona === p} />
                  <span className="text-sm">{p}</span>
                </div>
              ))}
              <div
                className={`radio-option ${useCustomPersona ? 'selected' : ''}`}
                onClick={() => setUseCustomPersona(true)}
              >
                <RadioDot selected={useCustomPersona} />
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
              {personas.length > 0 && (
                <button
                  className="btn-secondary text-sm mt-2"
                  onClick={() => { setPersonas([]); setSelectedPersona(''); loadPersonas(); }}
                  disabled={loadingPersonas}
                >
                  다른 페르소나 생성
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Step 2: 글 구성 비율 */}
      {step === 2 && (
        <div>
          <div className="space-y-2">
            {CONTENT_RATIOS.map((r) => (
              <div
                key={r.value}
                className={`radio-option ${selectedRatio === r.value ? 'selected' : ''}`}
                onClick={() => setSelectedRatio(r.value)}
              >
                <RadioDot selected={selectedRatio === r.value} />
                <div>
                  <span className="text-sm font-medium">{r.label}</span>
                  <span className="text-xs text-[var(--text-muted)] ml-2">{r.desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 3: 제품 연결 방식 */}
      {step === 3 && (
        <div>
          <div className="space-y-2">
            {PRODUCT_CONNECTIONS.map((c) => (
              <div
                key={c.value}
                className={`radio-option ${selectedConnection === c.value ? 'selected' : ''}`}
                onClick={() => setSelectedConnection(c.value)}
              >
                <RadioDot selected={selectedConnection === c.value} />
                <div>
                  <span className="text-sm font-medium">{c.label}</span>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{c.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Step 4: 제목 선택 */}
      {step === 4 && (
        <div>
          {loadingTitles ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="spinner" />
              <span className="text-sm text-[var(--text-muted)]">
                선택한 구성에 맞는 제목을 생성하고 있습니다...
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
                  <RadioDot selected={selectedTitle === title} />
                  <span className="text-sm">{title}</span>
                </div>
              ))}
              <button
                className="btn-secondary text-sm mt-2"
                onClick={() => { setTitles([]); setSelectedTitle(''); loadTitles(); }}
                disabled={loadingTitles}
              >
                다른 제목 생성
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Step 5: 소제목 (글 구성 확인) */}
      {step === 5 && (
        <div>
          <p className="text-xs text-[var(--text-muted)] mb-3">
            질문형 롱테일 키워드 기반 소제목 구성
          </p>
          {loadingSubtitles ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <div className="spinner" />
              <span className="text-sm text-[var(--text-muted)]">소제목을 생성하고 있습니다...</span>
            </div>
          ) : subtitles.length > 0 ? (
            <div className="space-y-2">
              <div
                className="radio-option selected"
                style={{ cursor: 'default', opacity: 0.7 }}
              >
                <div className="text-xs text-[var(--text-muted)] font-medium w-16 flex-shrink-0">도입부</div>
                <span className="text-sm">페르소나 상황 묘사 + 공감 유도</span>
              </div>
              {subtitles.map((sub, i) => (
                <div
                  key={i}
                  className="radio-option selected"
                  style={{ cursor: 'default' }}
                >
                  <div className="text-xs font-medium w-16 flex-shrink-0" style={{ color: 'var(--accent)' }}>
                    소제목 {i + 1}
                  </div>
                  <span className="text-sm">{sub}</span>
                </div>
              ))}
              <button
                className="btn-secondary text-sm mt-2"
                onClick={() => { setSubtitles([]); loadSubtitles(); }}
                disabled={loadingSubtitles}
              >
                다른 소제목 생성
              </button>
            </div>
          ) : null}
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
          {step === 5 ? '이 구성으로 글 생성하기' : '다음 단계'}
        </button>
      </div>
    </div>
  );
}
