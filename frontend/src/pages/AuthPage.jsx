// frontend/src/pages/AuthPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (isLogin) {
      const result = await login(email, password);
      if (!result.success) setError(result.error || 'Login failed');
    } else {
      const result = await register(email, password, role);
      if (result.success) {
        setIsLogin(true);
        setError('');
        setEmail('');
        setPassword('');
      } else {
        setError(result.error || 'Registration failed');
      }
    }
    setLoading(false);
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <h1>{isLogin ? 'Welcome back' : 'Join us'}</h1>
            <p className="subtitle">{isLogin ? 'Sign in to continue' : 'Create your account'}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="        "
                required
                disabled={loading}
              />
            </div>

            {!isLogin && (
              <div className="form-group">
                <label>Role</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} disabled={loading}>
                  <option value="user">User</option>
                  <option value="moderator">Moderator</option>
                </select>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </form>

          {error && <div className="error-message">{error}</div>}

          <div className="toggle-mode">
            <span>{isLogin ? "Don't have an account?" : 'Already have an account?'}</span>
            <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} disabled={loading}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;