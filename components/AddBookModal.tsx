'use client';

import { useState, useEffect, useRef } from 'react';
import { NewBook, GoogleBookItem } from '@/types';

const RATING_LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'];

interface SearchResult {
  title: string;
  author: string;
  cover: string;
}

interface AddBookModalProps {
  onClose: () => void;
  onSave: (book: NewBook) => Promise<void>;
}

export default function AddBookModal({ onClose, onSave }: AddBookModalProps) {
  const [query, setQuery]           = useState('');
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const [title, setTitle]   = useState('');
  const [author, setAuthor] = useState('');
  const [cover, setCover]   = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  const [error, setError]   = useState('');
  const [saving, setSaving] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    searchInputRef.current?.focus();
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleSearch() {
    const q = query.trim();
    if (!q) return;
    setIsSearching(true);
    setShowResults(false);
    try {
      const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=10&fields=items(volumeInfo(title,authors,imageLinks))`;
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const data = await res.json();
      const items: GoogleBookItem[] = data.items || [];
      setResults(items.map((item) => {
        const info = item.volumeInfo;
        const rawCover = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
        return {
          title:  info.title || 'Sem título',
          author: info.authors ? info.authors.join(', ') : 'Autor desconhecido',
          cover:  rawCover.replace(/^http:\/\//, 'https://'),
        };
      }));
    } catch {
      setResults([]);
    } finally {
      setIsSearching(false);
      setShowResults(true);
    }
  }

  function handleSelect(r: SearchResult) {
    setTitle(r.title);
    setAuthor(r.author);
    setCover(r.cover);
    setShowResults(false);
    setError('');
  }

  async function handleSave() {
    if (!title.trim()) { setError('Por favor, informe o título do livro.'); return; }
    if (!author.trim()) { setError('Por favor, informe o nome do autor.'); return; }
    if (rating === 0)   { setError('Por favor, atribua uma nota ao livro.'); return; }

    setSaving(true);
    try {
      await onSave({
        title:     title.trim(),
        author:    author.trim(),
        cover,
        rating,
        dateAdded: new Date().toISOString(),
      });
    } finally {
      setSaving(false);
    }
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Adicionar Livro</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Search */}
          <div className="form-section">
            <label className="form-label">Buscar na base de livros</label>
            <div className="search-input-row">
              <div className="input-icon-wrap flex-1">
                <svg className="input-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Digite o título do livro..."
                />
              </div>
              <button className="btn-search" onClick={handleSearch} disabled={isSearching}>
                {isSearching ? <span className="spinner" /> : 'Buscar'}
              </button>
            </div>
            <p className="hint">Pesquise para encontrar a capa automaticamente, ou preencha os campos abaixo manualmente.</p>
          </div>

          {/* Results */}
          {showResults && (
            <div className="search-results">
              {results.length === 0 ? (
                <p className="results-message">Nenhum livro encontrado. Preencha os campos manualmente.</p>
              ) : results.map((r, i) => (
                <div key={i} className="result-item" onClick={() => handleSelect(r)}>
                  {r.cover
                    // eslint-disable-next-line @next/next/no-img-element
                    ? <img className="result-thumb" src={r.cover} alt={r.title} loading="lazy" />
                    : <div className="result-no-thumb">{r.title[0]}</div>
                  }
                  <div className="result-info">
                    <div className="result-title">{r.title}</div>
                    <div className="result-author">{r.author}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Preview + fields */}
          <div className="book-form-preview">
            <div className="cover-preview-box">
              {cover
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={cover} alt="Capa" />
                : (
                  <>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg>
                    <span>Capa</span>
                  </>
                )}
            </div>
            <div className="book-form-fields">
              <div className="form-group">
                <label className="form-label">Título <span className="required">*</span></label>
                <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); setError(''); }} placeholder="Título do livro" />
              </div>
              <div className="form-group">
                <label className="form-label">Autor <span className="required">*</span></label>
                <input type="text" value={author} onChange={(e) => { setAuthor(e.target.value); setError(''); }} placeholder="Nome do autor" />
              </div>
            </div>
          </div>

          {/* Stars */}
          <div className="form-section">
            <label className="form-label">Sua nota <span className="required">*</span></label>
            <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  className={`star-btn${displayRating >= val ? ' active' : ''}`}
                  onClick={() => { setRating(val); setError(''); }}
                  onMouseEnter={() => setHoverRating(val)}
                  aria-label={`${val} estrela${val > 1 ? 's' : ''}`}
                >★</button>
              ))}
            </div>
            <span className="rating-label">
              {displayRating > 0 ? RATING_LABELS[displayRating] : 'Selecione uma nota'}
            </span>
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar na Biblioteca'}
          </button>
        </div>
      </div>
    </div>
  );
}
