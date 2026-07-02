import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Globe, CheckCircle2, Clock, XCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Contributor({ user, apiFetch, showToast }) {
  const [contributions, setContributions] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Form states
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [description, setDescription] = useState('');
  const [proofLinks, setProofLinks] = useState(['']);
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Load contributor's own submissions
    apiFetch(`${API_BASE_URL}/contributions/my`)
      .then((res) => {
        if (!res.ok) throw new Error('Gagal memuat kontribusi');
        return res.json();
      })
      .then((res) => {
        if (res.success) {
          setContributions(res.data);
        }
      })
      .catch((err) => console.error(err));

    // Load active cases for dropdown selection
    apiFetch(`${API_BASE_URL}/cases?limit=100`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCases(res.data || []);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [apiFetch]);

  const handleAddLink = () => {
    setProofLinks([...proofLinks, '']);
  };

  const handleRemoveLink = (index) => {
    const updated = [...proofLinks];
    updated.splice(index, 1);
    setProofLinks(updated);
  };

  const handleLinkChange = (index, value) => {
    const updated = [...proofLinks];
    updated[index] = value;
    setProofLinks(updated);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + proofFiles.length > 5) {
      alert('Maksimal hanya dapat mengunggah 5 file bukti.');
      return;
    }
    setProofFiles([...proofFiles, ...files]);
  };

  const handleRemoveFile = (index) => {
    const updated = [...proofFiles];
    updated.splice(index, 1);
    setProofFiles(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    const token = localStorage.getItem('token');
    if (!token) {
      if (showToast) showToast('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.', 'error');
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('caseId', selectedCaseId);
    formData.append('description', description);
    
    const filteredLinks = proofLinks.filter(link => link.trim() !== '');
    
    if (filteredLinks.length > 0) {
      filteredLinks.forEach(link => {
        formData.append('proofLinks', link);
      });
    }

    proofFiles.forEach(file => {
      formData.append('proofFiles', file);
    });

    apiFetch(`${API_BASE_URL}/contributions`, {
      method: 'POST',
      body: formData
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          if (showToast) showToast(res.message || 'Kontribusi Anda berhasil diajukan!', 'success');
          // Reset form
          setSelectedCaseId('');
          setDescription('');
          setProofLinks(['']);
          setProofFiles([]);
          
          // Refresh list
          return apiFetch(`${API_BASE_URL}/contributions/my`);
        } else {
          throw new Error(res.message || 'Gagal mengirim kontribusi');
        }
      })
      .then((res) => {
        if (res && res.json) return res.json();
      })
      .then((res) => {
        if (res && res.success) {
          setContributions(res.data);
        }
        setSubmitLoading(false);
      })
      .catch((err) => {
        console.error(err);
        if (showToast) showToast(err.message || 'Terjadi kesalahan sistem.', 'error');
        setSubmitLoading(false);
      });
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'APPROVED': return <CheckCircle2 size={16} className="text-green" />;
      case 'REJECTED': return <XCircle size={16} className="text-red" />;
      default: return <Clock size={16} className="text-orange" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'APPROVED': return 'Disetujui';
      case 'REJECTED': return 'Ditolak';
      default: return 'Pending Moderasi';
    }
  };

  return (
    <div className="contributor-page container">
      <div className="page-header">
        <h1 className="font-display">Kontribusi Saya</h1>
        <p className="subtitle">Ajukan perkembangan informasi perkara hukum atau pantau status moderasi pengajuan Anda.</p>
      </div>

      <div className="contributor-grid">
        {/* Left Column: Form Contribution */}
        <div className="form-card card-shadow">
          <h2>Ajukan Update Kasus</h2>
          <p className="card-subtitle">Kirim bukti berkas/link berita resmi mengenai perkembangan perkara.</p>
          


          <form onSubmit={handleSubmit} className="contribution-form">
            <div className="form-group">
              <label className="form-label">Pilih Kasus Hukum</label>
              <select
                required
                value={selectedCaseId}
                onChange={(e) => setSelectedCaseId(e.target.value)}
                className="form-input form-select"
              >
                <option value="">-- Pilih Kasus --</option>
                {cases.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.caseNumber} - {c.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Uraian Perkembangan / Detail Informasi</label>
              <textarea
                required
                rows={5}
                placeholder="Tuliskan perkembangan kasus secara jelas (minimal 10 karakter). Misal: Tersangka telah dipindahkan ke Rutan, atau berkas dinyatakan lengkap (P21)..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="form-input form-textarea"
              ></textarea>
            </div>

            {/* Proof Links */}
            <div className="form-group">
              <label className="form-label flex-between">
                <span>Tautan Bukti / Berita Resmi</span>
                <button type="button" onClick={handleAddLink} className="btn-add-link">
                  <Plus size={14} /> Tambah Link
                </button>
              </label>
              {proofLinks.map((link, idx) => (
                <div key={idx} className="link-input-row">
                  <Globe size={16} className="input-icon" />
                  <input
                    type="url"
                    placeholder="https://berita-resmi.com/kasus-ini"
                    value={link}
                    onChange={(e) => handleLinkChange(idx, e.target.value)}
                    className="form-input"
                  />
                  {proofLinks.length > 1 && (
                    <button type="button" onClick={() => handleRemoveLink(idx)} className="btn-remove-link">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Files Upload */}
            <div className="form-group">
              <label className="form-label">Unggah Dokumen Pendukung (Max 5 file)</label>
              <div className="file-upload-zone text-center">
                <Upload size={24} className="upload-icon" />
                <p>Klik untuk memilih file bukti (PDF, PNG, JPG, Doc)</p>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="file-input-hidden"
                />
              </div>
              {proofFiles.length > 0 && (
                <div className="uploaded-files-list">
                  {proofFiles.map((file, idx) => (
                    <div key={idx} className="uploaded-file-row">
                      <FileText size={14} />
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      <button type="button" onClick={() => handleRemoveFile(idx)} className="btn-remove-file">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={submitLoading} className="btn-primary w-full mt-4">
              {submitLoading ? 'Mengirim...' : 'Kirim Pengajuan'}
            </button>
          </form>
        </div>

        {/* Right Column: History of Submissions */}
        <div className="history-column">
          <h2>Riwayat Kontribusi Anda</h2>
          
          {loading ? (
            <div className="flex-center py-8">
              <div className="loading-spinner"></div>
            </div>
          ) : contributions.length === 0 ? (
            <div className="empty-history card-shadow text-center">
              <p>Anda belum pernah mengirimkan kontribusi.</p>
            </div>
          ) : (
            <div className="contributions-list">
              {contributions.map((ct) => (
                <div key={ct.id} className="contribution-card card-shadow">
                  <div className="card-header">
                    <span className="case-num">{ct.case?.caseNumber || 'Kasus'}</span>
                    <span className={`status-badge-inline status-${ct.status.toLowerCase()}`}>
                      {getStatusIcon(ct.status)} {getStatusText(ct.status)}
                    </span>
                  </div>
                  <h4 className="case-title">{ct.case?.title}</h4>
                  <p className="description">{ct.description}</p>
                  
                  {ct.rejectionReason && (
                    <div className="rejection-block">
                      <strong>Alasan Penolakan:</strong> {ct.rejectionReason}
                    </div>
                  )}

                  <div className="card-footer">
                    <span>
                      Diajukan: {new Date(ct.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .contributor-page {
          padding-top: var(--spacing-40);
          padding-bottom: var(--spacing-96);
        }
        .page-header {
          margin-bottom: var(--spacing-40);
        }
        .page-header h1 {
          font-size: var(--text-heading-sm);
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 6px;
        }
        .subtitle {
          color: var(--color-ash);
          font-size: 15px;
        }
        .contributor-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: var(--spacing-32);
          align-items: start;
        }
        .form-card {
          background-color: var(--color-pure-white);
          border-radius: var(--radius-cards);
          padding: var(--spacing-32);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          animation: fadeInUp 0.5s var(--ease-out) forwards;
        }
        .history-column h2 {
          font-family: var(--font-signifier);
          font-size: 22px;
          color: var(--color-ink);
          margin-bottom: var(--spacing-24);
          font-weight: 500;
          animation: fadeInUp 0.5s var(--ease-out) 0.15s forwards;
          opacity: 0;
        }
        .form-card h2 {
          font-family: var(--font-signifier);
          font-size: 22px;
          color: var(--color-ink);
          margin-bottom: 6px;
          font-weight: 500;
        }
        .card-subtitle {
          font-size: 13px;
          color: var(--color-graphite);
          margin-bottom: var(--spacing-28);
        }
        .form-select {
          width: 100%;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23777b86' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          background-size: 16px;
          padding-right: 40px;
        }
        .form-textarea {
          width: 100%;
          font-family: var(--font-sohne);
          font-size: 15px;
          resize: vertical;
          min-height: 120px;
          line-height: 1.45;
        }
        .form-input {
          font-family: var(--font-sohne);
          font-size: 15px;
          padding: 12px 16px;
          border-radius: var(--radius-inputs);
          border: 1px solid var(--color-dove);
          background-color: var(--color-pure-white);
          outline: none;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
        }
        .form-input:focus {
          border-color: var(--color-ink);
          box-shadow: 0 0 0 3px rgba(23, 25, 28, 0.08);
        }
        .flex-between {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .btn-add-link {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--color-rust);
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          transition: opacity 0.2s;
        }
        .btn-add-link:hover {
          opacity: 0.8;
        }
        .link-input-row {
          display: flex;
          align-items: center;
          position: relative;
          margin-bottom: 8px;
          animation: fadeIn 0.2s ease forwards;
        }
        .link-input-row .input-icon {
          position: absolute;
          left: 14px;
          color: var(--color-graphite);
        }
        .link-input-row .form-input {
          padding-left: 40px;
          flex: 1;
        }
        .btn-remove-link {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.2s;
        }
        .btn-remove-link:hover {
          color: #b91c1c;
        }
        .file-upload-zone {
          border: 2px dashed var(--color-dove);
          border-radius: var(--radius-inputs);
          padding: var(--spacing-24) var(--spacing-16);
          cursor: pointer;
          position: relative;
          background: var(--surface-fog);
          transition: border-color 0.2s, background-color 0.2s;
        }
        .file-upload-zone:hover {
          border-color: var(--color-ink);
          background-color: rgba(23, 25, 28, 0.02);
        }
        .upload-icon {
          color: var(--color-graphite);
          margin-bottom: 8px;
        }
        .file-upload-zone p {
          font-size: 13px;
          color: var(--color-ash);
        }
        .file-input-hidden {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
        }
        .uploaded-files-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 12px;
        }
        .uploaded-file-row {
          display: flex;
          align-items: center;
          background-color: var(--surface-fog);
          padding: 8px 12px;
          border-radius: 12px;
          font-size: 13px;
          border: 1px solid var(--color-fog);
          animation: fadeIn 0.2s ease forwards;
        }
        .file-name {
          font-weight: 500;
          color: var(--color-ink);
          margin-left: 8px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 220px;
        }
        .file-size {
          color: var(--color-graphite);
          margin-left: 6px;
        }
        .btn-remove-file {
          background: none;
          border: none;
          cursor: pointer;
          color: #ef4444;
          margin-left: auto;
          display: flex;
          align-items: center;
          transition: color 0.2s;
        }
        .btn-remove-file:hover {
          color: #b91c1c;
        }
        .history-column h2 {
          font-family: var(--font-signifier);
          font-size: 22px;
          color: var(--color-ink);
          margin-bottom: var(--spacing-24);
          font-weight: 500;
        }
        .empty-history {
          background: white;
          padding: var(--spacing-40);
          border-radius: var(--radius-cards);
          color: var(--color-ash);
          border: 1px solid var(--color-fog);
        }
        .contributions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contribution-card {
          background: white;
          border-radius: var(--radius-cards);
          padding: var(--spacing-24);
          border: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: var(--shadow-sm);
          transition: transform 0.25s var(--ease-out), box-shadow 0.3s var(--ease-out);
          animation: fadeInUp 0.4s var(--ease-out) forwards;
          opacity: 0;
        }
        .contribution-card:nth-child(1) { animation-delay: 0ms; }
        .contribution-card:nth-child(2) { animation-delay: 60ms; }
        .contribution-card:nth-child(3) { animation-delay: 120ms; }
        .contribution-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }
        .contribution-card .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .case-num {
          font-size: 12px;
          font-weight: 600;
          color: var(--color-graphite);
          background-color: var(--surface-fog);
          padding: 3px 8px;
          border-radius: 6px;
        }
        .status-badge-inline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-tags);
        }
        .status-badge-inline.status-approved {
          background-color: #dcfce7;
          color: #16a34a;
        }
        .status-badge-inline.status-rejected {
          background-color: #fee2e2;
          color: #ef4444;
        }
        .status-badge-inline.status-pending {
          background-color: #fef3c7;
          color: #d97706;
        }
        
        .contribution-card .case-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 8px;
        }
        .contribution-card .description {
          font-size: 14px;
          color: var(--color-ash);
          line-height: 1.5;
          margin-bottom: var(--spacing-16);
          white-space: pre-wrap;
        }
        .rejection-block {
          background-color: #fef2f2;
          color: #b91c1c;
          padding: 10px 14px;
          border-radius: 12px;
          font-size: 13px;
          margin-bottom: var(--spacing-16);
          border-left: 3px solid #ef4444;
          line-height: 1.45;
        }
        .contribution-card .card-footer {
          font-size: 11px;
          color: var(--color-graphite);
          border-top: 1px solid var(--surface-fog);
          padding-top: 12px;
        }
        @media (max-width: 1024px) {
          .contributor-grid {
            grid-template-columns: 1fr;
            gap: var(--spacing-24);
          }
        }
      `}</style>
    </div>
  );
}

export default Contributor;
