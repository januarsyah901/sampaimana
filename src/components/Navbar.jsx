import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut, User, Shield, Menu, X } from 'lucide-react';

function Navbar({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isActive = (path) => location.pathname === path;

  // Pastels for avatars based on name length
  const pastelColors = ['#fbe1d1', '#d3e3fc', '#d1fae5', '#fef3c7'];
  const avatarBg = pastelColors[(user?.name?.length || 0) % pastelColors.length];

  return (
    <nav className={`navbar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          <span className="logo-text">Sampai Mana</span>
        </Link>

        <button 
          className="mobile-nav-toggle"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        <div className={`navbar-links ${mobileMenuOpen ? 'show' : ''}`}>
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Dashboard
          </Link>
          <Link to="/explore" className={`nav-link ${isActive('/explore') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
            Telusuri Kasus
          </Link>
          {user && (
            <Link to="/contributions" className={`nav-link ${isActive('/contributions') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              Kontribusi Saya
            </Link>
          )}
          {user && (user.role === 'SUPER_ADMIN' || user.role === 'EDITOR') && (
            <Link to="/admin" className={`nav-link admin-link ${isActive('/admin') ? 'active' : ''}`} onClick={() => setMobileMenuOpen(false)}>
              <Shield size={14} className="mr-1" /> Panel Admin
            </Link>
          )}
        </div>

        <div className={`navbar-actions ${mobileMenuOpen ? 'show' : ''}`}>
          {user ? (
            <div className="user-profile-menu" ref={dropdownRef}>
              <div className="avatar" style={{ backgroundColor: avatarBg }} onClick={() => setDropdownOpen((prev) => !prev)}>
                {getInitials(user.name)}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <p className="user-name">{user.name}</p>
                    <p className="user-email">{user.email}</p>
                    <span className={`role-badge role-${user.role.toLowerCase()}`}>{user.role}</span>
                  </div>
                  <hr className="dropdown-divider" />
                  {user.role === 'SUPER_ADMIN' || user.role === 'EDITOR' ? (
                    <Link to="/admin" className="dropdown-item" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>
                      <Shield size={16} /> Panel Admin
                    </Link>
                  ) : null}
                  <Link to="/contributions" className="dropdown-item" onClick={() => { setDropdownOpen(false); setMobileMenuOpen(false); }}>
                    <User size={16} /> Kontribusi Saya
                  </Link>
                  <button onClick={() => { onLogout(); setDropdownOpen(false); setMobileMenuOpen(false); }} className="dropdown-item logout-btn">
                    <LogOut size={16} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-secondary" onClick={() => setMobileMenuOpen(false)}>
                Masuk
              </Link>
              <Link to="/register" className="btn-primary" onClick={() => setMobileMenuOpen(false)}>
                Daftar Kontributor
              </Link>
            </div>
          )}
        </div>
      </div>
      <style>{`
        .navbar {
          background-color: var(--color-pure-white);
          border-bottom: 1px solid var(--color-fog);
          position: sticky;
          top: 0;
          z-index: 100;
          height: 68px;
          display: flex;
          align-items: center;
        }
        .navbar-container {
          max-width: var(--page-max-width);
          width: 100%;
          margin: 0 auto;
          padding: 0 var(--spacing-24);
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .navbar-logo {
          display: flex;
          align-items: center;
          gap: var(--spacing-8);
          text-decoration: none;
          font-family: var(--font-signifier);
          font-size: 20px;
          font-weight: 600;
          color: var(--color-ink);
        }
        .logo-text {
          font-family: var(--font-sohne);
          font-size: 17px;
          font-weight: 500;
          letter-spacing: -0.015em;
        }
        .navbar-links {
          display: flex;
          gap: var(--spacing-24);
          align-items: center;
        }
        .nav-link {
          text-decoration: none;
          color: var(--color-ash);
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.009em;
          padding: 8px 0;
          border-bottom: 2px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .nav-link:hover, .nav-link.active {
          color: var(--color-ink);
        }
        .nav-link.active {
          border-bottom-color: var(--color-ink);
        }
        .admin-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          color: var(--color-rust);
        }
        .admin-link:hover {
          color: var(--color-ink);
        }
        .mr-1 {
          margin-right: 4px;
        }
        .navbar-actions {
          display: flex;
          align-items: center;
          gap: var(--spacing-12);
        }
        .user-profile-menu {
          position: relative;
          cursor: pointer;
        }
        .avatar {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-avatars);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--color-ink);
          border: 1px solid var(--color-dove);
        }
        .user-dropdown {
          position: absolute;
          right: 0;
          top: 48px;
          background: var(--color-pure-white);
          border: 1px solid var(--color-dove);
          border-radius: var(--radius-inputs);
          box-shadow: var(--shadow-subtle);
          width: 240px;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          z-index: 200;
        }
        .dropdown-header {
          padding: 4px 8px 8px;
        }
        .user-name {
          font-weight: 500;
          font-size: 15px;
          color: var(--color-ink);
        }
        .user-email {
          font-size: 13px;
          color: var(--color-graphite);
          margin-bottom: 6px;
        }
        .role-badge {
          display: inline-block;
          font-size: 11px;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          background: var(--surface-fog);
          color: var(--color-ash);
        }
        .role-super_admin {
          background-color: #fef2f2;
          color: #ef4444;
        }
        .role-editor {
          background-color: #eff6ff;
          color: #3b82f6;
        }
        .dropdown-divider {
          border: 0;
          border-top: 1px solid var(--color-fog);
          margin: 6px 0;
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 10px;
          border-radius: 8px;
          text-decoration: none;
          color: var(--color-ash);
          font-size: 14px;
          transition: background 0.2s;
        }
        .dropdown-item:hover {
          background: var(--surface-fog);
          color: var(--color-ink);
        }
        .logout-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          cursor: pointer;
        }
        .logout-btn:hover {
          color: #ef4444;
          background: #fef2f2;
        }
        .auth-buttons {
          display: flex;
          align-items: center;
          gap: var(--spacing-16);
        }

        .mobile-nav-toggle {
          display: none;
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-ink);
          padding: 8px;
          z-index: 250;
        }

        @media (max-width: 768px) {
          .mobile-nav-toggle {
            display: block;
          }
          .navbar-links {
            display: none;
          }
          .navbar-links.show {
            display: flex;
            position: fixed;
            top: 68px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: var(--color-pure-white);
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
            z-index: 190;
            padding: 32px;
          }
          .navbar-links.show .nav-link {
            font-size: 20px;
            font-weight: 600;
          }
          .navbar-actions {
            display: none;
          }
          .navbar-actions.show {
            display: flex;
            position: fixed;
            bottom: 40px;
            left: 24px;
            right: 24px;
            z-index: 200;
            justify-content: center;
          }
          .auth-buttons {
            width: 100%;
            flex-direction: column;
            gap: 12px;
          }
          .auth-buttons .btn-primary,
          .auth-buttons .btn-secondary {
            width: 100%;
            padding: 14px;
            font-size: 15px;
            justify-content: center;
          }
          .user-profile-menu .user-dropdown {
            position: fixed;
            bottom: 100px;
            left: 24px;
            right: 24px;
            width: auto;
          }
        }
      `}</style>
    </nav>
  );
}

export default Navbar;
