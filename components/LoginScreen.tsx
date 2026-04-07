'use client';

import { useState } from 'react';
import { useAuth } from './AuthProvider';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  async function handleSignIn() {
    setLoading(true);
    setError('');
    try {
      await signIn();
    } catch {
      setError('Não foi possível entrar. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
        </div>

        <h1 className="login-title">Biblioteca Virtual</h1>
        <p className="login-subtitle">Louise</p>
        <p className="login-desc">
          Sua coleção pessoal de livros lidos,<br />
          salva na nuvem e acessível em qualquer lugar.
        </p>

        <button
          className="btn-google"
          onClick={handleSignIn}
          disabled={loading}
        >
          {loading ? (
            <span className="spinner" />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"/>
              <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.6 16.1 19 13 24 13c3.1 0 5.8 1.1 7.9 2.9l5.7-5.7C34.5 6.5 29.5 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.2 0-9.7-3.3-11.3-8H6.4C9.7 35.6 16.3 44 24 44z"/>
              <path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2C37 38 44 32 44 24c0-1.3-.1-2.6-.4-3.9z"/>
            </svg>
          )}
          {loading ? 'Entrando…' : 'Entrar com Google'}
        </button>

        {error && <p className="login-error">{error}</p>}
      </div>

      {/* Decorative petals */}
      <div className="login-petal petal-1" aria-hidden="true" />
      <div className="login-petal petal-2" aria-hidden="true" />
      <div className="login-petal petal-3" aria-hidden="true" />
    </div>
  );
}
