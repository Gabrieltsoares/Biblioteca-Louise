'use client';

import { useState, useMemo } from 'react';
import { Book, NewBook, SortOption } from '@/types';
import { useAuth } from './AuthProvider';
import { useLibrary } from '@/hooks/useLibrary';
import Header from './Header';
import FiltersBar from './FiltersBar';
import BooksGrid from './BooksGrid';
import AddBookModal from './AddBookModal';
import DeleteModal from './DeleteModal';
import LoginScreen from './LoginScreen';

function getFilteredSorted(
  books: Book[],
  sortBy: SortOption,
  filterRating: number,
  authorSearch: string,
): Book[] {
  let list = [...books];
  if (filterRating > 0) list = list.filter((b) => b.rating >= filterRating);
  const q = authorSearch.trim().toLowerCase();
  if (q) list = list.filter((b) => b.author.toLowerCase().includes(q));
  switch (sortBy) {
    case 'title':     list.sort((a, b) => a.title.localeCompare(b.title, 'pt')); break;
    case 'titleDesc': list.sort((a, b) => b.title.localeCompare(a.title, 'pt')); break;
    case 'author':    list.sort((a, b) => a.author.localeCompare(b.author, 'pt')); break;
    case 'rating':    list.sort((a, b) => b.rating - a.rating); break;
    case 'ratingAsc': list.sort((a, b) => a.rating - b.rating); break;
  }
  return list;
}

export default function LibraryApp() {
  const { user, loading: authLoading } = useAuth();
  const { books, loading: booksLoading, addBook, removeBook } = useLibrary(user?.uid ?? null);

  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [deletePending, setDeletePending] = useState<Book | null>(null);
  const [sortBy, setSortBy]               = useState<SortOption>('dateAdded');
  const [filterRating, setFilterRating]   = useState(0);
  const [authorSearch, setAuthorSearch]   = useState('');

  const filtered = useMemo(
    () => getFilteredSorted(books, sortBy, filterRating, authorSearch),
    [books, sortBy, filterRating, authorSearch],
  );

  // Auth loading
  if (authLoading) {
    return (
      <div className="full-loader">
        <span className="spinner spinner-lg" />
      </div>
    );
  }

  // Not logged in
  if (!user) return <LoginScreen />;

  async function handleSave(book: NewBook) {
    await addBook(book);
    setIsAddOpen(false);
  }

  async function handleDeleteConfirm() {
    if (deletePending) {
      await removeBook(deletePending.id);
      setDeletePending(null);
    }
  }

  function clearFilters() {
    setSortBy('dateAdded');
    setFilterRating(0);
    setAuthorSearch('');
  }

  return (
    <>
      <Header onAddBook={() => setIsAddOpen(true)} user={user} />

      <main>
        <FiltersBar
          bookCount={books.length}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterRating={filterRating}
          onRatingFilterChange={setFilterRating}
          authorSearch={authorSearch}
          onAuthorSearchChange={setAuthorSearch}
        />

        {booksLoading ? (
          <div className="full-loader" style={{ minHeight: '40vh' }}>
            <span className="spinner spinner-lg" />
          </div>
        ) : (
          <BooksGrid
            books={filtered}
            totalBooks={books.length}
            onDeleteBook={setDeletePending}
            onAddBook={() => setIsAddOpen(true)}
            onClearFilters={clearFilters}
          />
        )}
      </main>

      {isAddOpen && (
        <AddBookModal onClose={() => setIsAddOpen(false)} onSave={handleSave} />
      )}

      {deletePending && (
        <DeleteModal
          book={deletePending}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletePending(null)}
        />
      )}
    </>
  );
}
