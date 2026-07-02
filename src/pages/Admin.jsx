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

  // Editing and nested CRUD states
  const [editingCase, setEditingCase] = useState(null);
  const [editCaseNumber, setEditCaseNumber] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editCurrentStatus, setEditCurrentStatus] = useState('PELAPORAN');

  const [stagesOfSelectedCase, setStagesOfSelectedCase] = useState([]);
  const [editingStage, setEditingStage] = useState(null);

  const [showAddCaseModal, setShowAddCaseModal] = useState(false);
  const [showAddStageModal, setShowAddStageModal] = useState(false);

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
          setShowAddCaseModal(false);
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

  const handleEditCaseClick = (c) => {
    setEditingCase(c);
    setEditCaseNumber(c.caseNumber || '');
    setEditTitle(c.title || '');
    setEditDescription(c.description || '');
    setEditCategoryId(c.categoryId || '');
    setEditCurrentStatus(c.currentStatus || 'PELAPORAN');
  };

  const handleUpdateCase = (e) => {
    e.preventDefault();
    apiFetch(`${API_BASE_URL}/admin/cases/${editingCase.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        caseNumber: editCaseNumber,
        title: editTitle,
        description: editDescription,
        categoryId: editCategoryId,
        currentStatus: editCurrentStatus
      })
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast('Kasus berhasil diperbarui.', 'success');
          setEditingCase(null);
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

  const fetchStagesOfCase = (caseId) => {
    if (!caseId) {
      setStagesOfSelectedCase([]);
      return;
    }
    apiFetch(`${API_BASE_URL}/cases/${caseId}/stages`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setStagesOfSelectedCase(res.data || []);
        }
      })
      .catch((err) => console.error(err));
  };

  const handleCaseChangeForStage = (caseId) => {
    setSelectedCaseForStage(caseId);
    fetchStagesOfCase(caseId);
    setEditingStage(null);
    setStageType('PELAPORAN');
    setStageStatus('AKTIF');
    setStageStartedAt('');
    setArticleTitle('');
    setArticleContent('');
    setArticleAttachments('');
  };

  const handleEditStageClick = (st) => {
    apiFetch(`${API_BASE_URL}/cases/${selectedCaseForStage}/stages/${st.id}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          const detail = res.data;
          setEditingStage(detail);
          setStageType(detail.stageType || 'PELAPORAN');
          setStageStatus(detail.status || 'AKTIF');
          if (detail.startedAt) {
            setStageStartedAt(new Date(detail.startedAt).toISOString().split('T')[0]);
          } else {
            setStageStartedAt('');
          }
          if (detail.article) {
            setArticleTitle(detail.article.title || '');
            setArticleContent(detail.article.content || '');
            
            let attachmentLinks = '';
            if (detail.article.attachments) {
              try {
                const parsed = JSON.parse(detail.article.attachments);
                if (Array.isArray(parsed)) {
                  attachmentLinks = parsed.join(', ');
                }
              } catch (e) {
                attachmentLinks = detail.article.attachments;
              }
            }
            setArticleAttachments(attachmentLinks);
          } else {
            setArticleTitle('');
            setArticleContent('');
            setArticleAttachments('');
          }
        } else {
          throw new Error(res.message);
        }
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast('Gagal memuat detail tahapan.', 'error');
      });
  };

  const handleDeleteStage = (stageId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus tahapan timeline ini?')) return;
    apiFetch(`${API_BASE_URL}/admin/stages/${stageId}`, {
      method: 'DELETE'
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast('Tahapan kasus berhasil dihapus.', 'success');
          fetchStagesOfCase(selectedCaseForStage);
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

  const handleCreateOrUpdateStage = (e) => {
    e.preventDefault();
    
    const stagePayload = {
      stageType,
      status: stageStatus,
      startedAt: stageStartedAt ? new Date(stageStartedAt).toISOString() : new Date().toISOString()
    };

    if (editingStage) {
      apiFetch(`${API_BASE_URL}/admin/stages/${editingStage.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stagePayload)
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            if (articleTitle && articleContent) {
              const articlePayload = {
                title: articleTitle,
                content: articleContent,
                stageId: editingStage.id,
                attachments: articleAttachments ? articleAttachments.split(',').map(link => link.trim()) : []
              };

              const method = editingStage.article ? 'PUT' : 'POST';
              const url = editingStage.article 
                ? `${API_BASE_URL}/admin/articles/${editingStage.article.id}`
                : `${API_BASE_URL}/admin/articles`;

              return apiFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articlePayload)
              }).then(r => r.json());
            }
            return res;
          } else {
            throw new Error(res.message);
          }
        })
        .then((res) => {
          if (showToast) showToast('Tahapan kasus berhasil diperbarui.', 'success');
          setEditingStage(null);
          setArticleTitle('');
          setArticleContent('');
          setArticleAttachments('');
          fetchStagesOfCase(selectedCaseForStage);
          loadData();
        })
        .catch((err) => {
          console.error(err);
          if (showToast) showToast(err.message, 'error');
        });
    } else {
      apiFetch(`${API_BASE_URL}/admin/cases/${selectedCaseForStage}/stages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(stagePayload)
      })
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            if (articleTitle && articleContent) {
              const articlePayload = {
                title: articleTitle,
                content: articleContent,
                stageId: res.data.id,
                attachments: articleAttachments ? articleAttachments.split(',').map(link => link.trim()) : []
              };

              return apiFetch(`${API_BASE_URL}/admin/articles`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(articlePayload)
              }).then(r => r.json());
            }
            return res;
          } else {
            throw new Error(res.message);
          }
        })
        .then((res) => {
          if (showToast) showToast('Tahapan perkara baru berhasil ditambahkan.', 'success');
          setArticleTitle('');
          setArticleContent('');
          setArticleAttachments('');
          fetchStagesOfCase(selectedCaseForStage);
          loadData();
        })
        .catch((err) => {
          console.error(err);
          if (showToast) showToast(err.message, 'error');
        });
    }
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
                      const parseJsonSafely = (val) => {
                        if (typeof val === 'string') {
                          try { return JSON.parse(val); } catch (e) { return []; }
                        }
                        return Array.isArray(val) ? val : [];
                      };
                      const proofFilesParsed = parseJsonSafely(ct.proofFiles);
                      const proofLinksParsed = parseJsonSafely(ct.proofLinks);

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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '650', color: 'var(--color-ink)', margin: 0 }}>Daftar Seluruh Kasus ({cases.length})</h3>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <button 
                      onClick={() => setShowAddCaseModal(true)} 
                      className="btn-primary"
                      style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    >
                      <Plus size={16} /> Tambah Perkara
                    </button>
                    <button 
                      onClick={() => setShowAddStageModal(true)} 
                      className="btn-secondary"
                      style={{ padding: '10px 18px', fontSize: '13px', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '6px', border: '1px solid var(--color-dove)' }}
                    >
                      <Plus size={16} /> Tambah/Kelola Tahapan
                    </button>
                  </div>
                </div>

                <div className="cases-table-card card-shadow">
                  <div className="cases-table-wrapper">
                    <table className="cases-table">
                      <thead>
                        <tr>
                          <th>Nomor Perkara / Judul</th>
                          <th>Kategori</th>
                          <th>Status Saat Ini</th>
                          <th>Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {cases.map((c) => (
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
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  onClick={() => handleEditCaseClick(c)}
                                  className="btn-edit-case flex-center"
                                  style={{
                                    display: 'inline-flex',
                                    backgroundColor: '#eff6ff',
                                    color: '#2563eb',
                                    border: 'none',
                                    padding: '6px 12px',
                                    borderRadius: '8px',
                                    fontSize: '12px',
                                    fontWeight: '600',
                                    cursor: 'pointer',
                                    gap: '4px'
                                  }}
                                >
                                  <Edit3 size={14} /> Edit
                                </button>
                                <button
                                  onClick={() => handleDeleteCase(c.id)}
                                  className="btn-delete-case flex-center"
                                >
                                  <Trash2 size={14} /> Nonaktifkan
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
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
      
      {/* Edit Case Modal */}
      {editingCase && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card-shadow" style={{ maxWidth: '580px', width: '95%' }}>
            <h3>Edit Kasus Hukum</h3>
            <p>Perbarui rincian kasus hukum secara teliti.</p>
            <form onSubmit={handleUpdateCase} className="mt-4">
              <div className="form-group">
                <label className="form-label">Nomor Perkara</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: 120/Pid.B/2026/PN.Jkt"
                  value={editCaseNumber}
                  onChange={(e) => setEditCaseNumber(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Judul Kasus</label>
                <input
                  type="text"
                  required
                  placeholder="Misal: Kasus Dugaan Suap Pengadaan Bansos"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Klasifikasi / Kategori</label>
                <select
                  required
                  value={editCategoryId}
                  onChange={(e) => setEditCategoryId(e.target.value)}
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
                <label className="form-label">Status Saat Ini</label>
                <select
                  value={editCurrentStatus}
                  onChange={(e) => setEditCurrentStatus(e.target.value)}
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
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="form-input"
                ></textarea>
              </div>
              <div className="modal-actions mt-6">
                <button type="submit" className="btn-primary">
                  Simpan Perubahan
                </button>
                <button type="button" onClick={() => setEditingCase(null)} className="btn-secondary">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Case Modal */}
      {showAddCaseModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card-shadow" style={{ maxWidth: '580px', width: '95%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Tambah Perkara Baru</h3>
              <button 
                onClick={() => setShowAddCaseModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-graphite)' }}
              >
                <XCircle size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCase}>
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
              <div className="modal-actions mt-6">
                <button type="submit" className="btn-primary">
                  Buat Kasus
                </button>
                <button type="button" onClick={() => setShowAddCaseModal(false)} className="btn-secondary">
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Manage Stage Modal */}
      {showAddStageModal && (
        <div className="modal-overlay flex-center">
          <div className="modal-content card-shadow" style={{ maxWidth: '640px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>{editingStage ? 'Edit Tahapan Timeline & Artikel' : 'Tambah/Kelola Tahapan Timeline'}</h3>
              <button 
                onClick={() => {
                  setShowAddStageModal(false);
                  setEditingStage(null);
                  setSelectedCaseForStage('');
                  setStagesOfSelectedCase([]);
                }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-graphite)' }}
              >
                <XCircle size={20} />
              </button>
            </div>
            
            <form onSubmit={handleCreateOrUpdateStage}>
              <div className="form-group">
                <label className="form-label">Pilih Kasus</label>
                <select
                  required
                  value={selectedCaseForStage}
                  onChange={(e) => handleCaseChangeForStage(e.target.value)}
                  className="form-input"
                  disabled={!!editingStage}
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
              
              <div style={{ display: 'flex', gap: '12px' }} className="mt-4">
                <button type="submit" disabled={!selectedCaseForStage} className="btn-primary w-full">
                  {editingStage ? 'Simpan Perubahan' : 'Tambah Tahap & Artikel'}
                </button>
                {editingStage && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingStage(null);
                      setStageType('PELAPORAN');
                      setStageStatus('AKTIF');
                      setStageStartedAt('');
                      setArticleTitle('');
                      setArticleContent('');
                      setArticleAttachments('');
                    }}
                    className="btn-secondary w-full"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>

            {selectedCaseForStage && (
              <div className="stages-list-section mt-6" style={{ borderTop: '1px solid var(--color-fog)', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--color-ink)' }}>Daftar Tahapan Saat Ini ({stagesOfSelectedCase.length})</h4>
                {stagesOfSelectedCase.length === 0 ? (
                  <p style={{ fontSize: '13px', color: 'var(--color-ash)', marginTop: '8px' }}>Belum ada tahapan pada perkara ini.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                    {stagesOfSelectedCase.map((st) => (
                      <div
                        key={st.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          backgroundColor: 'var(--surface-fog)',
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid var(--color-fog)'
                        }}
                      >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'flex-start' }}>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--color-ink)' }}>{st.stageType}</span>
                            <span
                              style={{
                                fontSize: '10px',
                                fontWeight: '700',
                                marginLeft: '8px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                backgroundColor: st.status === 'SELESAI' ? '#dcfce7' : st.status === 'AKTIF' ? '#e0f2fe' : '#fef3c7',
                                color: st.status === 'SELESAI' ? '#15803d' : st.status === 'AKTIF' ? '#0369a1' : '#b45309'
                              }}
                            >
                              {st.status}
                            </span>
                          </div>
                          {st.article && (
                            <div style={{ fontSize: '11px', color: 'var(--color-graphite)', marginTop: '2px' }}>
                              Artikel: {st.article.title}
                            </div>
                          )}
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            type="button"
                            onClick={() => handleEditStageClick(st)}
                            style={{
                              backgroundColor: '#eff6ff',
                              color: '#2563eb',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStage(st.id)}
                            style={{
                              backgroundColor: '#fee2e2',
                              color: '#ef4444',
                              border: 'none',
                              padding: '6px 12px',
                              borderRadius: '8px',
                              fontSize: '11px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            Hapus
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .admin-page {
          padding-top: var(--spacing-40);
          padding-bottom: var(--spacing-96);
        }
        .admin-header {
          margin-bottom: var(--spacing-40);
        }
        .admin-header h1 {
          font-size: var(--text-heading-sm);
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 6px;
        }
        .subtitle {
          color: var(--color-ash);
          font-size: 15px;
        }
        .admin-tabs {
          display: flex;
          gap: 8px;
          border-bottom: 1px solid rgba(0, 0, 0, 0.06);
          padding-bottom: var(--spacing-16);
          margin-bottom: var(--spacing-32);
          overflow-x: auto;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          border: none;
          background: none;
          padding: 10px 20px;
          border-radius: var(--radius-buttons);
          font-size: 14px;
          font-weight: 600;
          color: var(--color-graphite);
          cursor: pointer;
          transition: background-color var(--duration-fast) ease, color var(--duration-fast) ease, transform var(--duration-fast) ease;
          white-space: nowrap;
        }
        .tab-btn:hover {
          background-color: var(--surface-fog);
          color: var(--color-ink);
        }
        .tab-btn:active {
          transform: scale(0.97);
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
          padding: var(--spacing-28);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s var(--ease-out), box-shadow 0.3s var(--ease-out);
          animation: fadeInUp 0.4s var(--ease-out) forwards;
          opacity: 0;
        }
        .contribution-row:nth-child(1) { animation-delay: 0ms; }
        .contribution-row:nth-child(2) { animation-delay: 60ms; }
        .contribution-row:nth-child(3) { animation-delay: 120ms; }
        .contribution-row:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .row-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
          color: var(--color-graphite);
          margin-bottom: 12px;
          flex-wrap: wrap;
          gap: 8px;
        }
        .contribution-row h4 {
          font-size: 17px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 8px;
        }
        .contribution-row .description {
          font-size: 14px;
          line-height: 1.5;
          color: var(--color-ash);
          margin-bottom: var(--spacing-20);
          white-space: pre-wrap;
        }
        .attachments-block-admin {
          background-color: var(--surface-fog);
          padding: var(--spacing-16);
          border-radius: 12px;
          font-size: 13px;
          border: 1px solid var(--color-fog);
        }
        .attachments-block-admin h5 {
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 6px;
        }
        .attachments-block-admin ul {
          padding-left: 20px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .attachments-block-admin a {
          color: var(--color-rust);
          text-decoration: none;
          font-weight: 500;
          transition: opacity 0.2s;
        }
        .attachments-block-admin a:hover {
          opacity: 0.8;
          text-decoration: underline;
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
          padding: 6px 12px;
          border-radius: 8px;
          border: 1px solid var(--color-dove);
          font-size: 12px;
          text-decoration: none;
          color: var(--color-ink);
          font-weight: 500;
          transition: border-color 0.2s, background-color 0.2s;
        }
        .file-chip:hover {
          border-color: var(--color-ink);
          background-color: var(--surface-fog);
        }
        .actions-row {
          display: flex;
          gap: 12px;
        }
        .btn-approve {
          background-color: #16a34a;
          color: white;
          border: none;
          border-radius: var(--radius-buttons);
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s, transform 0.1s;
        }
        .btn-approve:hover {
          opacity: 0.9;
        }
        .btn-approve:active {
          transform: scale(0.97);
        }
        .btn-reject {
          color: #ef4444;
          background-color: #fee2e2;
          border: 1px solid transparent;
          border-radius: var(--radius-buttons);
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.2s, color 0.2s, transform 0.1s;
        }
        .btn-reject:hover {
          background-color: #fca5a5;
          color: #b91c1c;
        }
        .btn-reject:active {
          transform: scale(0.97);
        }
        .divider {
          border: 0;
          border-top: 1px solid var(--color-fog);
          margin: var(--spacing-20) 0;
        }
        .btn-delete-case {
          background-color: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          gap: 4px;
          transition: background-color 0.2s, color 0.2s;
        }
        .btn-delete-case:hover {
          background-color: #fca5a5;
          color: #b91c1c;
        }
        .log-action {
          font-weight: 600;
          font-size: 13px;
          color: var(--color-rust);
          background-color: var(--color-apricot-wash);
          padding: 2px 6px;
          border-radius: 4px;
        }
        /* Modal Overlay */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(23, 25, 28, 0.5);
          z-index: 200;
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          animation: fadeIn 0.25s ease forwards;
        }
        .modal-content {
          background: white;
          padding: var(--spacing-32);
          border-radius: var(--radius-cards);
          width: 90%;
          max-width: 480px;
          border: 1px solid rgba(0, 0, 0, 0.06);
          box-shadow: var(--shadow-elevated);
          animation: scale-in 0.3s var(--ease-spring) forwards;
          opacity: 0;
        }
        .modal-content h3 {
          font-family: var(--font-signifier);
          font-size: 22px;
          color: var(--color-ink);
          margin-bottom: 8px;
        }
        .modal-content p {
          font-size: 13px;
          color: var(--color-graphite);
          line-height: 1.45;
        }
        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
        }
        .btn-reject-confirm {
          background-color: #ef4444;
          color: white;
          border: none;
          border-radius: var(--radius-buttons);
          padding: 8px 18px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          transition: opacity 0.2s;
        }
        .btn-reject-confirm:hover {
          opacity: 0.9;
        }
        .btn-reject-confirm:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .close-alert {
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: inherit;
        }
        /* Admin Form & Input Alignments */
        .admin-page .form-input {
          font-family: var(--font-sohne);
          font-size: 15px;
          padding: 12px 16px;
          border-radius: var(--radius-inputs);
          border: 1px solid var(--color-dove);
          background-color: var(--color-pure-white);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .admin-page .form-input:focus {
          border-color: var(--color-ink);
          box-shadow: 0 0 0 3px rgba(23, 25, 28, 0.08);
        }
        .admin-page select.form-input {
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23777b86' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        /* Tables refinement */
        .cases-table th {
          background-color: var(--surface-fog);
          padding: 16px 20px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-ink);
          border-bottom: 1px solid var(--color-dove);
        }
        .cases-table td {
          padding: 18px 20px;
          border-bottom: 1px solid var(--color-fog);
          font-size: 14px;
          vertical-align: middle;
        }
        .cases-table tr:hover td {
          background-color: rgba(23, 25, 28, 0.01);
        }
      `}</style>
    </div>
  );
}

export default Admin;
