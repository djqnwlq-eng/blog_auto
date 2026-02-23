'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GeneratedContent as ContentType } from '@/types';

interface Props {
  content: ContentType;
  onConvertThread: () => void;
  loadingThread: boolean;
}

export default function GeneratedContent({
  content,
  onConvertThread,
  loadingThread,
}: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    const text = `${content.title}\n\n${content.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-[var(--text-secondary)]">
          생성된 글
        </h3>
        <div className="flex gap-2">
          <button className="btn-secondary text-sm" onClick={copyToClipboard}>
            {copied ? '복사됨' : '복사'}
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-6">{content.title}</h2>

      <div className="markdown-content text-[var(--text-secondary)] leading-relaxed">
        <ReactMarkdown>{content.body}</ReactMarkdown>
      </div>

      <div className="mt-6 pt-6" style={{ borderTop: '1px solid var(--border)' }}>
        <button
          className="btn-secondary w-full"
          onClick={onConvertThread}
          disabled={loadingThread}
        >
          {loadingThread ? '변환 중...' : '공식 계정용 스레드 게시물로 변환'}
        </button>
      </div>
    </div>
  );
}
