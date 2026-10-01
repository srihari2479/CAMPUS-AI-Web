import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, Plus, Database, Sparkles, CheckCircle, Trash2, Download, RefreshCw } from 'lucide-react';
import { supabase } from '../services/supabase';

interface DocumentItem {
  id: string;
  title: string;
  doc_type: string;
  course_code: string;
  file_url?: string;
  created_at: string;
}

export default function Uploads() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState('study_guide');
  const [courseCode, setCourseCode] = useState('');
  const [semester, setSemester] = useState('1');
  const [file, setFile] = useState<File | null>(null);

  // Publish Modal State
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [pendingDocId, setPendingDocId] = useState('');
  const [pendingFileUrl, setPendingFileUrl] = useState('');
  const [publishing, setPublishing] = useState(false);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      setLoading(true);
      // Fetch from Supabase. Fallback to mock data if it fails (e.g. table doesn't exist yet)
      const { data, error } = await supabase
        .from('documents')
        .select('id, title, doc_type, file_url, courses(code), created_at')
        .order('created_at', { ascending: false });

      if (error || !data) {
        console.warn("Could not query documents table, using mock data.");
        setDocuments([
          { id: '1', title: 'Unit 3: Database Normalization', doc_type: 'study_guide', course_code: 'CS302', created_at: '2026-06-21T10:00:00Z' },
          { id: '2', title: 'DBMS End Sem Question Paper 2025', doc_type: 'question_paper', course_code: 'CS302', created_at: '2026-06-20T12:30:00Z' },
          { id: '3', title: 'Introduction to Computer Networks', doc_type: 'lecture_note', course_code: 'CS304', created_at: '2026-06-18T09:15:00Z' }
        ]);
      } else {
        const formatted = data.map((doc: any) => ({
          id: doc.id,
          title: doc.title,
          doc_type: doc.doc_type,
          course_code: doc.courses?.code || 'GENERIC',
          file_url: doc.file_url,
          created_at: doc.created_at
        }));
        setDocuments(formatted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !courseCode || !file) {
      alert("Please fill in all fields and select a file.");
      return;
    }

    try {
      setUploading(true);
      setSuccessMessage('');

      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('doc_type', docType);
      formData.append('course_id', courseCode.toUpperCase());
      formData.append('semester', semester);

      const apiUrl = import.meta.env.VITE_API_URL || 'https://srihari2479-college-rag-api.hf.space';
      const response = await fetch(`${apiUrl}/api/rag/ingest`, {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${response.status} - ${errorText}`);
      }

      const result = await response.json();
      setSuccessMessage(`Document uploaded and parsed! Generated ${result.total_chunks} chunks and vectors successfully.`);
      
      // Open publish modal if a URL was generated
      if (result.file_url && result.document_id) {
        setPendingDocId(result.document_id);
        setPendingFileUrl(result.file_url);
        setShowPublishModal(true);
      }

      // Reset form
      setTitle('');
      setCourseCode('');
      setFile(null);
      
      // Refresh list from database
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Upload failed. Check console.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this document and all its chunks from the database?")) {
      return;
    }
    try {
      setLoading(true);
      setSuccessMessage('');
      const apiUrl = import.meta.env.VITE_API_URL || 'https://srihari2479-college-rag-api.hf.space';
      const response = await fetch(`${apiUrl}/api/rag/document/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Deletion failed: ${response.status} - ${errorText}`);
      }

      setSuccessMessage('Document and its vector index chunks deleted successfully.');
      await fetchDocuments();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Deletion failed. Check console.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="uploads-page">
      <header className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <FileText size={28} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ margin: 0 }}>Document Manager</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>Upload files to run the table extraction parser, text splitter, and vector indexer.</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchDocuments} style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Upload Form */}
        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UploadCloud size={20} className="brand-icon" />
            <span>Ingest Document</span>
          </h3>

          <div className="horizontal-parser-container">
            {/* Left Column: PDF File Drag/Drop */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                border: '2px dashed var(--border-color)',
                borderRadius: '12px',
                padding: '2.5rem 1.5rem',
                textAlign: 'center',
                cursor: 'pointer',
                position: 'relative',
                backgroundColor: 'var(--bg-primary)',
                transition: 'border-color var(--transition-fast), background-color var(--transition-fast)',
                height: '100%',
                minHeight: '220px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }} onDragOver={(e) => e.preventDefault()}>
                <input 
                  type="file" 
                  accept=".pdf"
                  style={{
                    position: 'absolute',
                    top: 0, left: 0, width: '100%', height: '100%',
                    opacity: 0, cursor: 'pointer'
                  }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setFile(e.target.files[0]);
                    }
                  }}
                />
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
                  <UploadCloud size={36} style={{ color: 'var(--text-muted)' }} />
                  {file ? (
                    <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: 600 }}>{file.name}</span>
                  ) : (
                    <>
                      <span style={{ fontSize: '0.95rem', fontWeight: 600 }}>Upload PDF Syllabus/Guide</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>File will be split into text chunks</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Ingest fields form */}
            <form onSubmit={handleUploadSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Document Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. Unit 3 Study Guide"
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '1.25rem'
              }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Document Type</label>
                  <select 
                    className="form-control" 
                    value={docType} 
                    onChange={(e) => setDocType(e.target.value)}
                  >
                    <option value="study_guide">Study Guide</option>
                    <option value="question_paper">Question Paper</option>
                    <option value="lecture_note">Lecture Note</option>
                    <option value="syllabus">Syllabus Sheet</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Subject Code</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="CS302"
                    value={courseCode} 
                    onChange={(e) => setCourseCode(e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Semester</label>
                  <select 
                    className="form-control" 
                    value={semester} 
                    onChange={(e) => setSemester(e.target.value)}
                  >
                    {[1,2,3,4,5,6,7,8].map((s) => (
                      <option key={s} value={s.toString()}>Sem {s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                <button 
                  type="submit" 
                  className="btn btn-primary" 
                  style={{ minWidth: '180px' }}
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <Sparkles size={16} className="animate-spin" />
                      <span>Extracting & Indexing...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={16} />
                      <span>Start Ingestion</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {successMessage && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              marginTop: '1.5rem',
              padding: '1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              borderRadius: '8px',
              color: 'var(--success)',
              fontSize: '0.85rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
                <CheckCircle size={16} />
                <span>{successMessage.includes('Link:') ? successMessage.split('Link:')[0].trim() : successMessage}</span>
              </div>
              {successMessage.includes('Link:') && (
                <a 
                  href={successMessage.split('Link: ')[1]} 
                  target="_blank" 
                  rel="noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--bg-primary)',
                    backgroundColor: 'var(--success)',
                    padding: '0.4rem 0.8rem',
                    borderRadius: '4px',
                    fontWeight: 600,
                    width: 'fit-content',
                    fontSize: '0.8rem',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                    textDecoration: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '0.9'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '1'}
                >
                  <Download size={14} />
                  <span>Download Published PDF</span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Uploaded Documents List */}
        <div className="card">
          <h3 style={{ marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Database size={20} className="brand-icon" />
            <span>Indexed Documents</span>
          </h3>

          {loading ? (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Course</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array(4).fill(0).map((_, idx) => (
                    <tr key={idx}>
                      <td><div className="skeleton" style={{ width: '180px', height: '18px' }} /></td>
                      <td><div className="skeleton" style={{ width: '80px', height: '22px', borderRadius: '999px' }} /></td>
                      <td><div className="skeleton" style={{ width: '60px', height: '16px' }} /></td>
                      <td><div className="skeleton" style={{ width: '80px', height: '16px' }} /></td>
                      <td><div className="skeleton" style={{ width: '50px', height: '24px', margin: '0 auto' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : documents.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No documents indexed yet.</p>
          ) : (
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Course</th>
                    <th>Date Added</th>
                    <th style={{ textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map((doc) => (
                    <tr key={doc.id}>
                      <td style={{ fontWeight: 500, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <FileText size={16} style={{ color: 'var(--accent-primary)' }} />
                          <span>{doc.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          doc.doc_type === 'question_paper' ? 'badge-error' : 
                          doc.doc_type === 'study_guide' ? 'badge-success' : 'badge-info'
                        }`}>
                          {doc.doc_type.replace('_', ' ')}
                        </span>
                      </td>
                      <td><code style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>{doc.course_code}</code></td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        {new Date(doc.created_at).toLocaleDateString()}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                          {doc.file_url && (
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noreferrer" 
                              title="Download PDF"
                              style={{
                                color: 'var(--success)',
                                padding: '6px',
                                borderRadius: '4px',
                                transition: 'all 0.2s',
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <Download size={16} />
                            </a>
                          )}
                          <button 
                            onClick={() => handleDelete(doc.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              color: 'var(--error)',
                              padding: '6px',
                              borderRadius: '4px',
                              transition: 'all 0.2s',
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                              e.currentTarget.style.transform = 'scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                              e.currentTarget.style.transform = 'scale(1)';
                            }}
                            title="Delete Document"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Publish Confirmation Modal */}
      {showPublishModal && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          backdropFilter: 'blur(4px)'
        }}>
          <div className="card" style={{
            maxWidth: '500px',
            width: '90%',
            padding: '2rem',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--accent-primary)' }}>
              <Sparkles size={24} />
              <span>Publish Document?</span>
            </h3>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5' }}>
              Upload and chunk parsing was successful! Do you want to publish this document to students? 
              This will generate an automated download link and allow students to download the full PDF from their mobile application.
            </p>

            <div style={{
              display: 'flex',
              gap: '1rem',
              justifyContent: 'flex-end',
              marginTop: '0.5rem'
            }}>
              <button 
                className="btn" 
                style={{
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border-color)',
                  color: 'var(--text-secondary)'
                }}
                onClick={() => {
                  setShowPublishModal(false);
                  setSuccessMessage('Document uploaded and saved as private.');
                }}
              >
                Keep Private
              </button>
              
              <button 
                className="btn btn-primary"
                disabled={publishing}
                onClick={async () => {
                  try {
                    setPublishing(true);
                    const apiUrl = import.meta.env.VITE_API_URL || 'https://srihari2479-college-rag-api.hf.space';
                    const res = await fetch(`${apiUrl}/api/rag/document/${pendingDocId}/publish`, {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ file_url: pendingFileUrl })
                    });
                    if (!res.ok) {
                      throw new Error('Publishing failed.');
                    }
                    setShowPublishModal(false);
                    setSuccessMessage(`Document published successfully! Link: ${pendingFileUrl}`);
                    await fetchDocuments();
                  } catch (err: any) {
                    alert(err.message || 'Failed to publish.');
                  } finally {
                    setPublishing(false);
                  }
                }}
              >
                {publishing ? 'Publishing...' : 'Proceed & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
