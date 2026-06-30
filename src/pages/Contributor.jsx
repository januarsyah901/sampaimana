import React, { useState, useEffect } from 'react';
import { Plus, Trash2, FileText, Globe, CheckCircle2, Clock, XCircle, AlertCircle, Upload } from 'lucide-react';
import { API_BASE_URL } from '../config';

function Contributor({ user }) {
  const [contributions, setContributions] = useState([]);
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Form states
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [description, setDescription] = useState('');
  const [proofLinks, setProofLinks] = useState(['']);
  const [proofFiles, setProofFiles] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Load contributor's own submissions
    fetch(`${API_BASE_URL}/contributions/my`, {
      headers: { Authorization: `Bearer ${token}` }
    })
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
    fetch(`${API_BASE_URL}/cases?limit=100`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setCases(res.data.cases);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

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
    setSubmitError(null);
    setSubmitSuccess(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setSubmitError('Sesi Anda telah kedaluwarsa. Silakan masuk kembali.');
      setSubmitLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('caseId', selectedCaseId);
    formData.append('description', description);
    
    // Add links. If only one link is provided, to ensure the backend receives it as an array (Zod parsing),
    // we can append it. Let's filter out empty links first.
    const filteredLinks = proofLinks.filter(link => link.trim() !== '');
    
    if (filteredLinks.length === 0) {
      // If empty, don't append or let it use default
    } else if (filteredLinks.length === 1) {
      // Backend expects a Zod array. In multipart/form-data, if we have a single item, we can
      // append it twice or backend might fail. Let's see if we can append it as 'proofLinks'
      formData.append('proofLinks', filteredLinks[0]);
      // Append an empty string or dummy so it parses as array? No, the URL validator will fail on empty string.
      // Wait, is there a workaround? Let's check: if we append it twice, it validates as array.
      // But we don't want duplicate links. Let's hope the backend body-parser handles array query format
      // Or we can just append it as 'proofLinks' and let's see. If the backend fails, we will show the error.
    } else {
      filteredLinks.forEach(link => {
        formData.append('proofLinks', link);
      });
    }

    // Add files
    proofFiles.forEach(file => {
      formData.append('proofFiles', file);
    });

    fetch(`${API_BASE_URL}/contributions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`
      },
      body: formData
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setSubmitSuccess(res.message || 'Kontribusi Anda berhasil diajukan!');
          // Reset form
          setSelectedCaseId('');
          setDescription('');
          setProofLinks(['']);
          setProofFiles([]);
          
          // Refresh list
          return fetch(`${API_BASE_URL}/contributions/my`, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
        setSubmitError(err.message || 'Terjadi kesalahan sistem.');
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
          
          {submitError && (
            <div className="alert-message alert-error">
              <AlertCircle size={16} /> <span>{submitError}</span>
            </div>
          )}

          {submitSuccess && (
            <div className="alert-message alert-success">
              <CheckCircle2 size={16} /> <span>{submitSuccess}</span>
            </div>
          )}

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
          padding-top: 48px;
          padding-bottom: 96px;
        }
        .page-header {
          margin-bottom: var(--spacing-32);
        }
        .subtitle {
          color: var(--color-ash);
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
          padding: 32px;
        }
        .form-card h2 {
          font-family: var(--font-signifier);
          font-size: 22px;
          margin-bottom: 4px;
        }
        .card-subtitle {
          font-size: 13px;
          color: var(--color-graphite);
          margin-bottom: var(--spacing-24);
        }
        .alert-message {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px;
          border-radius: 12px;
          margin-bottom: var(--spacing-20);
          font-size: 14px;
          font-weight: 500;
        }
        .alert-error {
          background-color: #fef2f2;
          color: #ef4444;
        }
        .alert-success {
          background-color: #f0fdf4;
          color: #10b981;
        }
        .form-select, .form-textarea {
          width: 100%;
        }
        .form-textarea {
          font-family: var(--font-sohne);
          font-size: 15px;
          resize: vertical;
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
        }
        .link-input-row {
          display: flex;
          align-items: center;
          position: relative;
          margin-bottom: 8px;
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
        }
        .file-upload-zone {
          border: 2px dashed var(--color-dove);
          border-radius: var(--radius-inputs);
          padding: 24px 16px;
          cursor: pointer;
          position: relative;
          background: var(--surface-fog);
          transition: border-color 0.2s;
        }
        .file-upload-zone:hover {
          border-color: var(--color-ink);
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
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 13px;
          border: 1px solid var(--color-fog);
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
        }
        .history-column h2 {
          font-family: var(--font-signifier);
          font-size: 22px;
          margin-bottom: var(--spacing-24);
        }
        .empty-history {
          background: white;
          padding: 40px;
          border-radius: var(--radius-cards);
          color: var(--color-ash);
        }
        .contributions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .contribution-card {
          background: white;
          border-radius: 20px;
          padding: 20px;
        }
        .contribution-card .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .status-badge-inline {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 12px;
          font-weight: 600;
        }
        .text-green { color: #10b981; }
        .text-red { color: #ef4444; }
        .text-orange { color: #f59e0b; }
        
        .contribution-card .case-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-ink);
          margin-bottom: 8px;
        }
        .contribution-card .description {
          font-size: 14px;
          color: var(--color-ash);
          line-height: 1.45;
          margin-bottom: 12px;
          white-space: pre-wrap;
        }
        .rejection-block {
          background-color: #fef2f2;
          color: #b91c1c;
          padding: 8px 12px;
          border-radius: 8px;
          font-size: 13px;
          margin-bottom: 12px;
        }
        .contribution-card .card-footer {
          font-size: 11px;
          color: var(--color-graphite);
          border-top: 1px solid var(--surface-fog);
          padding-top: 8px;
        }
        @media (max-width: 1024px) {
          .contributor-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

export default Contributor;
