import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Activity, Database, CheckCircle, TrendingUp } from 'lucide-react';
import { API_BASE_URL } from '../config';

function DonutChart({ statusCounts, total }) {
  const statuses = Object.entries(statusCounts);
  const colors = {
    PELAPORAN: '#d97706',
    PENYIDIKAN: '#0284c7',
    PENUNTUTAN: '#9333ea',
    PERSIDANGAN: '#16a34a',
    PUTUSAN: '#db2777',
  };

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

  let accumulatedPercentage = 0;
  const radius = 38;
  const circumference = 2 * Math.PI * radius; // ~238.76

  if (total === 0) {
    return (
      <div className="donut-chart-wrapper">
        <svg width="140" height="140" viewBox="0 0 100 100" className="donut-chart-svg">
          <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#e5e7eb" strokeWidth="8" />
          <text x="50" y="54" textAnchor="middle" fill="var(--color-graphite)" fontSize="10" fontWeight="600">Kosong</text>
        </svg>
      </div>
    );
  }

  return (
    <div className="donut-chart-wrapper">
      <svg width="140" height="140" viewBox="0 0 100 100" className="donut-chart-svg">
        <circle cx="50" cy="50" r={radius} fill="transparent" stroke="#f3f4f6" strokeWidth="8" />
        {statuses.map(([status, count]) => {
          const percentage = count / total;
          if (percentage === 0) return null;
          
          const strokeLength = percentage * circumference;
          const strokeOffset = circumference - (accumulatedPercentage * circumference);
          accumulatedPercentage += percentage;

          return (
            <circle
              key={status}
              cx="50"
              cy="50"
              r={radius}
              fill="transparent"
              stroke={colors[status] || 'var(--color-rust)'}
              strokeWidth="8"
              strokeDasharray={`${strokeLength} ${circumference}`}
              strokeDashoffset={-strokeOffset}
              className="donut-segment"
              style={{
                transition: 'stroke-dashoffset 0.5s ease',
                transformOrigin: '50px 50px',
                transform: 'rotate(-90deg)'
              }}
            />
          );
        })}
        <g className="donut-center-text">
          <text x="50" y="47" textAnchor="middle" fill="var(--color-ink)" fontSize="16" fontWeight="700">{total}</text>
          <text x="50" y="60" textAnchor="middle" fill="var(--color-graphite)" fontSize="7" fontWeight="600" letterSpacing="0.2px">TOTAL KASUS</text>
        </g>
      </svg>
      
      <div className="donut-legend">
        {statuses.map(([status, count]) => (
          <div key={status} className="legend-item">
            <span className="legend-dot" style={{ backgroundColor: colors[status] }}></span>
            <span className="legend-label">{getStatusLabel(status)}</span>
            <span className="legend-count">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Home({ apiFetch, showToast }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFunc = apiFetch || fetch;
    fetchFunc(`${API_BASE_URL}/dashboard/stats`)
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
  }, [apiFetch]);

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

  return (
    <div className="home-page">
      {/* Hero Section - Always Visible Instantly */}
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

      {/* Recent Cases Section — right below hero */}
      <section className="recent-cases-section container">
        {loading || !stats ? (
          <div className="skeleton skeleton-card" style={{ height: '120px', borderRadius: 'var(--radius-cards)' }}></div>
        ) : (
          <>
            <div className="section-header">
              <h2 className="section-title">Kasus Terbaru</h2>
              <Link to="/explore" className="btn-secondary">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="recent-cases-strip">
              {stats.recentCases.length === 0 ? (
                <p className="empty-text">Belum ada kasus aktif yang terdaftar.</p>
              ) : (
                stats.recentCases.slice(0, 4).map((c) => (
                  <Link to={`/cases/${c.id}`} key={c.id} className="recent-case-card">
                    <span className="rcc-number">{c.caseNumber}</span>
                    <span className="rcc-title">{c.title}</span>
                    <span className={getStatusClass(c.currentStatus)}>
                      {getStatusLabel(c.currentStatus)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </>
        )}
      </section>

      {/* Stats Cards Section */}
      <section className="stats-section container">
        {loading || !stats ? (
          <div className="stats-grid">
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
            <div className="stat-card card-shadow skeleton skeleton-card"></div>
          </div>
        ) : (
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
        )}
      </section>

      {/* Main Grid Content */}
      {loading || !stats ? (
        <section className="dashboard-grid container">
          <div className="grid-2-col">
            <div className="visual-card card-shadow skeleton skeleton-card" style={{ height: '280px' }}></div>
            <div className="visual-card card-shadow skeleton skeleton-card" style={{ height: '280px' }}></div>
          </div>
        </section>
      ) : (
        <section className="dashboard-grid container">
          <div className="dashboard-visuals">
            <h2 className="section-title">Kategori & Status</h2>
            
            <div className="grid-2-col">
              <div className="visual-card warm-card">
                <h3>Tahapan Kasus</h3>
                <p className="card-subtitle">Distribusi tahapan hukum saat ini</p>
                <DonutChart statusCounts={stats.byStatus} total={stats.totals.cases} />
              </div>

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
        </section>
      )}
      
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
          margin: 40px 0 48px;
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
          margin-top: 40px;
        }
        .recent-cases-strip {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 4px;
        }
        .recent-case-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 220px;
          padding: 14px 16px;
          border-radius: var(--radius-cards);
          background: var(--surface-fog);
          border: 1px solid var(--color-dove);
          text-decoration: none;
          transition: background 0.2s, border-color 0.2s;
        }
        .recent-case-card:hover {
          background: var(--color-pure-white);
          border-color: var(--color-graphite);
        }
        .rcc-number {
          font-size: 11px;
          font-weight: 600;
          color: var(--color-graphite);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .rcc-title {
          font-size: 13px;
          font-weight: 500;
          color: var(--color-ink);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .empty-text {
          color: var(--color-graphite);
          font-size: 14px;
          padding: 16px 0;
        }
        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-12);
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

        /* Donut Chart styles */
        .donut-chart-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-around;
          gap: 16px;
          margin-top: 8px;
          flex-wrap: wrap;
        }
        .donut-chart-svg {
          flex-shrink: 0;
        }
        .donut-segment {
          transition: stroke-dashoffset 0.4s ease;
        }
        .donut-legend {
          display: flex;
          flex-direction: column;
          gap: 6px;
          flex: 1;
          min-width: 140px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          font-size: 12px;
          font-weight: 500;
          color: var(--color-ink);
        }
        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          margin-right: 8px;
          flex-shrink: 0;
        }
        .legend-label {
          color: var(--color-ash);
          text-transform: capitalize;
          flex: 1;
        }
        .legend-count {
          font-weight: 600;
          color: var(--color-ink);
          margin-left: 8px;
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .hero-section {
            padding: 64px 0 40px;
          }
          .hero-section h1 {
            font-size: 28px !important;
            line-height: 1.2;
          }
          .hero-section p {
            font-size: 14px !important;
          }
          .dashboard-visuals .grid-2-col {
            grid-template-columns: 1fr;
          }
          .recent-cases-section .section-header {
            flex-direction: row;
            align-items: center;
          }
          .recent-case-card {
            width: 180px;
            padding: 10px 12px;
          }
        }
      `}</style>
    </div>
  );
}

export default Home;
