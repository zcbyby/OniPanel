import { useState, useEffect } from 'react';
import './Login.css';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginPath, setLoginPath] = useState('');

  useEffect(() => {
    fetch('/api/login-path')
      .then(res => res.json())
      .then(data => setLoginPath(data.loginPath))
      .catch(() => setLoginPath('/api/login'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!loginPath) return;

    try {
      const response = await fetch(loginPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Login failed');
        setLoading(false);
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      onLoginSuccess(data.user);
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="win-login-page">
      <div className="win-login-card">
        <div className="win-login-header">
          <div className="win-logo">
            <svg viewBox="0 0 24 24" width="44" height="44" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
          </div>
          <h2 className="win-login-title">Sign in to OKPanel</h2>
          <p className="win-login-subtitle">Monitor your Linux server in real-time</p>
        </div>

        <form onSubmit={handleSubmit} className="win-login-form">
          <div className="win-input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="win-input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && <div className="win-error">{error}</div>}

          <button type="submit" disabled={loading} className="win-login-btn">
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <div className="win-login-footer">
          <p>Default: admin / admin</p>
        </div>
      </div>
    </div>
  );
}
