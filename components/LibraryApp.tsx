'use client';

import { useState, useMemo } from 'react';
import { Book, NewBook, SortOption } from '@/types';
import { useAuth } from './AuthProvider';
import { useLibrary } from '@/hooks/useLibrary';
import Header from './Header';
import FiltersBar from './FiltersBar';
import BooksGrid from './BooksGrid';
import AddBookModal from './AddBookModal';
import EditBookModal from './EditBookModal';
import DeleteModal from './DeleteModal';
import LoginScreen from './LoginScreen';

type ReadFilter = 'all' | 'read' | 'unread';

function getFilteredSorted(
  books: Book[],
  sortBy: SortOption,
  filterRating: number,
  authorSearch: string,
  readFilter: ReadFilter,
): Book[] {
  let list = [...books];
  if (filterRating > 0) list = list.filter((b) => b.rating >= filterRating);
  if (readFilter === 'read')   list = list.filter((b) => b.read ?? true);
  if (readFilter === 'unread') list = list.filter((b) => !(b.read ?? true));
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
  const { books, loading: booksLoading, addBook, updateBook, removeBook } = useLibrary(user?.uid ?? null);

  const [isAddOpen, setIsAddOpen]         = useState(false);
  const [editPending, setEditPending]     = useState<Book | null>(null);
  const [deletePending, setDeletePending] = useState<Book | null>(null);
  const [sortBy, setSortBy]               = useState<SortOption>('dateAdded');
  const [filterRating, setFilterRating]   = useState(0);
  const [authorSearch, setAuthorSearch]   = useState('');
  const [readFilter, setReadFilter]       = useState<ReadFilter>('all');

  const readCount   = useMemo(() => books.filter((b) => b.read ?? true).length, [books]);
  const unreadCount = useMemo(() => books.filter((b) => !(b.read ?? true)).length, [books]);

  const filtered = useMemo(
    () => getFilteredSorted(books, sortBy, filterRating, authorSearch, readFilter),
    [books, sortBy, filterRating, authorSearch, readFilter],
  );

  if (authLoading) {
    return <div className="full-loader"><span className="spinner spinner-lg" /></div>;
  }

  if (!user) return <LoginScreen />;

  async function handleSave(book: NewBook) {
    await addBook(book);
    setIsAddOpen(false);
  }

  async function handleUpdate(id: string, data: Partial<NewBook>) {
    await updateBook(id, data);
    setEditPending(null);
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
    setReadFilter('all');
  }

  return (
    <>
      <Header onAddBook={() => setIsAddOpen(true)} user={user} />

      <main>
        <FiltersBar
          bookCount={books.length}
          readCount={readCount}
          unreadCount={unreadCount}
          sortBy={sortBy}
          onSortChange={setSortBy}
          filterRating={filterRating}
          onRatingFilterChange={setFilterRating}
          authorSearch={authorSearch}
          onAuthorSearchChange={setAuthorSearch}
          readFilter={readFilter}
          onReadFilterChange={setReadFilter}
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
            onEditBook={setEditPending}
            onAddBook={() => setIsAddOpen(true)}
            onClearFilters={clearFilters}
          />
        )}
      </main>

      {isAddOpen && (
        <AddBookModal onClose={() => setIsAddOpen(false)} onSave={handleSave} />
      )}
      {editPending && (
        <EditBookModal book={editPending} onClose={() => setEditPending(null)} onSave={handleUpdate} />
      )}
      {deletePending && (
        <DeleteModal book={deletePending} onConfirm={handleDeleteConfirm} onCancel={() => setDeletePending(null)} />
      )}
    </>
  );
}
