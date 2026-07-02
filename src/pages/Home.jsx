import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Activity, Database, CheckCircle, TrendingUp } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { API_BASE_URL } from '../config';

function DonutChart({ statusCounts, total }) {
  const [activeIndex, setActiveIndex] = useState(-1);
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

  const rawData = Object.entries(statusCounts).map(([status, count]) => ({
    name: status,
    value: count,
    label: getStatusLabel(status),
    color: colors[status] || '#999'
  })).filter(item => item.value > 0);

  if (total === 0 || rawData.length === 0) {
    return (
      <div className="donut-chart-wrapper flex-center" style={{ height: '140px' }}>
        <p style={{ color: 'var(--color-graphite)', fontSize: '13px', fontWeight: '500' }}>Belum ada data tahapan</p>
      </div>
    );
  }

  const activeItem = activeIndex !== -1 ? rawData[activeIndex] : null;

  return (
    <div className="donut-chart-wrapper">
      <div className="recharts-container-box" style={{ width: '140px', height: '140px', position: 'relative' }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rawData}
              cx="50%"
              cy="50%"
              innerRadius={34}
              outerRadius={42}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              stroke="none"
              cursor="pointer"
            >
              {rawData.map((entry, index) => {
                const isHovered = activeIndex === index;
                const isAnyHovered = activeIndex !== -1;
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={entry.color} 
                    style={{
                      transition: 'opacity 0.2s ease, transform 0.2s ease',
                      opacity: isAnyHovered ? (isHovered ? 1 : 0.35) : 1,
                      transform: isHovered ? 'scale(1.04)' : 'scale(1)',
                      transformOrigin: 'center'
                    }}
                  />
                );
              })}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center Text Overlay */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          pointerEvents: 'none'
        }}>
          <p style={{
            fontSize: '17px',
            fontWeight: '700',
            color: 'var(--color-ink)',
            margin: 0,
            lineHeight: 1
          }}>
            {activeItem ? activeItem.value : total}
          </p>
          <p style={{
            fontSize: '6px',
            fontWeight: '700',
            color: activeItem ? activeItem.color : 'var(--color-graphite)',
            margin: '4px 0 0 0',
            letterSpacing: '0.1px',
            lineHeight: 1,
            textTransform: 'uppercase'
          }}>
            {activeItem ? activeItem.label : 'TOTAL KASUS'}
          </p>
        </div>
      </div>
      
      <div className="donut-legend">
        {rawData.map((entry, index) => {
          const isHovered = activeIndex === index;
          return (
            <div 
              key={entry.name} 
              className={`legend-item ${isHovered ? 'hovered' : ''}`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(-1)}
              style={{
                cursor: 'pointer',
                opacity: activeIndex !== -1 && !isHovered ? 0.4 : 1,
                transition: 'opacity 0.2s ease',
              }}
            >
              <span className="legend-dot" style={{ backgroundColor: entry.color }}></span>
              <span className="legend-label" style={{ fontWeight: isHovered ? '600' : '400' }}>
                {entry.label}
              </span>
              <span className="legend-count">{entry.value}</span>
            </div>
          );
        })}
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
        <div className="hero-glow-secondary"></div>
        <div className="hero-particles">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${15 + i * 15}%`,
              top: `${20 + (i % 3) * 20}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${4 + i * 0.7}s`,
            }}></div>
          ))}
        </div>
        <div className="container hero-container">
          <h1 className="hero-title font-display">
            Pantau Kasus Hukum <br />
            <span className="text-rust">Sampai Mana</span> Sebenarnya.
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
          <div className="skeleton skeleton-card-full" style={{ height: '240px' }}></div>
        ) : (
          <>
            <div className="section-header animate-fade-in-up" style={{ marginBottom: '20px' }}>
              <h2 className="section-title">Kasus Terbaru</h2>
              <Link to="/explore" className="btn-secondary">
                Lihat Semua <ArrowRight size={14} />
              </Link>
            </div>
            <div className="cases-list-card card-shadow">
              {stats.recentCases.length === 0 ? (
                <div className="empty-state" style={{ padding: '32px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--color-ash)' }}>Belum ada kasus aktif yang terdaftar.</p>
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
                      {stats.recentCases.slice(0, 5).map((c) => (
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
                            <Link to={`/cases/${c.id}`} className="btn-explore-case" style={{ padding: '6px 12px', fontSize: '12px' }}>
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
          </>
        )}
      </section>

      {/* Main Grid Content (Kategori) */}
      {loading || !stats ? (
        <section className="dashboard-grid container">
          <div className="grid-2-col">
            <div className="visual-card card-shadow skeleton skeleton-card-full" style={{ height: '280px' }}></div>
            <div className="visual-card card-shadow skeleton skeleton-card-full" style={{ height: '280px' }}></div>
          </div>
        </section>
      ) : (
        <section className="dashboard-grid container" style={{ marginTop: '40px' }}>
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

      {/* Stats Cards Section (Stat) */}
      <section className="stats-section container" style={{ marginTop: '40px', marginBottom: '80px' }}>
        {loading || !stats ? (
          <div className="stats-grid">
            <div className="stat-card card-shadow skeleton skeleton-card" style={{ borderRadius: 'var(--radius-cards)' }}></div>
            <div className="stat-card card-shadow skeleton skeleton-card" style={{ borderRadius: 'var(--radius-cards)' }}></div>
            <div className="stat-card card-shadow skeleton skeleton-card" style={{ borderRadius: 'var(--radius-cards)' }}></div>
          </div>
        ) : (
          <div className="stats-grid">
            <div className="stat-card">
              <p className="stat-value">{stats.totals.cases}</p>
              <p className="stat-label">Total Kasus Hukum</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">{stats.totals.activeCases}</p>
              <p className="stat-label">Kasus Aktif Dipantau</p>
            </div>
            <div className="stat-card">
              <p className="stat-value">
                {Object.values(stats.byStatus).reduce((a, b) => a + b, 0)}
              </p>
              <p className="stat-label">Total Tahapan Terverifikasi</p>
            </div>
          </div>
        )}
      </section>
      
      <style>{`
        .home-page {
          padding-bottom: 80px;
        }
        .hero-section {
          position: relative;
          background: linear-gradient(180deg, var(--surface-canvas) 0%, var(--surface-page) 100%);
          padding: 100px 0 80px;
          overflow: hidden;
          text-align: center;
        }
        .hero-glow {
          position: absolute;
          top: -200px;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, var(--color-apricot-wash) 0%, rgba(255,255,255,0) 70%);
          opacity: 0.5;
          z-index: 1;
          pointer-events: none;
          animation: pulse-glow 6s ease-in-out infinite;
        }
        .hero-glow-secondary {
          position: absolute;
          bottom: -150px;
          right: -100px;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, var(--color-sky-wash) 0%, rgba(255,255,255,0) 70%);
          opacity: 0.35;
          z-index: 1;
          pointer-events: none;
          animation: pulse-glow 8s ease-in-out infinite reverse;
        }
        .hero-particles {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--color-apricot-wash);
          opacity: 0.3;
          animation: float 6s ease-in-out infinite;
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
          animation: fadeInUp 0.7s var(--ease-out) forwards;
          opacity: 0;
        }
        .hero-title span {
          color: var(--color-rust);
        }
        .hero-title span.text-rust {
          color: var(--color-rust);
          position: relative;
          display: inline;
        }
        .hero-subtitle {
          font-size: var(--text-body-lg);
          line-height: var(--leading-body-lg);
          color: var(--color-ash);
          margin-bottom: var(--spacing-32);
          animation: fadeInUp 0.7s var(--ease-out) 0.15s forwards;
          opacity: 0;
        }
        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--spacing-16);
          animation: fadeInUp 0.7s var(--ease-out) 0.3s forwards;
          opacity: 0;
        }
        .arrow-icon {
          margin-left: 6px;
          transition: transform var(--duration-fast) ease;
        }
        .btn-secondary:hover .arrow-icon {
          transform: translateX(4px);
        }
        .stats-section {
          margin: 40px auto 48px;
        }
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-24);
        }
        .stat-card {
          background-color: var(--surface-card);
          border-radius: var(--radius-cards);
          padding: 24px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          position: relative;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          transition: border-color 0.2s ease, transform 0.2s ease, box-shadow 0.3s var(--ease-out);
          animation: fadeInUp 0.5s var(--ease-out) forwards;
          opacity: 0;
        }
        .stat-card:nth-child(1) { animation-delay: 0.1s; }
        .stat-card:nth-child(2) { animation-delay: 0.2s; }
        .stat-card:nth-child(3) { animation-delay: 0.3s; }
        .stat-card:hover {
          transform: translateY(-2px);
          border-color: rgba(0, 0, 0, 0.08);
          box-shadow: var(--shadow-md);
        }
        .stat-value {
          font-size: 42px;
          font-weight: 700;
          color: var(--color-ink);
          line-height: 1.1;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
          font-variant-numeric: tabular-nums;
        }
        .stat-label {
          font-size: 13px;
          color: var(--color-graphite);
          font-weight: 600;
          letter-spacing: -0.01em;
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
          transition: background-color 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
          border: 1px solid transparent;
          cursor: default;
        }
        .category-row:hover {
          background: rgba(255, 255, 255, 0.85);
          transform: translateY(-1.5px);
          border-color: rgba(0, 0, 0, 0.04);
          box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.04);
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
