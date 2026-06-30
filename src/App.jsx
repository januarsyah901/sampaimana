import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CaseDetail from './pages/CaseDetail';
import Auth from './pages/Auth';
import Contributor from './pages/Contributor';
import Admin from './pages/Admin';
import { API_BASE_URL } from './config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user profile on launch
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile(token);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = (token) => {
    fetch(`${API_BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((res) => {
        if (!res.ok) {
          // Token is likely invalid or expired
          localStorage.removeItem('token');
          localStorage.removeItem('refreshToken');
          setUser(null);
          throw new Error('Sesi kedaluwarsa');
        }
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setUser(res.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const handleLoginSuccess = (token) => {
    fetchUserProfile(token);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="app-loading flex-center">
        <div className="loading-spinner"></div>
        <style>{`
          .app-loading {
            height: 100vh;
            display: flex;
            flex-direction: column;
            gap: 16px;
            background-color: var(--surface-canvas);
          }
          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid var(--color-fog);
            border-top-color: var(--color-ink);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <Router>
      <div className="layout-wrapper">
        <Navbar user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/explore" element={<Explore />} />
            <Route path="/cases/:id" element={<CaseDetail />} />
            
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Auth onLoginSuccess={handleLoginSuccess} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Auth onLoginSuccess={handleLoginSuccess} />} 
            />
            
            <Route 
              path="/contributions" 
              element={user ? <Contributor user={user} /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/admin" 
              element={
                user && (user.role === 'SUPER_ADMIN' || user.role === 'EDITOR') 
                  ? <Admin user={user} /> 
                  : <Navigate to="/" />
              } 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
