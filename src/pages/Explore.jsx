import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Download, Filter, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Explore({ apiFetch, showToast }) {
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCases, setTotalCases] = useState(0);
  
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 9;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [search]);

  // Load cases
  useEffect(() => {
    setLoading(true);
    const queryParams = new URLSearchParams({
      page,
      limit,
      search: debouncedSearch,
      status: statusFilter,
      categoryId: categoryFilter
    });

    apiFetch(`${API_BASE_URL}/cases?${queryParams}`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal mengambil daftar kasus');
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setCases(res.data || []);
          setTotalCases(res.meta ? res.meta.total : 0);
        } else {
          throw new Error(res.message);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
        if (showToast) {
          showToast(err.message, 'error');
        }
      });
  }, [page, debouncedSearch, statusFilter, categoryFilter, apiFetch, showToast]);

  // Load categories once
  useEffect(() => {
    fetch(`${API_BASE_URL}/dashboard/stats`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCategories(res.data.byCategory);
        }
      })
      .catch(console.error);
  }, []);

  const totalPages = Math.ceil(totalCases / limit);

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

  const handleClearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setCategoryFilter('');
    setPage(1);
  };

  const handleExportCsv = () => {
    window.open(`${API_BASE_URL}/cases/export/csv`, '_blank');
  };

  return (
    <div className="explore-page container">
      <div className="explore-header">
        <h1 className="font-display">Telusuri Perkara Hukum</h1>
        <p className="subtitle">Cari, saring, dan telusuri riwayat perkara hukum publik secara transparan.</p>
      </div>

      {/* Control Panel: Search & Filters */}
      <div className="control-panel card-shadow">
        <div className="search-bar-wrapper">
          <Search className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Cari judul kasus, nomor perkara, atau deskripsi..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="search-input"
          />
          {search && (
            <button onClick={() => setSearch('')} className="clear-btn">
              <X size={16} />
            </button>
          )}
        </div>

        <div className="filters-row">
          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">Semua Tahapan</option>
              <option value="PELAPORAN">Pelaporan</option>
              <option value="PENYIDIKAN">Penyidikan</option>
              <option value="PENUNTUTAN">Penuntutan</option>
              <option value="PERSIDANGAN">Persidangan</option>
              <option value="PUTUSAN">Putusan</option>
            </select>
          </div>

          <div className="filter-group">
            <Filter size={14} className="filter-icon" />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setPage(1);
              }}
              className="filter-select"
            >
              <option value="">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {(search || statusFilter || categoryFilter) && (
            <button onClick={handleClearFilters} className="btn-secondary btn-clear-all">
              Hapus Filter
            </button>
          )}

          <button onClick={handleExportCsv} className="btn-secondary btn-export ml-auto">
            <Download size={14} /> Ekspor Riset (CSV)
          </button>
        </div>
      </div>

      {/* Grid Cases */}
      {loading ? (
        <div className="cases-grid">
          <div className="case-card card-shadow skeleton skeleton-card-full" style={{ height: '220px' }}></div>
          <div className="case-card card-shadow skeleton skeleton-card-full" style={{ height: '220px' }}></div>
          <div className="case-card card-shadow skeleton skeleton-card-full" style={{ height: '220px' }}></div>
        </div>
      ) : error ? (
        <div className="error-card card-shadow mt-4">
          <h3>Error memuat kasus</h3>
          <p>{error}</p>
        </div>
      ) : cases.length === 0 ? (
        <div className="empty-state-card card-shadow text-center">
          <h3>Kasus tidak ditemukan</h3>
          <p>Coba ubah filter pencarian Anda atau hapus filter untuk melihat semua perkara.</p>
          <button onClick={handleClearFilters} className="btn-primary mt-4">
            Reset Pencarian
          </button>
        </div>
      ) : (
        <>
          <div className="cases-grid">
            {cases.map((c) => (
              <div key={c.id} className="case-card card-shadow">
                <div className="case-card-header">
                  <span className="case-card-number">{c.caseNumber}</span>
                  <span className={getStatusClass(c.currentStatus)}>
                    {getStatusLabel(c.currentStatus)}
                  </span>
                </div>
                <h3 className="case-card-title">{c.title}</h3>
                <p className="case-card-desc">
                  {c.description?.length > 140
                    ? `${c.description.substring(0, 140)}...`
                    : c.description}
                </p>
                <div className="case-card-footer">
                  <span className="case-card-cat" style={{ borderLeft: `3px solid ${c.category?.color || '#999'}` }}>
                    {c.category?.name || 'Umum'}
                  </span>
                  <Link to={`/cases/${c.id}`} className="btn-explore-case">
                    Lihat Detail
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination-bar flex-center">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="btn-pagination flex-center"
              >
                <ChevronLeft size={16} /> Sebelumnya
              </button>
              <span className="page-indicator">
                Halaman {page} dari {totalPages}
              </span>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(page + 1)}
                className="btn-pagination flex-center"
              >
                Selanjutnya <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}

      <style>{`
        .explore-page {
          padding-top: 56px;
          padding-bottom: 96px;
        }
        .explore-header {
          margin-bottom: var(--spacing-32);
          animation: fadeInUp 0.5s var(--ease-out) forwards;
        }
        .explore-header h1 {
          font-size: var(--text-heading);
          margin-bottom: var(--spacing-8);
          color: var(--color-ink);
        }
        .subtitle {
          font-size: 16px;
          color: var(--color-ash);
        }
        .control-panel {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          padding: 20px;
          margin-bottom: var(--spacing-32);
          display: flex;
          flex-direction: column;
          gap: 16px;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          animation: fadeInUp 0.5s var(--ease-out) 0.1s forwards;
          opacity: 0;
        }
        .search-bar-wrapper {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: var(--radius-inputs);
          padding: 4px 16px;
          background-color: var(--color-pure-white);
          transition: border-color 0.2s ease, box-shadow 0.2s var(--ease-out);
        }
        .search-bar-wrapper:focus-within {
          border-color: var(--color-ink);
          box-shadow: 0 0 0 3px rgba(23, 25, 28, 0.06);
        }
        .search-icon {
          color: var(--color-graphite);
          margin-right: 12px;
        }
        .search-input {
          border: none;
          outline: none;
          flex: 1;
          height: 40px;
          font-family: var(--font-sohne);
          font-size: 15px;
        }
        .clear-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-graphite);
          border-radius: 50%;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s, color 0.2s;
        }
        .clear-btn:hover {
          background: var(--surface-fog);
          color: var(--color-ink);
        }
        .filters-row {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .filter-group {
          display: flex;
          align-items: center;
          border: 1px solid rgba(0, 0, 0, 0.12);
          border-radius: var(--radius-buttons);
          padding: 8px 16px;
          background: var(--surface-fog);
          transition: border-color 0.2s ease, background 0.2s ease;
        }
        .filter-group:focus-within {
          border-color: var(--color-ink);
          background: var(--color-pure-white);
        }
        .filter-icon {
          color: var(--color-graphite);
          margin-right: 8px;
          flex-shrink: 0;
        }
        .filter-select {
          border: none;
          background: none;
          outline: none;
          font-family: var(--font-sohne);
          font-size: 14px;
          font-weight: 500;
          color: var(--color-ink);
          cursor: pointer;
        }
        .btn-clear-all {
          font-size: 14px;
          color: var(--color-rust);
        }
        .btn-export {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 14px;
        }
        .ml-auto {
          margin-left: auto;
        }
        .cases-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: var(--spacing-24);
          margin-bottom: var(--spacing-40);
        }
        .case-card {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          padding: var(--card-padding);
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s var(--ease-out), box-shadow 0.3s var(--ease-out), border-color 0.2s ease;
          animation: fadeInUp 0.4s var(--ease-out) forwards;
          opacity: 0;
        }
        .case-card:nth-child(1) { animation-delay: 0ms; }
        .case-card:nth-child(2) { animation-delay: 60ms; }
        .case-card:nth-child(3) { animation-delay: 120ms; }
        .case-card:nth-child(4) { animation-delay: 180ms; }
        .case-card:nth-child(5) { animation-delay: 240ms; }
        .case-card:nth-child(6) { animation-delay: 300ms; }
        .case-card:hover {
          transform: translateY(-6px);
          box-shadow: var(--shadow-lg);
          border-color: rgba(0, 0, 0, 0.06);
        }
        .case-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-16);
        }
        .case-card-number {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-graphite);
          font-family: var(--font-sohne);
        }
        .case-card-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: var(--spacing-8);
          line-height: 1.3;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .case-card-desc {
          font-size: 14px;
          color: var(--color-ash);
          margin-bottom: var(--spacing-24);
          line-height: 1.55;
          flex: 1;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .case-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: auto;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          padding-top: var(--spacing-16);
        }
        .case-card-cat {
          padding-left: var(--spacing-8);
          font-size: 13px;
          font-weight: 500;
          color: var(--color-graphite);
        }

        .pagination-bar {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-top: var(--spacing-24);
          animation: fadeInUp 0.3s var(--ease-out) forwards;
        }
        .btn-pagination {
          background-color: var(--color-pure-white);
          border: 1px solid rgba(0, 0, 0, 0.1);
          border-radius: var(--radius-buttons);
          padding: 8px 16px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, box-shadow 0.2s var(--ease-out);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-pagination:hover:not(:disabled) {
          background-color: var(--surface-fog);
          box-shadow: var(--shadow-sm);
        }
        .btn-pagination:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .page-indicator {
          font-size: 14px;
          color: var(--color-ash);
          font-weight: 500;
          padding: 0 12px;
        }
        @media (max-width: 1024px) {
          .cases-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
        @media (max-width: 768px) {
          .cases-grid {
            grid-template-columns: 1fr;
          }
          .filters-row {
            flex-direction: column;
            align-items: stretch;
          }
          .filter-group {
            width: 100%;
          }
          .filter-select {
            width: 100%;
          }
          .btn-export {
            margin-left: 0;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}

export default Explore;
