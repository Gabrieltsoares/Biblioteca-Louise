import { Book } from '@/types';
import BookCard from './BookCard';

interface BooksGridProps {
  books: Book[];
  totalBooks: number;
  onDeleteBook: (book: Book) => void;
  onAddBook: () => void;
  onClearFilters: () => void;
}

export default function BooksGrid({
  books,
  totalBooks,
  onDeleteBook,
  onAddBook,
  onClearFilters,
}: BooksGridProps) {
  if (totalBooks === 0) {
    return (
      <div className="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        </svg>
        <h2>Sua biblioteca está vazia</h2>
        <p>Adicione seu primeiro livro lido para começar sua coleção.</p>
        <button className="btn-add" onClick={onAddBook}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Adicionar Livro
        </button>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="no-filter-results">
        <p>Nenhum livro encontrado com os filtros aplicados.</p>
        <button className="btn-ghost" onClick={onClearFilters}>
          Limpar filtros
        </button>
      </div>
    );
  }

  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard key={book.id} book={book} onDelete={onDeleteBook} />
      ))}
    </div>
  );
}
