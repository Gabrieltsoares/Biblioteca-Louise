'use client';

import { useState, useEffect, useRef } from 'react';
import { Book, NewBook } from '@/types';

const RATING_LABELS = ['', 'Ruim', 'Regular', 'Bom', 'Ótimo', 'Excelente'];

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const MAX = 400;
        let { width, height } = img;
        if (width > height) {
          if (width > MAX) { height = (height * MAX) / width; width = MAX; }
        } else {
          if (height > MAX) { width = (width * MAX) / height; height = MAX; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width; canvas.height = height;
        canvas.getContext('2d')!.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = e.target!.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

interface EditBookModalProps {
  book: Book;
  onClose: () => void;
  onSave: (id: string, data: Partial<NewBook>) => Promise<void>;
}

export default function EditBookModal({ book, onClose, onSave }: EditBookModalProps) {
  const [title, setTitle]     = useState(book.title);
  const [author, setAuthor]   = useState(book.author);
  const [cover, setCover]     = useState(book.cover);
  const [rating, setRating]   = useState(book.rating);
  const [hoverRating, setHoverRating] = useState(0);
  const [read, setRead]       = useState(book.read ?? true);
  const [comment, setComment] = useState(book.comment ?? '');

  const [error, setError]           = useState('');
  const [saving, setSaving]         = useState(false);
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Selecione uma imagem válida.'); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError('Imagem deve ter menos de 5MB.'); return; }
    setUploadError('');
    try { setCover(await compressImage(file)); } catch { setUploadError('Não foi possível processar a imagem.'); }
    e.target.value = '';
  }

  async function handleSave() {
    if (!title.trim()) { setError('Por favor, informe o título.'); return; }
    if (!author.trim()) { setError('Por favor, informe o autor.'); return; }
    if (rating === 0) { setError('Por favor, atribua uma nota.'); return; }
    setSaving(true);
    try {
      await onSave(book.id, { title: title.trim(), author: author.trim(), cover, rating, read, comment: comment.trim() });
    } finally { setSaving(false); }
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2>Editar Livro</h2>
          <button className="modal-close" onClick={onClose} aria-label="Fechar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="modal-body">
          {/* Preview + fields */}
          <div className="book-form-preview">
            <div className="cover-upload-wrap">
              <div className="cover-preview-box cover-preview-clickable"
                onClick={() => fileInputRef.current?.click()} title="Clique para trocar a capa">
                {cover
                  // eslint-disable-next-line @next/next/no-img-element
                  ? <img src={cover} alt="Capa" />
                  : (<><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    </svg><span>Capa</span></>)}
                <div className="cover-upload-overlay">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
              </div>
              <div className="cover-actions">
                <button className="btn-upload-cover" type="button" onClick={() => fileInputRef.current?.click()}>
                  {cover ? 'Trocar' : 'Enviar capa'}
                </button>
                {cover && (
                  <button className="btn-remove-cover" type="button" onClick={() => { setCover(''); setUploadError(''); }}>✕</button>
                )}
              </div>
              {uploadError && <p className="upload-error">{uploadError}</p>}
              <input ref={fileInputRef} type="file" accept="image/*" className="file-input-hidden" onChange={handleFileChange} />
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

          {/* Read toggle */}
          <div className="form-section">
            <label className="form-label">Status de leitura</label>
            <div className="read-toggle">
              <button type="button" className={`toggle-btn${read ? ' toggle-active-read' : ''}`} onClick={() => setRead(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Lido
              </button>
              <button type="button" className={`toggle-btn${!read ? ' toggle-active-unread' : ''}`} onClick={() => setRead(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Não lido
              </button>
            </div>
          </div>

          {/* Stars */}
          <div className="form-section">
            <label className="form-label">Sua nota <span className="required">*</span></label>
            <div className="star-picker" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((val) => (
                <button key={val} className={`star-btn${displayRating >= val ? ' active' : ''}`}
                  onClick={() => { setRating(val); setError(''); }}
                  onMouseEnter={() => setHoverRating(val)}
                  aria-label={`${val} estrela${val > 1 ? 's' : ''}`}>★</button>
              ))}
            </div>
            <span className="rating-label">{displayRating > 0 ? RATING_LABELS[displayRating] : 'Selecione uma nota'}</span>
          </div>

          {/* Comment */}
          <div className="form-section">
            <label className="form-label">Comentário / Resenha</label>
            <textarea
              className="comment-textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="O que você achou deste livro? (opcional)"
              rows={4}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn-save" onClick={handleSave} disabled={saving}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </div>
      </div>
    </div>
  );
}
