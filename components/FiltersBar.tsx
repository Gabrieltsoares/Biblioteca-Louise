import { SortOption } from '@/types';

interface FiltersBarProps {
  bookCount: number;
  sortBy: SortOption;
  onSortChange: (v: SortOption) => void;
  filterRating: number;
  onRatingFilterChange: (v: number) => void;
  authorSearch: string;
  onAuthorSearchChange: (v: string) => void;
}

export default function FiltersBar({
  bookCount,
  sortBy,
  onSortChange,
  filterRating,
  onRatingFilterChange,
  authorSearch,
  onAuthorSearchChange,
}: FiltersBarProps) {
  return (
    <section className="filters-bar">
      <div className="stats">
        {bookCount} {bookCount === 1 ? 'livro' : 'livros'}
      </div>

      <div className="filters-group">
        <div className="filter-item">
          <label>Ordenar por</label>
          <select value={sortBy} onChange={(e) => onSortChange(e.target.value as SortOption)}>
            <option value="dateAdded">Mais recentes</option>
            <option value="title">Título A→Z</option>
            <option value="titleDesc">Título Z→A</option>
            <option value="author">Autor A→Z</option>
            <option value="rating">Maior nota</option>
            <option value="ratingAsc">Menor nota</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Nota mínima</label>
          <select
            value={filterRating}
            onChange={(e) => onRatingFilterChange(Number(e.target.value))}
          >
            <option value={0}>Todas as notas</option>
            <option value={5}>★★★★★ apenas</option>
            <option value={4}>★★★★ ou mais</option>
            <option value={3}>★★★ ou mais</option>
            <option value={2}>★★ ou mais</option>
          </select>
        </div>

        <div className="filter-item">
          <label>Buscar autor</label>
          <div className="input-icon-wrap">
            <svg className="input-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={authorSearch}
              onChange={(e) => onAuthorSearchChange(e.target.value)}
              placeholder="Nome do autor..."
            />
          </div>
        </div>
      </div>
    </section>
  );
}
