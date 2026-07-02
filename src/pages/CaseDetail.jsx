import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, FileText, ArrowLeft, Download, ExternalLink, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { API_BASE_URL } from '../config';

function CaseDetail({ apiFetch, showToast }) {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Expanded stage tracking
  const [expandedStageId, setExpandedStageId] = useState(null);
  const [stageDetails, setStageDetails] = useState({});
  const [stageLoading, setStageLoading] = useState({});

  useEffect(() => {
    apiFetch(`${API_BASE_URL}/cases/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Kasus tidak ditemukan');
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setCaseData(res.data);
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
  }, [id, apiFetch]);

  const handleStageClick = (stageId) => {
    if (expandedStageId === stageId) {
      setExpandedStageId(null);
      return;
    }

    setExpandedStageId(stageId);

    // If already loaded, skip fetch
    if (stageDetails[stageId]) return;

    setStageLoading((prev) => ({ ...prev, [stageId]: true }));
    apiFetch(`${API_BASE_URL}/cases/${id}/stages/${stageId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStageDetails((prev) => ({ ...prev, [stageId]: res.data }));
        }
        setStageLoading((prev) => ({ ...prev, [stageId]: false }));
      })
      .catch((err) => {
        console.error(err);
        setStageLoading((prev) => ({ ...prev, [stageId]: false }));
      });
  };

  const handlePrint = () => {
    apiFetch(`${API_BASE_URL}/cases/${id}/export/pdf`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          const printWindow = window.open('', '_blank');
          const data = res.data;
          
          const stagesHtml = data.stages.map(st => `
            <div class="print-stage">
              <h3>${st.stageType} (${st.status})</h3>
              <p class="print-meta">Mulai: ${new Date(st.startedAt).toLocaleDateString('id-ID')} ${st.endedAt ? `| Selesai: ${new Date(st.endedAt).toLocaleDateString('id-ID')}` : ''}</p>
              ${st.article ? `
                <h4>${st.article.title}</h4>
                <p>${st.article.content || 'Detail artikel belum dimasukkan.'}</p>
              ` : '<p>Belum ada artikel penjelasan untuk tahap ini.</p>'}
            </div>
          `).join('');

          const defendantsHtml = data.defendants.map(df => `
            <li><strong>${df.name}</strong> (${df.role}) - ${df.description || ''}</li>
          `).join('');

          printWindow.document.write(`
            <html>
              <head>
                <title>Laporan Perkara - ${data.caseNumber}</title>
                <style>
                  body { font-family: 'Inter', sans-serif; color: #17191c; padding: 40px; line-height: 1.5; }
                  h1 { font-family: Georgia, serif; color: #5d2a1a; border-bottom: 2px solid #5d2a1a; padding-bottom: 10px; }
                  .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin: 20px 0; background: #f7f7f8; padding: 15px; border-radius: 8px; }
                  .print-stage { border-left: 3px solid #5d2a1a; padding-left: 15px; margin: 25px 0; }
                  .print-meta { font-size: 12px; color: #777b86; }
                  ul { padding-left: 20px; }
                  @media print {
                    body { padding: 0; }
                  }
                </style>
              </head>
              <body>
                <h1>🏛️ Laporan Transparansi Hukum (NIC)</h1>
                <h2>${data.title}</h2>
                <div class="meta-grid">
                  <div>
                    <p><strong>Nomor Perkara:</strong> ${data.caseNumber}</p>
                    <p><strong>Kategori:</strong> ${data.category?.name || 'Umum'}</p>
                  </div>
                  <div>
                    <p><strong>Status Saat Ini:</strong> ${data.currentStatus}</p>
                    <p><strong>Tanggal Laporan:</strong> ${new Date().toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
                <h3>Deskripsi Kasus</h3>
                <p>${data.description}</p>
                
                <h3>Pihak Tergugat / Defendant</h3>
                <ul>${defendantsHtml || '<li>Tidak ada data tergugat.</li>'}</ul>
                
                <hr style="margin: 30px 0; border: none; border-top: 1px solid #a3a6af;" />
                
                <h2>Linimasa Tahapan Hukum</h2>
                ${stagesHtml}
                
                <script>
                  window.onload = function() {
                    window.print();
                  }
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      })
      .catch(console.error);
  };

  if (loading) {
    return (
      <div className="case-detail-page container">
        <div className="back-nav">
          <div className="skeleton" style={{ width: '160px', height: '36px', borderRadius: '9999px' }}></div>
        </div>

        <section className="case-header-section card-shadow" style={{ padding: '32px' }}>
          <div className="skeleton skeleton-text-sm" style={{ width: '25%' }}></div>
          <div className="skeleton skeleton-title" style={{ width: '100%', height: '36px', marginBottom: '20px' }}></div>
          <div className="skeleton skeleton-text skeleton-paragraph skeleton-paragraph-medium"></div>
          <div className="skeleton skeleton-text skeleton-paragraph skeleton-paragraph" style={{ marginTop: '8px' }}></div>
          <div className="skeleton skeleton-text skeleton-paragraph skeleton-paragraph-short" style={{ marginTop: '8px' }}></div>
        </section>

        <section className="timeline-section">
          <div className="skeleton skeleton-title" style={{ width: '35%' }}></div>
          <div className="timeline-container">
            <div className="timeline-item" style={{ marginTop: '24px' }}>
              <div className="timeline-marker-wrapper">
                <div className="skeleton skeleton-avatar" style={{ width: '14px', height: '14px', borderRadius: '50%' }}></div>
                <div className="timeline-line skeleton" style={{ height: '100px', borderRadius: '1px', marginTop: '8px', background: 'linear-gradient(180deg, #f3f4f6 0%, #f9fafb 100%)' }}></div>
              </div>
              <div className="skeleton" style={{ height: '68px', borderRadius: 'var(--radius-cards)', flex: 1, marginBottom: '24px' }}></div>
            </div>
            <div className="timeline-item">
              <div className="timeline-marker-wrapper">
                <div className="skeleton skeleton-avatar" style={{ width: '14px', height: '14px', borderRadius: '50%' }}></div>
                <div className="timeline-line skeleton" style={{ height: '100px', borderRadius: '1px', marginTop: '8px', background: 'linear-gradient(180deg, #f3f4f6 0%, #f9fafb 100%)' }}></div>
              </div>
              <div className="skeleton" style={{ height: '68px', borderRadius: 'var(--radius-cards)', flex: 1 }}></div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (error || !caseData) {
    return (
      <div className="error-container container flex-center">
        <div className="error-card card-shadow">
          <h3>Error loading case details</h3>
          <p>{error || 'Kasus tidak ditemukan'}</p>
          <Link to="/explore" className="btn-primary mt-4">
            Kembali ke Daftar Kasus
          </Link>
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
    <div className="case-detail-page container">
      {/* Back navigation */}
      <div className="back-nav">
        <Link to="/explore" className="btn-secondary">
          <ArrowLeft size={16} /> Kembali ke Daftar Kasus
        </Link>
        <button onClick={handlePrint} className="btn-secondary btn-print-desktop">
          <Download size={14} /> Cetak Laporan (PDF)
        </button>
      </div>

      <button onClick={handlePrint} className="btn-print-float">
        <Download size={18} />
      </button>

      {/* Case Header & Details */}
      <section className="case-header-section card-shadow">
        <div className="case-meta-top">
          <span className="case-num">{caseData.caseNumber}</span>
          <span className="case-cat" style={{ borderLeft: `3px solid ${caseData.category?.color || '#999'}` }}>
            {caseData.category?.name || 'Umum'}
          </span>
          <span className={getStatusClass(caseData.currentStatus)}>
            Status: {getStatusLabel(caseData.currentStatus)}
          </span>
        </div>
        <h1 className="case-title font-display">{caseData.title}</h1>
        <p className="case-desc">{caseData.description}</p>
        
        {/* Defendants Section */}
        {caseData.defendants && caseData.defendants.length > 0 && (
          <div className="defendants-block">
            <h3>Pihak Terkait / Tergugat</h3>
            <div className="defendants-grid">
              {caseData.defendants.map((df) => (
                <div key={df.id} className="defendant-card">
                  <p className="df-name">{df.name}</p>
                  <p className="df-role">{df.role}</p>
                  {df.description && <p className="df-desc">{df.description}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Timeline Section */}
      <section className="timeline-section">
        <h2 className="section-title">Linimasa & Tahapan Perkara</h2>
        
        {caseData.stages && caseData.stages.length === 0 ? (
          <div className="empty-state-card card-shadow">
            <p>Belum ada tahapan perkara hukum yang dimasukkan untuk kasus ini.</p>
          </div>
        ) : (
          <div className="timeline-container">
            {caseData.stages.map((st, index) => {
              const isExpanded = expandedStageId === st.id;
              const hasArticle = !!st.article;
              const detail = stageDetails[st.id];

              return (
                <div 
                  key={st.id} 
                  className={`timeline-item ${st.status === 'AKTIF' ? 'stage-active' : ''} ${st.status === 'SELESAI' ? 'stage-completed' : ''}`}
                >
                  {/* Timeline point and lines */}
                  <div className="timeline-marker-wrapper">
                    <div className="timeline-marker"></div>
                    {index < caseData.stages.length - 1 && <div className="timeline-line"></div>}
                  </div>

                  <div className="timeline-content-card card-shadow">
                    <div className="timeline-card-header" onClick={() => hasArticle && handleStageClick(st.id)}>
                      <div className="stage-info">
                        <span className={`stage-status-indicator status-dot-${st.status.toLowerCase()}`}></span>
                        <h3 className="stage-type">{getStatusLabel(st.stageType)}</h3>
                        <span className="stage-date">
                          Mulai: {new Date(st.startedAt).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                      
                      {hasArticle && (
                        <div className="dropdown-trigger-icon">
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      )}
                    </div>

                    {/* Article explanation block */}
                    {isExpanded && (
                      <div className="stage-article-detail">
                        {stageLoading[st.id] ? (
                          <div className="flex-center py-4">
                            <div className="loading-spinner small"></div>
                          </div>
                        ) : detail && detail.article ? (
                          <div className="article-body">
                            <h4 className="article-title">{detail.article.title}</h4>
                            <p className="article-content">{detail.article.content}</p>
                            
                            {detail.article.attachments && detail.article.attachments.length > 0 && (
                              <div className="attachments-section">
                                <h5>Link Berita & Dokumen Pendukung</h5>
                                <div className="attachments-list">
                                  {detail.article.attachments.map((link, idx) => {
                                    let label = "Link Berita / Sumber";
                                    try {
                                      const urlObj = new URL(link);
                                      label = `Sumber: ${urlObj.hostname.replace('www.', '')}`;
                                    } catch (e) {
                                      label = `Link Sumber #${idx + 1}`;
                                    }
                                    return (
                                      <a key={idx} href={link} target="_blank" rel="noopener noreferrer" className="attachment-link">
                                        <FileText size={14} /> {label} <ExternalLink size={12} />
                                      </a>
                                    );
                                  })}
                                </div>
                              </div>
                            )}

                            <hr className="article-divider" />
                            <div className="article-meta">
                              <span className="meta-author">
                                <User size={12} /> Ditulis oleh: <strong>{detail.article.author?.name || 'Moderator'}</strong> ({detail.article.author?.role})
                              </span>
                              <span className="meta-date">
                                <Calendar size={12} /> Dipublikasikan: {new Date(detail.article.publishedAt).toLocaleDateString('id-ID', {
                                  day: 'numeric',
                                  month: 'short',
                                  year: 'numeric'
                                })}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="empty-article">
                            <ShieldAlert size={16} /> Gagal memuat artikel penjelasan.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
      
      <style>{`
        .case-detail-page {
          padding-top: 48px;
          padding-bottom: 96px;
        }
        .back-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--spacing-24);
        }
        .btn-print-desktop {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          border: 1px solid var(--color-dove);
          background: white;
        }
        .btn-print-float {
          display: none;
          position: fixed;
          bottom: 32px;
          right: 32px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: var(--color-ink);
          color: var(--color-pure-white);
          border: none;
          box-shadow: 0 4px 16px rgba(0,0,0,0.18);
          cursor: pointer;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s, box-shadow 0.2s;
          z-index: 300;
        }
        .btn-print-float:hover {
          transform: scale(1.06);
          box-shadow: 0 6px 24px rgba(0,0,0,0.25);
        }
        .btn-print-float:active {
          transform: scale(0.96);
        }
        .case-header-section {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          padding: 32px;
          margin-bottom: var(--spacing-40);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          animation: fadeInUp 0.5s var(--ease-out) forwards;
        }
        .case-meta-top {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: var(--spacing-16);
          flex-wrap: wrap;
        }
        .case-num {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-graphite);
        }
        .case-cat {
          font-size: 13px;
          font-weight: 500;
          padding-left: 8px;
          color: var(--color-ash);
        }
        .case-title {
          font-size: var(--text-heading);
          line-height: var(--leading-heading);
          color: var(--color-ink);
          margin-bottom: var(--spacing-16);
        }
        .case-desc {
          font-size: 16px;
          line-height: 1.6;
          color: var(--color-ash);
          margin-bottom: var(--spacing-32);
        }
        .defendants-block h3 {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 12px;
          border-top: 1px solid var(--surface-fog);
          padding-top: var(--spacing-24);
        }
        .defendants-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .defendant-card {
          background-color: var(--surface-fog);
          padding: 16px;
          border-radius: 16px;
          border: 1px solid var(--color-dove);
        }
        .df-name {
          font-weight: 600;
          font-size: 15px;
          color: var(--color-ink);
        }
        .df-role {
          font-size: 12px;
          color: var(--color-rust);
          font-weight: 600;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .df-desc {
          font-size: 13px;
          color: var(--color-ash);
          line-height: 1.4;
        }
        .timeline-section {
          margin-top: var(--spacing-40);
          animation: fadeInUp 0.5s var(--ease-out) 0.15s forwards;
          opacity: 0;
        }
        .timeline-container {
          display: flex;
          flex-direction: column;
          margin-top: var(--spacing-24);
          padding-left: 20px;
        }
        .timeline-item {
          display: flex;
          gap: var(--spacing-24);
          position: relative;
        }
        .timeline-marker-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
        }
        .timeline-marker {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background-color: var(--color-dove);
          border: 2px solid var(--color-pure-white);
          z-index: 2;
          margin-top: 24px;
          transition: background-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s var(--ease-spring);
        }
        .stage-active .timeline-marker {
          background-color: var(--color-rust);
          box-shadow: 0 0 0 4px var(--color-apricot-wash);
          animation: pulse-glow 2s ease-in-out infinite;
        }
        .stage-completed .timeline-marker {
          background-color: var(--color-ink);
        }
        .timeline-line {
          width: 2px;
          flex: 1;
          background-color: rgba(0, 0, 0, 0.06);
          min-height: 80px;
          transition: background-color 0.3s ease;
        }
        .timeline-content-card {
          flex: 1;
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          margin-bottom: 24px;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          transition: box-shadow 0.3s var(--ease-out), transform 0.25s var(--ease-out);
          animation: fadeInUp 0.4s var(--ease-out) forwards;
          opacity: 0;
        }
        .timeline-content-card:hover {
          box-shadow: var(--shadow-md);
        }
        .timeline-card-header {
          padding: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .timeline-card-header:hover {
          background: rgba(0, 0, 0, 0.01);
        }
        .stage-info {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .stage-status-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-dot-pending { background-color: var(--color-dove); }
        .status-dot-aktif { background-color: #f59e0b; }
        .status-dot-selesai { background-color: #10b981; }

        .stage-type {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
        }
        .stage-date {
          font-size: 13px;
          color: var(--color-graphite);
        }
        .stage-article-detail {
          padding: 0 20px 20px;
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          background-color: var(--surface-fog);
          animation: fadeInScale 0.3s var(--ease-out) forwards;
        }
        .article-body {
          padding-top: 20px;
        }
        .article-title {
          font-size: 18px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 12px;
        }
        .article-content {
          font-size: 15px;
          line-height: 1.6;
          color: var(--color-ash);
          white-space: pre-wrap;
          margin-bottom: 20px;
        }
        .attachments-section h5 {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 8px;
        }
        .attachments-list {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .attachment-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-dove);
          font-size: 13px;
          color: var(--color-ink);
          text-decoration: none;
          transition: background 0.2s;
        }
        .attachment-link:hover {
          background-color: var(--color-apricot-wash);
        }
        .article-divider {
          border: 0;
          border-top: 1px solid var(--color-dove);
          margin: 16px 0;
          opacity: 0.5;
        }
        .article-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: var(--color-graphite);
          flex-wrap: wrap;
          gap: 12px;
        }
        .meta-author, .meta-date {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .loading-spinner.small {
          width: 24px;
          height: 24px;
          border-width: 2px;
        }
        .py-4 { padding-top: 16px; padding-bottom: 16px; }
        @media (max-width: 768px) {
          .defendants-grid {
            grid-template-columns: 1fr;
          }
          .back-nav {
            flex-direction: column;
            align-items: stretch;
            gap: 12px;
          }
          .btn-print-desktop {
            display: none;
          }
          .btn-print-float {
            display: flex;
            bottom: 20px;
            right: 20px;
            width: 48px;
            height: 48px;
          }
        }
      `}</style>
    </div>
  );
}

export default CaseDetail;
