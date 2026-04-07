'use client';

import { useEffect } from 'react';
import { Book } from '@/types';

interface DeleteModalProps {
  book: Book;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteModal({ book, onConfirm, onCancel }: DeleteModalProps) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCancel]);

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="modal modal-sm">
        <div className="modal-header">
          <h2>Remover livro</h2>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            Remover <strong style={{ color: 'var(--text)' }}>&ldquo;{book.title}&rdquo;</strong> da sua biblioteca?
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-ghost flex-1" onClick={onCancel}>
              Cancelar
            </button>
            <button className="btn-danger flex-1" onClick={onConfirm}>
              Remover
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
