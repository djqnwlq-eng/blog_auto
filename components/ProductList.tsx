'use client';

import { useState } from 'react';
import { Product } from '@/types';
import ProductModal from './ProductModal';

interface Props {
  products: Product[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onAdd: (product: Product) => void;
  onDelete: (id: string) => void;
  aiSettings: { model: string; openaiKey: string; geminiKey: string };
}

export default function ProductList({
  products,
  selectedId,
  onSelect,
  onAdd,
  onDelete,
  aiSettings,
}: Props) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div className="card">
      <h3 className="text-sm font-medium text-[var(--text-secondary)] mb-3">
        내 상품 목록
      </h3>
      <div className="flex flex-wrap gap-2">
        {products.map((product) => (
          <div
            key={product.id}
            className={`tag ${selectedId === product.id ? 'selected' : ''}`}
            onClick={() => onSelect(product.id)}
          >
            <span>{product.name}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(product.id);
              }}
              className="text-[var(--text-muted)] hover:text-red-400 transition-colors text-xs ml-1"
            >
              X
            </button>
          </div>
        ))}
        <button
          className="tag hover:border-[var(--accent)]"
          onClick={() => setShowModal(true)}
        >
          <span className="text-[var(--text-muted)]">+ 상품 추가</span>
        </button>
      </div>

      {showModal && (
        <ProductModal
          onClose={() => setShowModal(false)}
          onSave={(product) => {
            onAdd(product);
            setShowModal(false);
          }}
          aiSettings={aiSettings}
        />
      )}
    </div>
  );
}
