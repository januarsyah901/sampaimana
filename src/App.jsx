import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Explore from './pages/Explore';
import CaseDetail from './pages/CaseDetail';
import Auth from './pages/Auth';
import Contributor from './pages/Contributor';
import Admin from './pages/Admin';
import Toast from './components/Toast';
import { API_BASE_URL } from './config';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Toast state
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = useCallback((message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
  }, []);

  const handleCloseToast = useCallback(() => {
    setToastMessage('');
  }, []);

  // Standard API Fetch Wrapper with automatic token refresh on 401
  const apiFetch = useCallback(async (url, options = {}) => {
    let token = localStorage.getItem('token');
    
    // Set headers
    const headers = {
      ...(options.headers || {}),
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const fetchOptions = {
      ...options,
      headers
    };

    try {
      let response = await fetch(url, fetchOptions);
      
      // Auto-refresh token if 401 Unauthorized
      if (response.status === 401) {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('🔄 Attempting to refresh access token...');
          const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            const newToken = refreshData.data?.accessToken;
            if (refreshData.success && newToken) {
              // Store new token
              localStorage.setItem('token', newToken);
              if (refreshData.data?.refreshToken) {
                localStorage.setItem('refreshToken', refreshData.data.refreshToken);
              }
              
              // Retry original request with new token
              fetchOptions.headers['Authorization'] = `Bearer ${newToken}`;
              console.log('✅ Token refreshed. Retrying original request.');
              response = await fetch(url, fetchOptions);
            }
          } else {
            // Refresh token expired or invalid
            console.log('❌ Refresh token failed. Logging out.');
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            setUser(null);
            showToast('Sesi Anda telah berakhir. Silakan masuk kembali.', 'error');
          }
        }
      }
      
      return response;
    } catch (error) {
      console.error('API Fetch Error:', error);
      throw error;
    }
  }, [showToast]);

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
    showToast('Masuk berhasil! Selamat datang kembali.', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setUser(null);
    showToast('Anda telah keluar dari akun.', 'info');
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
            <Route path="/" element={<Home apiFetch={apiFetch} showToast={showToast} />} />
            <Route path="/explore" element={<Explore apiFetch={apiFetch} showToast={showToast} />} />
            <Route path="/cases/:id" element={<CaseDetail apiFetch={apiFetch} showToast={showToast} />} />
            
            <Route 
              path="/login" 
              element={user ? <Navigate to="/" /> : <Auth onLoginSuccess={handleLoginSuccess} showToast={showToast} />} 
            />
            <Route 
              path="/register" 
              element={user ? <Navigate to="/" /> : <Auth onLoginSuccess={handleLoginSuccess} showToast={showToast} />} 
            />
            
            <Route 
              path="/contributions" 
              element={user ? <Contributor user={user} apiFetch={apiFetch} showToast={showToast} /> : <Navigate to="/login" />} 
            />
            
            <Route 
              path="/admin" 
              element={
                user && (user.role === 'SUPER_ADMIN' || user.role === 'EDITOR') 
                  ? <Admin user={user} apiFetch={apiFetch} showToast={showToast} /> 
                  : <Navigate to="/" />
              } 
            />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Global Toast Container */}
        <div className="toast-container">
          <Toast message={toastMessage} type={toastType} onClose={handleCloseToast} />
        </div>
      </div>
    </Router>
  );
}

export default App;
