import React, { useState, useEffect } from 'react';
import { ShieldAlert, CheckCircle, XCircle, FileText, Trash2, Plus, Edit3, Settings, Shield, UserX } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Admin({ user, apiFetch, showToast }) {
  const [activeTab, setActiveTab] = useState('contributions');
  const [loading, setLoading] = useState(false);

  // Data states
  const [contributions, setContributions] = useState([]);
  const [cases, setCases] = useState([]);
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);

  // Form states - Create Case
  const [caseNumber, setCaseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [currentStatus, setCurrentStatus] = useState('PELAPORAN');

  // Form states - Rejection Reason Modal
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form states - Add Stage
  const [selectedCaseForStage, setSelectedCaseForStage] = useState('');
  const [stageType, setStageType] = useState('PELAPORAN');
  const [stageStatus, setStageStatus] = useState('AKTIF');
  const [stageStartedAt, setStageStartedAt] = useState('');
  const [articleTitle, setArticleTitle] = useState('');
  const [articleContent, setArticleContent] = useState('');
  const [articleAttachments, setArticleAttachments] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);

    if (activeTab === 'contributions') {
      apiFetch(`${API_BASE_URL}/admin/contributions`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setContributions(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (activeTab === 'cases') {
      // Load all cases
      apiFetch(`${API_BASE_URL}/cases?limit=100`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setCases(res.data || []);
        })
        .catch(console.error);

      // Load categories
      apiFetch(`${API_BASE_URL}/dashboard/stats`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setCategories(res.data.byCategory);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    } else if (activeTab === 'logs') {
      apiFetch(`${API_BASE_URL}/admin/activity-logs`)
        .then((res) => res.json())
        .then((res) => {
          if (res.success) setLogs(res.data);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  const handleVerifyContribution = (id, status, reason = '') => {
    apiFetch(`${API_BASE_URL}/admin/contributions/${id}/verify`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status, rejectionReason: reason })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast(`Kontribusi berhasil ${status === 'APPROVED' ? 'disetujui' : 'ditolak'}`, 'success');
          setRejectingId(null);
          setRejectionReason('');
          loadData();
        } else {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast(err.message, 'error');
      });
  };

  const handleCreateCase = (e) => {
    e.preventDefault();
    apiFetch(`${API_BASE_URL}/admin/cases`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ caseNumber, title, description, categoryId, currentStatus })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast('Kasus baru berhasil dibuat.', 'success');
          setCaseNumber('');
          setTitle('');
          setDescription('');
          setCategoryId('');
          loadData();
        } else {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast(err.message, 'error');
      });
  };

  const handleDeleteCase = (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menonaktifkan/menghapus kasus ini?')) return;
    apiFetch(`${API_BASE_URL}/admin/cases/${id}`, {
      method: 'DELETE'
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast('Kasus berhasil dinonaktifkan.', 'success');
          loadData();
        } else {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast(err.message, 'error');
      });
  };

  const handleCreateStage = (e) => {
    e.preventDefault();
    const payload = {
      stageType,
      status: stageStatus,
      startedAt: stageStartedAt ? new Date(stageStartedAt).toISOString() : new Date().toISOString(),
      articleTitle: articleTitle || undefined,
      articleContent: articleContent || undefined,
      attachments: articleAttachments ? articleAttachments.split(',').map(link => link.trim()) : undefined
    };

    apiFetch(`${API_BASE_URL}/admin/cases/${selectedCaseForStage}/stages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast('Tahapan perkara baru berhasil ditambahkan.', 'success');
          setSelectedCaseForStage('');
          setArticleTitle('');
          setArticleContent('');
          setArticleAttachments('');
          loadData();
        } else {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast(err.message, 'error');
      });
  };

  if (user?.role !== 'SUPER_ADMIN' && user?.role !== 'EDITOR') {
    return (
      <div className="container flex-center min-h-screen">
        <div className="error-card card-shadow text-center">
          <ShieldAlert size={48} className="text-red mx-auto mb-4" />
          <h3>Akses Ditolak</h3>
          <p>Hanya Admin atau Editor yang memiliki izin untuk mengakses halaman ini.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-page container">
      <div className="admin-header">
        <h1 className="font-display">Panel Kontrol Admin</h1>
        <p className="subtitle">Lakukan moderasi kontribusi publik, kelola perkara, dan pantau aktivitas sistem.</p>
      </div>

      {/* Tabs Nav */}
      <div className="admin-tabs">
        <button
          onClick={() => setActiveTab('contributions')}
          className={`tab-btn ${activeTab === 'contributions' ? 'active' : ''}`}
        >
          <Shield size={16} /> Moderasi Kontribusi ({contributions.length})
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`tab-btn ${activeTab === 'cases' ? 'active' : ''}`}
        >
          <Settings size={16} /> Kelola Perkara & Tahapan
        </button>
        <button
          onClick={() => setActiveTab('logs')}
          className={`tab-btn ${activeTab === 'logs' ? 'active' : ''}`}
        >
          <FileText size={16} /> Log Aktivitas
        </button>
      </div>



      {/* Tab Content */}
      <div className="tab-content-panel">
        {loading ? (
          <div className="flex-center py-8">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <>
            {/* CONTRIBUTIONS TAB */}
            {activeTab === 'contributions' && (
              <div className="contributions-tab">
                {contributions.length === 0 ? (
                  <div className="empty-state-card card-shadow text-center">
                    <CheckCircle size={28} className="text-green mx-auto mb-2" />
                    <h3>Semua bersih!</h3>
                    <p>Tidak ada kontribusi publik tertunda yang membutuhkan moderasi saat ini.</p>
                  </div>
                ) : (
                  <div className="contributions-list-admin">
                    {contributions.map((ct) => {
                      const proofFilesParsed = ct.proofFiles ? JSON.parse(ct.proofFiles) : [];
                      const proofLinksParsed = ct.proofLinks ? JSON.parse(ct.proofLinks) : [];

                      return (
                        <div key={ct.id} className="contribution-row card-shadow">
                          <div className="row-header">
                            <span className="case-num">{ct.case?.caseNumber}</span>
                            <span className="user-info">Oleh: <strong>{ct.user?.name}</strong> ({ct.user?.email})</span>
                          </div>
                          <h4>{ct.case?.title}</h4>
                          <p className="description">{ct.description}</p>
                          
                          {/* Links */}
                          {proofLinksParsed.length > 0 && (
                            <div className="attachments-block-admin">
                              <h5>Tautan Bukti:</h5>
                              <ul>
                                {proofLinksParsed.map((link, idx) => (
                                  <li key={idx}>
                                    <a href={link} target="_blank" rel="noopener noreferrer">
                                      {link}
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Files */}
                          {proofFilesParsed.length > 0 && (
                            <div className="attachments-block-admin mt-2">
                              <h5>File Bukti:</h5>
                              <div className="files-grid-admin">
                                {proofFilesParsed.map((file, idx) => (
                                  <a key={idx} href={`https://be-sampaimana.hallojanu.xyz/${file.path}`} target="_blank" rel="noopener noreferrer" className="file-chip">
                                    <FileText size={12} /> {file.fileName}
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="actions-row mt-4">
                            <button
                              onClick={() => handleVerifyContribution(ct.id, 'APPROVED')}
                              className="btn-primary btn-approve"
                            >
                              Setujui (Approve)
                            </button>
                            <button
                              onClick={() => setRejectingId(ct.id)}
                              className="btn-secondary btn-reject"
                            >
                              Tolak (Reject)
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* CASES TAB */}
            {activeTab === 'cases' && (
              <div className="cases-tab">
                <div className="grid-2-col">
                  {/* Left Column: Create Case */}
                  <div className="form-card card-shadow">
                    <h3>Tambah Perkara Baru</h3>
                    <form onSubmit={handleCreateCase} className="mt-4">
                      <div className="form-group">
                        <label className="form-label">Nomor Perkara</label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: 120/Pid.B/2026/PN.Jkt"
                          value={caseNumber}
                          onChange={(e) => setCaseNumber(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Judul Kasus</label>
                        <input
                          type="text"
                          required
                          placeholder="Misal: Kasus Dugaan Suap Pengadaan Bansos"
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Klasifikasi / Kategori</label>
                        <select
                          required
                          value={categoryId}
                          onChange={(e) => setCategoryId(e.target.value)}
                          className="form-input"
                        >
                          <option value="">-- Pilih Kategori --</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Status Awal</label>
                        <select
                          value={currentStatus}
                          onChange={(e) => setCurrentStatus(e.target.value)}
                          className="form-input"
                        >
                          <option value="PELAPORAN">Pelaporan</option>
                          <option value="PENYIDIKAN">Penyidikan</option>
                          <option value="PENUNTUTAN">Penuntutan</option>
                          <option value="PERSIDANGAN">Persidangan</option>
                          <option value="PUTUSAN">Putusan</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Deskripsi Kasus</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Uraikan ringkasan kasus hukum secara objektif..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="form-input"
                        ></textarea>
                      </div>
                      <button type="submit" className="btn-primary w-full mt-4">
                        Buat Kasus
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Manage Stage Timeline */}
                  <div className="form-card card-shadow">
                    <h3>Tambah Tahapan Timeline & Artikel</h3>
                    <form onSubmit={handleCreateStage} className="mt-4">
                      <div className="form-group">
                        <label className="form-label">Pilih Kasus</label>
                        <select
                          required
                          value={selectedCaseForStage}
                          onChange={(e) => setSelectedCaseForStage(e.target.value)}
                          className="form-input"
                        >
                          <option value="">-- Pilih Kasus --</option>
                          {cases.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.caseNumber} - {c.title}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid-2-col">
                        <div className="form-group">
                          <label className="form-label">Jenis Tahapan</label>
                          <select
                            value={stageType}
                            onChange={(e) => setStageType(e.target.value)}
                            className="form-input"
                          >
                            <option value="PELAPORAN">Pelaporan</option>
                            <option value="PENYIDIKAN">Penyidikan</option>
                            <option value="PENUNTUTAN">Penuntutan</option>
                            <option value="PERSIDANGAN">Persidangan</option>
                            <option value="PUTUSAN">Putusan</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="form-label">Status</label>
                          <select
                            value={stageStatus}
                            onChange={(e) => setStageStatus(e.target.value)}
                            className="form-input"
                          >
                            <option value="AKTIF">Aktif</option>
                            <option value="PENDING">Pending</option>
                            <option value="SELESAI">Selesai</option>
                          </select>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Tanggal Mulai Tahap</label>
                        <input
                          type="date"
                          value={stageStartedAt}
                          onChange={(e) => setStageStartedAt(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <hr className="divider mt-4 mb-4" />
                      <h4>Artikel Penjelasan (Opsional)</h4>
                      <div className="form-group mt-2">
                        <label className="form-label">Judul Artikel</label>
                        <input
                          type="text"
                          placeholder="Misal: Berkas Perkara Dinyatakan Lengkap"
                          value={articleTitle}
                          onChange={(e) => setArticleTitle(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Isi Detail Penjelasan</label>
                        <textarea
                          rows={4}
                          placeholder="Tulis kronologi lengkap atau ringkasan penting hukum pada tahap ini..."
                          value={articleContent}
                          onChange={(e) => setArticleContent(e.target.value)}
                          className="form-input"
                        ></textarea>
                      </div>
                      <div className="form-group">
                        <label className="form-label">Link Lampiran Dokumen (Pisahkan koma jika banyak)</label>
                        <input
                          type="text"
                          placeholder="https://drive.google.com/doc-1, https://situs-berita.com/laporan"
                          value={articleAttachments}
                          onChange={(e) => setArticleAttachments(e.target.value)}
                          className="form-input"
                        />
                      </div>
                      <button type="submit" className="btn-primary w-full mt-4">
                        Tambah Tahap & Artikel
                      </button>
                    </form>
                  </div>
                </div>

                {/* Cases List under */}
                <div className="cases-list-section-admin mt-8">
                  <h3>Daftar Seluruh Kasus ({cases.length})</h3>
                  <div className="cases-table-card card-shadow mt-4">
                    <div className="cases-table-wrapper">
                      <table className="cases-table">
                        <thead>
                          <tr>
                            <th>Nomor Perkara / Judul</th>
                            <th>Status Saat Ini</th>
                            <th>Aksi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cases.map((c) => (
                            <tr key={c.id}>
                              <td>
                                <strong>{c.caseNumber}</strong> - {c.title}
                              </td>
                              <td>{c.currentStatus}</td>
                              <td>
                                <button
                                  onClick={() => handleDeleteCase(c.id)}
                                  className="btn-delete-case flex-center"
                                >
                                  <Trash2 size={14} /> Nonaktifkan
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* LOGS TAB */}
            {activeTab === 'logs' && (
              <div className="logs-tab">
                <h3>Log Audit Sistem</h3>
                <div className="logs-list-card card-shadow mt-4">
                  <div className="logs-table-wrapper">
                    <table className="cases-table">
                      <thead>
                        <tr>
                          <th>Aktivitas</th>
                          <th>Model</th>
                          <th>Pengguna</th>
                          <th>Waktu</th>
                        </tr>
                      </thead>
                      <tbody>
                        {logs.map((log) => (
                          <tr key={log.id}>
                            <td>
                              <span className="log-action">{log.action}</span>
                            </td>
                            <td>{log.modelName}</td>
                            <td>{log.user?.name || 'Sistem'}</td>
                            <td>
                              {new Date(log.createdAt).toLocaleString('id-ID')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Reject Modal */}
      {rejectingId && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card-shadow">
            <h3>Tolak Pengajuan Kontribusi</h3>
            <p>Masukkan alasan penolakan secara jelas agar kontributor memahami kesalahannya.</p>
            <div className="form-group mt-4">
              <label className="form-label">Alasan Penolakan</label>
              <textarea
                required
                rows={4}
                placeholder="Tuliskan alasan penolakan..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="form-input"
              ></textarea>
            </div>
            <div className="modal-actions mt-4">
              <button
                onClick={() => handleVerifyContribution(rejectingId, 'REJECTED', rejectionReason)}
                className="btn-primary btn-reject-confirm"
                disabled={!rejectionReason.trim()}
              >
                Kirim Penolakan
              </button>
              <button onClick={() => setRejectingId(null)} className="btn-secondary">
                Batal
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding-top: 48px;
          padding-bottom: 96px;
        }
        .admin-header {
          margin-bottom: var(--spacing-32);
        }
        .subtitle {
          color: var(--color-ash);
        }
        .admin-tabs {
          display: flex;
          gap: 12px;
          border-bottom: 1px solid var(--color-dove);
          padding-bottom: 12px;
          margin-bottom: var(--spacing-32);
          overflow-x: auto;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: none;
          padding: 8px 16px;
          border-radius: var(--radius-buttons);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-ash);
          cursor: pointer;
          transition: background 0.2s, color 0.2s;
        }
        .tab-btn:hover {
          background-color: var(--surface-fog);
          color: var(--color-ink);
        }
        .tab-btn.active {
          background-color: var(--color-ink);
          color: var(--color-pure-white);
        }
        .contributions-list-admin {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .contribution-row {
          background: white;
          border-radius: var(--radius-cards);
          padding: 24px;
        }
        .row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--color-graphite);
          margin-bottom: 8px;
          flex-wrap: wrap;
        }
        .contribution-row h4 {
          font-size: 16px;
          font-weight: 600;
          margin-bottom: 8px;
        }
        .contribution-row .description {
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-ash);
          margin-bottom: 16px;
          white-space: pre-wrap;
        }
        .attachments-block-admin {
          background-color: var(--surface-fog);
          padding: 12px;
          border-radius: 12px;
          font-size: 13px;
        }
        .attachments-block-admin h5 {
          font-weight: 600;
          margin-bottom: 4px;
        }
        .attachments-block-admin ul {
          padding-left: 16px;
        }
        .attachments-block-admin a {
          color: var(--color-rust);
        }
        .files-grid-admin {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .file-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: white;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid var(--color-dove);
          font-size: 12px;
          text-decoration: none;
          color: var(--color-ink);
        }
        .actions-row {
          display: flex;
          gap: 12px;
        }
        .btn-approve {
          background-color: #10b981;
        }
        .btn-reject {
          color: #ef4444;
        }
        .divider {
          border: 0;
          border-top: 1px solid var(--color-dove);
          opacity: 0.3;
        }
        .btn-delete-case {
          background-color: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          gap: 4px;
        }
        .btn-delete-case:hover {
          background-color: #fca5a5;
        }
        .log-action {
          font-weight: 600;
          font-size: 13px;
          color: var(--color-rust);
        }
        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(23, 25, 28, 0.4);
          z-index: 200;
        }
        .modal-content {
          background: white;
          padding: 32px;
          border-radius: var(--radius-cards);
          width: 90%;
          max-width: 460px;
        }
        .modal-content h3 {
          font-family: var(--font-signifier);
          font-size: 22px;
          margin-bottom: 8px;
        }
        .modal-content p {
          font-size: 13px;
          color: var(--color-ash);
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-reject-confirm {
          background-color: #ef4444;
        }
        .close-alert {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
        }
      `}</style>
    </div>
  );
}

export default Admin;
