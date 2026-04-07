'use client';

import { useState } from 'react';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
}

export default function BookCard({ book, onDelete }: BookCardProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <article className="book-card">
      <div className="book-cover-wrap">
        {book.cover && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover} alt={book.title} onError={() => setImgError(true)} />
        ) : (
          <div className="no-cover-placeholder">
            <div className="initial">{book.title[0]?.toUpperCase() ?? '?'}</div>
          </div>
        )}
        <button
          className="delete-btn"
          onClick={() => onDelete(book)}
          title="Remover livro"
          aria-label={`Remover ${book.title}`}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="book-info">
        <div className="book-title-card">{book.title}</div>
        <div className="book-author-card">{book.author}</div>
        <div className="book-rating-display">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star-display${i < book.rating ? ' filled' : ''}`}>★</span>
          ))}
        </div>
      </div>
    </article>
  );
}
