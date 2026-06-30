import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Activity, Database, CheckCircle, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Home() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/stats`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat data statistik');
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setStats(res.data);
        } else {
          throw new Error(res.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="home-page">
        <section className="hero-section">
          <div className="container hero-container">
            <div className="skeleton skeleton-title" style={{ width: '80%', margin: '0 auto 24px', height: '48px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '60%', margin: '0 auto 12px' }}></div>
            <div className="skeleton skeleton-text" style={{ width: '40%', margin: '0 auto 32px' }}></div>
          </div>
        </section>

        <section className="stats-section container">
          <div className="stats-grid">
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
          </div>
        </section>

        <section className="dashboard-grid container">
          <div className="grid-2-col">
            <div className="visual-card card-shadow skeleton skeleton-card" style={{ height: '280px' }}></div>
            <div className="visual-card card-shadow skeleton skeleton-card" style={{ height: '280px' }}></div>
          </div>
        </section>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container container flex-center">
        <div className="error-card card-shadow">
          <h3>Error Loading Dashboard</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="btn-primary mt-4">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PELAPORAN': return 'Pelaporan';
      case 'PENYIDIKAN': return 'Penyidikan';
      case 'PENUNTUTAN': return 'Penuntutan';
      case 'PERSIDANGAN': return 'Persidangan';
      case 'PUTUSAN': return 'Putusan';
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    return `status-badge status-${status.toLowerCase()}`;
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow"></div>
        <div className="container hero-container">
          <h1 className="hero-title font-display">
            Pantau Kasus Hukum <br />
            <span>Sampai Mana</span> Sebenarnya.
          </h1>
          <p className="hero-subtitle">
            Platform transparansi hukum crowdsourced. Melacak setiap tahapan proses hukum publik dari Pelaporan hingga Putusan pengadilan secara terbuka dan akuntabel.
          </p>
          <div className="hero-actions">
            <Link to="/explore" className="btn-primary">
              Mulai Telusuri Kasus
            </Link>
            <Link to="/register" className="btn-secondary">
              Gabung Kontributor <ArrowRight size={16} className="arrow-icon" />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Cards Section */}
      <section className="stats-section container">
        <div className="stats-grid">
          <div className="stat-card card-shadow">
            <div className="stat-icon-wrapper flex-center">
              <Database size={20} className="stat-icon" />
            </div>
            <p className="stat-value">{stats.totals.cases}</p>
            <p className="stat-label">Total Kasus Hukum</p>
            <div className="stat-delta positive">
              <TrendingUp size={12} /> +12% minggu ini
            </div>
          </div>

          <div className="stat-card card-shadow">
            <div className="stat-icon-wrapper flex-center">
              <Activity size={20} className="stat-icon" />
            </div>
            <p className="stat-value">{stats.totals.activeCases}</p>
            <p className="stat-label">Kasus Aktif Dipantau</p>
            <div className="stat-delta positive">
              <CheckCircle size={12} /> Real-time tracking
            </div>
          </div>

          <div className="stat-card card-shadow highlight-card-warm">
            <div className="stat-icon-wrapper flex-center" style={{ backgroundColor: 'var(--color-rust)', color: 'white' }}>
              <FileText size={20} />
            </div>
            <p className="stat-value" style={{ color: 'var(--color-rust)' }}>
              {Object.values(stats.byStatus).reduce((a, b) => a + b, 0)}
            </p>
            <p className="stat-label">Total Tahapan Terverifikasi</p>
            <p className="stat-subtext">Diajukan & dimoderasi oleh publik</p>
          </div>
        </div>
      </section>

      {/* Main Grid Content */}
      <section className="dashboard-grid container">
        {/* Left Column: Visual Data Cards */}
        <div className="dashboard-visuals">
          <h2 className="section-title">Kategori & Status</h2>
          
          <div className="grid-2-col">
            {/* Warm Data Card - Apricot Wash */}
            <div className="visual-card warm-card">
              <h3>Tahapan Kasus</h3>
              <p className="card-subtitle">Distribusi tahapan hukum saat ini</p>
              <div className="status-bars">
                {Object.entries(stats.byStatus).map(([status, count]) => (
                  <div key={status} className="bar-row">
                    <span className="bar-label">{getStatusLabel(status)}</span>
                    <div className="bar-container">
                      <div 
                        className="bar-fill" 
                        style={{ 
                          width: `${stats.totals.cases ? (count / stats.totals.cases) * 100 : 0}%`,
                          backgroundColor: 'var(--color-rust)' 
                        }}
                      ></div>
                    </div>
                    <span className="bar-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Cool Data Card - Sky Wash */}
            <div className="visual-card cool-card">
              <h3>Kategori Perkara</h3>
              <p className="card-subtitle">Kasus berdasarkan klasifikasi hukum</p>
              <div className="category-list">
                {stats.byCategory.slice(0, 4).map((cat) => (
                  <div key={cat.id} className="category-row">
                    <span className="cat-name">{cat.name}</span>
                    <div className="cat-badge" style={{ backgroundColor: `${cat.color || 'var(--color-slate)'}1a`, color: cat.color || 'var(--color-slate)', fontWeight: 600 }}>
                      {cat.count} Kasus
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right/Bottom Section: Recent Cases */}
        <div className="recent-cases-section">
          <div className="section-header">
            <h2 className="section-title">Kasus Terbaru</h2>
            <Link to="/explore" className="btn-secondary">
              Lihat Semua Kasus <ArrowRight size={16} />
            </Link>
          </div>

          <div className="cases-list-card card-shadow">
            {stats.recentCases.length === 0 ? (
              <div className="empty-state">
                <p>Belum ada kasus aktif yang terdaftar.</p>
              </div>
            ) : (
              <div className="cases-table-wrapper">
                <table className="cases-table">
                  <thead>
                    <tr>
                      <th>Nomor Perkara / Judul</th>
                      <th>Kategori</th>
                      <th>Status Saat Ini</th>
                      <th>Tanggal Terdaftar</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentCases.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <div className="case-title-block">
                            <span className="case-number">{c.caseNumber}</span>
                            <span className="case-title">{c.title}</span>
                          </div>
                        </td>
                        <td>
                          <span className="category-tag" style={{ borderLeft: `3px solid ${c.category?.color || '#999'}` }}>
                            {c.category?.name || 'Umum'}
                          </span>
                        </td>
                        <td>
                          <span className={getStatusClass(c.currentStatus)}>
                            {getStatusLabel(c.currentStatus)}
                          </span>
                        </td>
                        <td>
                          {new Date(c.createdAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </td>
                        <td>
                          <Link to={`/cases/${c.id}`} className="btn-explore-case">
                            Detail
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
      
      <style>{`
        .home-page {
          padding-bottom: 80px;
        }
        .hero-section {
          position: relative;
          background-color: var(--surface-canvas);
          padding: 96px 0 64px;
          overflow: hidden;
          text-align: center;
        }
        .hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, var(--color-apricot-wash) 0%, rgba(255,255,255,0) 70%);
          opacity: 0.45;
          z-index: 1;
          pointer-events: none;
        }
        .hero-container {
          position: relative;
          z-index: 2;
          max-width: 800px;
        }
        .hero-title {
          font-size: var(--text-heading-lg);
          line-height: var(--leading-heading-lg);
          letter-spacing: var(--tracking-heading-lg);
          color: var(--color-ink);
          margin-bottom: var(--spacing-20);
        }
        .hero-title span {
          color: var(--color-rust);
        }
        .hero-subtitle {
          font-size: var(--text-body-lg);
          line-height: var(--leading-body-lg);
          color: var(--color-ash);
          margin-bottom: var(--spacing-32);
        }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-16);
        }
        .arrow-icon {
          margin-left: 6px;
          transition: transform 0.2s;
        }
        .btn-secondary:hover .arrow-icon {
          transform: translateX(4px);
        }
        .stats-section {
          margin-bottom: 48px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-24);
        }
        .stat-card {
          background-color: var(--surface-card);
          border-radius: var(--radius-cards);
          padding: var(--card-padding);
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .highlight-card-warm {
          background-color: var(--color-apricot-wash);
          border: 1px solid var(--color-rust);
        }
        .stat-icon-wrapper {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-avatars);
          background-color: var(--surface-fog);
          color: var(--color-graphite);
          margin-bottom: var(--spacing-16);
        }
        .stat-value {
          font-size: 36px;
          font-weight: 600;
          color: var(--color-ink);
          line-height: 1.1;
          margin-bottom: 4px;
        }
        .stat-label {
          font-size: 14px;
          color: var(--color-graphite);
          font-weight: 500;
        }
        .stat-delta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          margin-top: 12px;
        }
        .stat-delta.positive {
          color: #10b981;
        }
        .stat-subtext {
          font-size: 12px;
          color: var(--color-ash);
          margin-top: 12px;
        }
        .dashboard-grid {
          display: flex;
          flex-direction: column;
          gap: var(--spacing-40);
        }
        .section-title {
          font-family: var(--font-signifier);
          font-size: var(--text-heading-sm);
          color: var(--color-ink);
          margin-bottom: var(--spacing-16);
        }
        .grid-2-col {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: var(--spacing-24);
        }
        .visual-card {
          border-radius: var(--radius-cards);
          padding: var(--card-padding);
          display: flex;
          flex-direction: column;
        }
        .warm-card {
          background-color: var(--color-apricot-wash);
          border: 1px solid rgba(93, 42, 26, 0.1);
        }
        .cool-card {
          background-color: var(--color-sky-wash);
          border: 1px solid rgba(2, 132, 199, 0.1);
        }
        .visual-card h3 {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 2px;
        }
        .card-subtitle {
          font-size: 13px;
          color: var(--color-ash);
          margin-bottom: var(--spacing-20);
        }
        .status-bars {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .bar-row {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .bar-label {
          font-size: 13px;
          width: 90px;
          color: var(--color-ink);
          font-weight: 500;
        }
        .bar-container {
          flex: 1;
          height: 8px;
          background-color: rgba(255, 255, 255, 0.4);
          border-radius: 4px;
          overflow: hidden;
        }
        .bar-fill {
          height: 100%;
          border-radius: 4px;
        }
        .bar-value {
          font-size: 13px;
          font-weight: 600;
          width: 20px;
          text-align: right;
        }
        .category-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .category-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(255, 255, 255, 0.4);
          padding: 8px 12px;
          border-radius: 12px;
        }
        .cat-name {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-ink);
        }
        .cat-badge {
          font-size: 11px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
        }
        .recent-cases-section {
          margin-top: var(--spacing-20);
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-16);
        }
        .cases-list-card {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          overflow: hidden;
        }
        .cases-table-wrapper {
          overflow-x: auto;
        }
        .cases-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .cases-table th {
          background-color: var(--surface-fog);
          padding: 14px 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-graphite);
          border-bottom: 1px solid var(--color-dove);
        }
        .cases-table td {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-fog);
          font-size: 14px;
        }
        .cases-table tr:last-child td {
          border-bottom: none;
        }
        .case-title-block {
          display: flex;
          flex-direction: column;
        }
        .case-number {
          font-size: 12px;
          color: var(--color-graphite);
          font-weight: 600;
          margin-bottom: 2px;
        }
        .case-title {
          font-weight: 500;
          color: var(--color-ink);
        }
        .category-tag {
          padding-left: 8px;
          font-weight: 500;
          color: var(--color-ash);
        }
        .btn-explore-case {
          display: inline-flex;
          align-items: center;
          background-color: var(--surface-fog);
          color: var(--color-ink);
          text-decoration: none;
          font-size: 13px;
          font-weight: 500;
          padding: 6px 14px;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .btn-explore-case:hover {
          background-color: var(--color-dove);
        }
        .loading-container, .error-container {
          min-height: 400px;
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
        .error-card {
          background: white;
          padding: 32px;
          border-radius: var(--radius-cards);
          text-align: center;
          max-width: 400px;
        }
        .mt-4 { margin-top: 16px; }
      `}</style>
    </div>
  );
}

export default Home;
