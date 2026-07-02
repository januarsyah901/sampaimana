import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, User, AlertCircle } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Auth({ onLoginSuccess }) {
  const navigate = useNavigate();
  const location = useLocation();
  const isRegisterMode = location.pathname === '/register';

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const endpoint = isRegisterMode ? 'register' : 'login';
    const payload = isRegisterMode ? { name, email, password } : { email, password };

    fetch(`${API_BASE_URL}/auth/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          const token = res.data?.accessToken;
          const refreshToken = res.data?.refreshToken;
          
          if (token) {
            localStorage.setItem('token', token);
          }
          if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
          }

          // Trigger state reload in App
          if (onLoginSuccess) {
            onLoginSuccess(token);
          }

          navigate('/');
        } else {
          throw new Error(res.message || 'Kredensial tidak valid');
        }
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Terjadi kesalahan sistem.');
        setLoading(false);
      });
  };

  return (
    <div className="auth-page flex-center container">
      <div className="auth-card card-shadow">
        <div className="auth-header text-center">
          <div className="auth-icon-wrapper flex-center">
            <ShieldCheck size={28} />
          </div>
          <h1 className="font-display">{isRegisterMode ? 'Daftar Kontributor' : 'Masuk Akun'}</h1>
          <p className="subtitle">
            {isRegisterMode
              ? 'Mulai berkontribusi menyajikan data perkembangan kasus hukum.'
              : 'Masuk untuk berkontribusi melacak perkembangan kasus.'}
          </p>
        </div>

        {error && (
          <div className="auth-error flex-center">
            <AlertCircle size={16} /> <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          {isRegisterMode && (
            <div className="form-group">
              <label className="form-label">Nama Lengkap</label>
              <div className="input-with-icon">
                <User size={16} className="input-icon" />
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap Anda"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="form-input"
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Alamat Email</label>
            <div className="input-with-icon">
              <Mail size={16} className="input-icon" />
              <input
                type="email"
                required
                placeholder="email@domain.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="input-icon" />
              <input
                type="password"
                required
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? 'Memproses...' : isRegisterMode ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="auth-footer text-center">
          {isRegisterMode ? (
            <p>
              Sudah memiliki akun? <Link to="/login">Masuk di sini</Link>
            </p>
          ) : (
            <p>
              Belum terdaftar? <Link to="/register">Daftar Kontributor</Link>
            </p>
          )}
        </div>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          padding: 0;
          background: linear-gradient(135deg, var(--surface-page) 0%, var(--surface-canvas) 100%);
        }
        .auth-card {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          width: 100%;
          max-width: 440px;
          padding: 40px 36px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-lg);
          animation: scale-in 0.4s var(--ease-spring) forwards;
          opacity: 0;
        }
        .auth-header {
          margin-bottom: 28px;
          text-align: center;
        }
        .auth-icon-wrapper {
          width: 60px;
          height: 60px;
          border-radius: var(--radius-avatars);
          background: linear-gradient(135deg, var(--color-apricot-wash), #fff);
          color: var(--color-rust);
          margin: 0 auto 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 12px rgba(93, 42, 26, 0.1);
        }
        .auth-header h1 {
          font-size: 26px;
          margin-bottom: 8px;
          color: var(--color-ink);
        }
        .auth-header .subtitle {
          font-size: 14px;
          color: var(--color-ash);
          line-height: 1.5;
          max-width: 320px;
          margin: 0 auto;
        }
        .auth-error {
          background-color: #fef2f2;
          color: #ef4444;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: 20px;
          font-size: 13px;
          font-weight: 500;
          gap: 8px;
          justify-content: flex-start;
          border: 1px solid rgba(239, 68, 68, 0.1);
        }
        .auth-form {
          display: flex;
          flex-direction: column;
        }
        .input-with-icon {
          position: relative;
          display: flex;
        }
        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-graphite);
          pointer-events: none;
          transition: color 0.2s ease;
        }
        .input-with-icon:focus-within .input-icon {
          color: var(--color-ink);
        }
        .input-with-icon .form-input {
          padding-left: 44px;
          width: 100%;
        }
        .w-full {
          width: 100%;
        }
        .auth-footer {
          margin-top: 28px;
          font-size: 14px;
          color: var(--color-ash);
          text-align: center;
        }
        .auth-footer a {
          color: var(--color-rust);
          text-decoration: none;
          font-weight: 600;
          transition: color 0.2s ease;
        }
        .auth-footer a:hover {
          color: var(--color-rust-light);
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}

export default Auth;
