import { useState, useEffect } from 'react';
import {
  FluentProvider,
  webLightTheme,
  Input,
  Button,
  Text,
  Body1,
  Body2,
  Caption1,
  Card,
} from '@fluentui/react-components';
import { DesktopSignal24Regular } from '@fluentui/react-icons';

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
    <FluentProvider theme={webLightTheme}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #0078d4 0%, #005a9e 50%, #004578 100%)',
      }}>
        <Card style={{ 
          width: 400, 
          padding: 40, 
          background: 'white', 
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
        }}>
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              borderRadius: 12, 
              background: 'linear-gradient(135deg, #0078d4, #005a9e)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <DesktopSignal24Regular style={{ color: 'white', fontSize: 32 }} />
            </div>
            <Text style={{ fontSize: 24, fontWeight: 600, display: 'block' }}>Sign in to OniPanel</Text>
            <Caption1 style={{ color: '#666', display: 'block', marginTop: 4 }}>
              Monitor your Linux server in real-time
            </Caption1>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 20 }}>
              <Body2 style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Username</Body2>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e, data) => setUsername(data.value)}
                disabled={loading}
                required
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <Body2 style={{ display: 'block', marginBottom: 6, fontWeight: 500 }}>Password</Body2>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e, data) => setPassword(data.value)}
                disabled={loading}
                required
                style={{ width: '100%' }}
                size="large"
              />
            </div>

            {error && (
              <div style={{ 
                color: '#c42b1c', 
                background: '#fde7e9',
                padding: '10px 12px',
                borderRadius: 6,
                marginBottom: 16,
                fontSize: 13
              }}>
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              appearance="primary"
              style={{ width: '100%', height: 40 }}
              size="large"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>

          <div style={{ textAlign: 'center', color: '#666', fontSize: 12, marginTop: 24 }}>
            Default: admin / admin
          </div>
        </Card>
      </div>
    </FluentProvider>
  );
}
