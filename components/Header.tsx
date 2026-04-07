'use client';

import Image from 'next/image';
import { User } from 'firebase/auth';
import { useAuth } from './AuthProvider';

interface HeaderProps {
  onAddBook: () => void;
  user: User;
}

export default function Header({ onAddBook, user }: HeaderProps) {
  const { signOut } = useAuth();

  return (
    <header>
      <div className="header-inner">
        <div className="logo">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <h1>
            Biblioteca Virtual <span>Louise</span>
          </h1>
        </div>

        <div className="header-right">
          <button className="btn-add" onClick={onAddBook}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Adicionar Livro
          </button>

          <div className="user-menu">
            {user.photoURL ? (
              <Image
                src={user.photoURL}
                alt={user.displayName ?? 'Usuária'}
                width={34}
                height={34}
                className="user-avatar"
              />
            ) : (
              <div className="user-avatar user-avatar-fallback">
                {user.displayName?.[0] ?? user.email?.[0] ?? '?'}
              </div>
            )}
            <span className="user-name">{user.displayName?.split(' ')[0]}</span>
            <button className="btn-signout" onClick={signOut} title="Sair">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
