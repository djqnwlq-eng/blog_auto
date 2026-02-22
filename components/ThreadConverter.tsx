'use client';

import { useState } from 'react';
import { ThreadContent } from '@/types';

interface Props {
  thread: ThreadContent;
}

export default function ThreadConverter({ thread }: Props) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyText = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-4">
        스레드 변환 결과
      </h3>

      <div className="space-y-4">
        {/* Main thread */}
        <div
          className="p-4 rounded-lg"
          style={{ backgroundColor: 'var(--bg-tertiary)' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-[var(--text-muted)]">메인 글</span>
            <button
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              onClick={() => copyText(thread.main, -1)}
            >
              {copiedIndex === -1 ? '복사됨' : '복사'}
            </button>
          </div>
          <p className="text-sm leading-relaxed">{thread.main}</p>
        </div>

        {/* Comments */}
        {thread.comments.map((comment, i) => (
          <div
            key={i}
            className="p-4 rounded-lg"
            style={{ backgroundColor: 'var(--bg-tertiary)' }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-[var(--text-muted)]">
                이어지는 댓글 {i + 1}
              </span>
              <button
                className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                onClick={() => copyText(comment, i)}
              >
                {copiedIndex === i ? '복사됨' : '복사'}
              </button>
            </div>
            <p className="text-sm leading-relaxed">{comment}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
