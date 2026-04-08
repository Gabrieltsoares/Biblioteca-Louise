'use client';

import { useState } from 'react';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
  onDelete: (book: Book) => void;
  onEdit: (book: Book) => void;
}

export default function BookCard({ book, onDelete, onEdit }: BookCardProps) {
  const [imgError, setImgError] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const isRead = book.read ?? true;

  return (
    <article className={`book-card ${isRead ? 'book-read' : 'book-unread'}`}>

      <div className="book-cover-wrap">
        {book.cover && !imgError ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={book.cover} alt={book.title} onError={() => setImgError(true)} />
        ) : (
          <div className="no-cover-placeholder">
            <div className="initial">{book.title[0]?.toUpperCase() ?? '?'}</div>
          </div>
        )}

        {/* Unread dimming overlay */}
        {!isRead && <div className="unread-overlay" />}

        {/* Prominent status banner */}
        <div className={`status-banner ${isRead ? 'banner-read' : 'banner-unread'}`}>
          {isRead ? (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Lido
            </>
          ) : (
            <>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Na fila
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="card-actions">
          <button className="card-action-btn edit-btn" onClick={() => onEdit(book)} title="Editar livro">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="card-action-btn delete-btn" onClick={() => onDelete(book)} title="Remover livro">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      {/* Colored bottom border indicator */}
      <div className={`card-status-bar ${isRead ? 'bar-read' : 'bar-unread'}`} />

      <div className="book-info">
        <div className="book-title-card">{book.title}</div>
        <div className="book-author-card">{book.author}</div>
        <div className="book-rating-display">
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} className={`star-display${i < book.rating ? ' filled' : ''}`}>★</span>
          ))}
        </div>

        {book.comment && (
          <div className="card-comment-wrap">
            <button className="comment-toggle" onClick={() => setShowComment((v) => !v)}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              {showComment ? 'Ocultar resenha' : 'Ver resenha'}
            </button>
            {showComment && <p className="card-comment-text">{book.comment}</p>}
          </div>
        )}
      </div>
    </article>
  );
}
