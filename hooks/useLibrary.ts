'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import { Book, NewBook } from '@/types';

export function useLibrary(userId: string | null) {
  const [books, setBooks]     = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setBooks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // getDb() called inside useEffect — browser only
    const db = getDb();
    const q = query(
      collection(db, 'users', userId, 'books'),
      orderBy('dateAdded', 'desc'),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setBooks(
        snapshot.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Book, 'id'>) })),
      );
      setLoading(false);
    });

    return unsubscribe;
  }, [userId]);

  async function addBook(book: NewBook) {
    if (!userId) return;
    const db = getDb();
    await addDoc(collection(db, 'users', userId, 'books'), book);
  }

  async function removeBook(id: string) {
    if (!userId) return;
    const db = getDb();
    await deleteDoc(doc(db, 'users', userId, 'books', id));
  }

  return { books, loading, addBook, removeBook };
}
