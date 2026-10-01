import React, { useState, useEffect, useRef } from 'react';
import {
  Calendar, Upload, Plus, Sparkles, MapPin,
  Trash2, Link, CheckCircle2, X, Loader2,
  Image as ImageIcon, AlertCircle, Clock,
  Laptop, Cpu, GraduationCap, Users, Building2,
  Briefcase, Globe, Layers, Search, Eye, Brain, RefreshCw
} from 'lucide-react';
import { supabase } from '../services/supabase';

/* ── Types ─────────────────────────────────────────────────────────────── */
interface EventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  venue: string;
  department_code: string;
  image_url?: string;
}
type ImageMode  = 'upload' | 'url';
type UploadStep = 'idle' | 'compressing' | 'analyzing' | 'done' | 'error';

/* ── Dept Theme Configuration (Colors, Icons, Gradients) ──────────────── */
interface DeptTheme {
  primary: string;
  secondary: string;
  bgLight: string;
  gradient: string;
  icon: React.ElementType;
  label: string;
}

const DEPT_THEMES: Record<string, DeptTheme> = {
  CSM: {
    primary: '#06b6d4',
    secondary: '#0891b2',
    bgLight: 'rgba(6, 182, 212, 0.08)',
    gradient: 'linear-gradient(135deg, #082f49 0%, #06b6d4 100%)',
    icon: Brain,
    label: 'CSM (AI & ML)'
  },
  CSE: {
    primary: '#0284c7',
    secondary: '#0369a1',
    bgLight: 'rgba(2, 132, 199, 0.08)',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #0284c7 100%)',
    icon: Laptop,
    label: 'Computer Science'
  },
  ECE: {
    primary: '#8b5cf6',
    secondary: '#6d28d9',
    bgLight: 'rgba(139, 92, 246, 0.08)',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #7c3aed 100%)',
    icon: Cpu,
    label: 'Electronics'
  },
  ME: {
    primary: '#059669',
    secondary: '#047857',
    bgLight: 'rgba(5, 150, 105, 0.08)',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    icon: Layers,
    label: 'Mechanical'
  },
  MECH: {
    primary: '#059669',
    secondary: '#047857',
    bgLight: 'rgba(5, 150, 105, 0.08)',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #059669 100%)',
    icon: Layers,
    label: 'Mechanical'
  },
  CIVIL: {
    primary: '#d97706',
    secondary: '#b45309',
    bgLight: 'rgba(217, 119, 6, 0.08)',
    gradient: 'linear-gradient(135deg, #451a03 0%, #d97706 100%)',
    icon: Building2,
    label: 'Civil Eng'
  },
  MBA: {
    primary: '#db2777',
    secondary: '#be185d',
    bgLight: 'rgba(219, 39, 119, 0.08)',
    gradient: 'linear-gradient(135deg, #831843 0%, #db2777 100%)',
    icon: Briefcase,
    label: 'Management'
  },
  CULT: {
    primary: '#f43f5e',
    secondary: '#e11d48',
    bgLight: 'rgba(244, 63, 94, 0.08)',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #f43f5e 100%)',
    icon: Sparkles,
    label: 'Cultural'
  },
  CULTURAL: {
    primary: '#f43f5e',
    secondary: '#e11d48',
    bgLight: 'rgba(244, 63, 94, 0.08)',
    gradient: 'linear-gradient(135deg, #4c0519 0%, #f43f5e 100%)',
    icon: Sparkles,
    label: 'Cultural'
  },
  SA: {
    primary: '#6366f1',
    secondary: '#4f46e5',
    bgLight: 'rgba(99, 102, 241, 0.08)',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 100%)',
    icon: GraduationCap,
    label: 'Student Affairs'
  },
  ENG: {
    primary: '#2563eb',
    secondary: '#1d4ed8',
    bgLight: 'rgba(37, 99, 235, 0.08)',
    gradient: 'linear-gradient(135deg, #172554 0%, #2563eb 100%)',
    icon: Users,
    label: 'Engineering'
  },
  DEFAULT: {
    primary: '#0f2744',
    secondary: '#002147',
    bgLight: 'rgba(0, 33, 71, 0.08)',
    gradient: 'linear-gradient(135deg, #071426 0%, #002147 100%)',
    icon: Globe,
    label: 'Campus Event'
  }
};

const getDeptTheme = (code: string): DeptTheme => {
  const key = code?.toUpperCase() ?? '';
  return DEPT_THEMES[key] ?? DEPT_THEMES.DEFAULT;
};

/* Formatters */
const formatDateObj = (isoStr: string) => {
  try {
    const d = new Date(isoStr);
    return {
      date: d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      isUpcoming: d.getTime() > Date.now()
    };
  } catch {
    return { date: isoStr, time: '', isUpcoming: true };
  }
};

export default function Events() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('ALL');

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [venue, setVenue] = useState('');
  const [dept, setDept] = useState('CSM');
  const [imageUrl, setImageUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [imageMode, setImageMode] = useState<ImageMode>('upload');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStep, setUploadStep] = useState<UploadStep>('idle');
  const [uploadMsg, setUploadMsg] = useState('');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchEvents(); }, []);

  // Keyboard shortcut for lightbox
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setLightbox(null); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  async function fetchEvents() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, description, event_date, venue, image_url, departments(code)')
        .order('event_date', { ascending: true });

      if (error || !data) {
        setEvents([
          { id: '1', title: 'National Level Hackathon 2026', description: '24-hour national student coding hackathon focused on AI/ML applications.', event_date: '2026-07-15T09:00:00Z', venue: 'CSE Seminar Hall', department_code: 'CSE' },
          { id: '2', title: 'Symposium on IoT Devices', description: 'Guest lectures and hands-on workshops with industry guides.', event_date: '2026-07-20T10:00:00Z', venue: 'ECE Lab-3', department_code: 'ECE' }
        ]);
      } else {
        setEvents(data.map((e: any) => ({
          id: e.id,
          title: e.title,
          description: e.description || '',
          event_date: e.event_date,
          venue: e.venue,
          image_url: e.image_url,
          department_code: e.departments?.code || 'GENERIC'
        })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  /* Compress Image */
  const compress = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const ratio = Math.min(900 / img.width, 600 / img.height, 1);
          const w = Math.round(img.width * ratio);
          const h = Math.round(img.height * ratio);
          const canvas = document.createElement('canvas');
          canvas.width = w;
          canvas.height = h;
          canvas.getContext('2d')!.drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL('image/jpeg', 0.78));
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const processFile = async (file: File) => {
    setUploadStep('compressing');
    try {
      const b64 = await compress(file);
      setImageUrl(b64);
      setUploadStep('analyzing');

      try {
        const fd = new FormData();
        fd.append('file', file);
        const api = import.meta.env.VITE_API_URL || 'https://srihari2479-college-rag-api.hf.space';
        const r = await fetch(`${api}/api/rag/analyze-poster`, { method: 'POST', body: fd });
        if (r.ok) {
          const d = await r.json();
          if (d.status === 'success') {
            if (d.title) setTitle(d.title);
            if (d.description) setDescription(d.description);
            if (d.date) setDate(d.time ? `${d.date}T${d.time}` : `${d.date}T10:00`);
            if (d.venue) setVenue(d.venue);
            if (d.department) setDept(d.department);
            setUploadMsg('ai');
          } else setUploadMsg('manual');
        } else setUploadMsg('manual');
      } catch {
        setUploadMsg('manual');
      }
      setUploadStep('done');
    } catch (e: any) {
      setUploadStep('error');
      setUploadMsg(e?.message || 'Compression failed');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting || submitDone) return;
    if (!title || !date || !venue) {
      alert('Please fill in all required fields.');
      return;
    }

    setSubmitting(true);
    try {
      let deptId: string | null = null;
      const { data: dd } = await supabase.from('departments').select('id').eq('code', dept.toUpperCase());
      if (dd?.length) {
        deptId = dd[0].id;
      } else {
        const { data: nd } = await supabase.from('departments').insert({ name: `${dept} Department`, code: dept.toUpperCase() }).select('id');
        if (nd?.length) deptId = nd[0].id;
      }
      const img = imageMode === 'url' ? manualUrl.trim() : imageUrl;
      const { error } = await supabase.from('events').insert({
        title,
        description,
        event_date: new Date(date).toISOString(),
        venue,
        department_id: deptId,
        image_url: img || null
      });

      if (error) throw error;
      setSubmitDone(true);
      setTimeout(() => {
        setTitle(''); setDescription(''); setDate(''); setVenue('');
        setImageUrl(''); setManualUrl(''); setUploadStep('idle');
        setUploadMsg(''); setSubmitDone(false);
        fetchEvents();
      }, 1600);
    } catch (e: any) {
      alert('Failed to publish event: ' + (e.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    await supabase.from('events').delete().eq('id', id);
    fetchEvents();
  };

  // Filter events
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.venue.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          e.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDept = selectedDeptFilter === 'ALL' || e.department_code?.toUpperCase() === selectedDeptFilter;
    return matchesSearch && matchesDept;
  });

  const processing = uploadStep === 'compressing' || uploadStep === 'analyzing';

  return (
    <>
      <style>{`
        @keyframes _spin { to { transform: rotate(360deg); } }
        @keyframes _pop { 0%{transform:scale(1)} 45%{transform:scale(1.04)} 100%{transform:scale(1)} }
        @keyframes _fade { from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:translateY(0)} }
        
        .ev-card-pro {
          background: #ffffff;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          height: 335px; /* Fixed height for 100% uniform grid alignment */
          transition: all 0.22s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 1px 3px rgba(0, 33, 71, 0.04);
        }
        .ev-card-pro:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 28px -6px rgba(0, 33, 71, 0.12), 0 4px 10px -2px rgba(0, 33, 71, 0.04);
          border-color: #cbd5e1;
        }
        .ev-card-pro .del-btn {
          opacity: 0;
          transition: opacity 0.18s ease;
        }
        .ev-card-pro:hover .del-btn {
          opacity: 1;
        }

        .poster-hero-bg {
          position: relative;
          height: 145px;
          width: 100%;
          overflow: hidden;
          background: #0f172a;
          cursor: pointer;
        }
        .poster-hero-bg img.bg-blur {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          filter: blur(14px) brightness(0.5);
          transform: scale(1.15);
        }
        .poster-hero-bg img.fg-poster {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
          transition: transform 0.25s ease;
        }
        .poster-hero-bg:hover img.fg-poster {
          transform: scale(1.03);
        }

        .filter-chip {
          padding: 5px 14px;
          border-radius: 20px;
          font-size: 0.76rem;
          font-weight: 600;
          border: 1px solid #e2e8f0;
          background: #ffffff;
          color: #64748b;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .filter-chip:hover {
          border-color: #002147;
          color: #002147;
        }
        .filter-chip.active {
          background: #002147;
          color: #ffffff;
          border-color: #002147;
          box-shadow: 0 2px 6px rgba(0, 33, 71, 0.2);
        }
      `}</style>

      {/* Lightbox Modal */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(3, 7, 18, 0.88)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: '_fade 0.2s ease', padding: '1rem'
          }}
        >
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: 'absolute', top: 18, right: 18,
              background: 'rgba(255, 255, 255, 0.15)', border: 'none',
              borderRadius: '50%', width: 38, height: 38,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#fff', transition: 'background 0.15s'
            }}
          >
            <X size={18} />
          </button>
          <img
            onClick={e => e.stopPropagation()}
            src={lightbox}
            alt="Event Poster Full View"
            style={{
              maxWidth: '92vw', maxHeight: '88vh',
              borderRadius: 12, objectFit: 'contain',
              boxShadow: '0 25px 60px rgba(0,0,0,0.7)'
            }}
          />
        </div>
      )}

      <div className="events-page" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Page Header */}
        <header className="page-header" style={{ marginBottom: '1.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <Calendar size={28} style={{ color: 'var(--accent-primary)' }} />
              <h1 style={{ margin: 0 }}>Event Management Portal</h1>
            </div>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              Create, organize, and publish campus workshops, hackathons, and cultural fests.
            </p>
          </div>
          <button
            className="btn btn-secondary"
            onClick={fetchEvents}
            style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </header>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* ════════════════════════ PUBLISH EVENT FORM ════════════════════════ */}
          <div className="card" style={{ padding: '1.25rem 1.5rem', border: '1px solid #e2e8f0', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0, 33, 71, 0.06)' }}>
                  <Sparkles size={16} color="#002147" />
                </div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                  Publish New Event
                </h3>
              </div>

              {/* Mode Switcher */}
              <div style={{ display: 'flex', background: '#f1f5f9', padding: '3px', borderRadius: '8px' }}>
                {(['upload', 'url'] as ImageMode[]).map(m => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setImageMode(m)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.76rem',
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      background: imageMode === m ? '#002147' : 'transparent',
                      color: imageMode === m ? '#ffffff' : '#64748b',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {m === 'upload' ? <ImageIcon size={12} /> : <Link size={12} />}
                    {m === 'upload' ? 'Upload Poster' : 'Poster URL'}
                  </button>
                ))}
              </div>
            </div>

            <div className="horizontal-parser-container">
              {/* Left Column: Poster Upload */}
              <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {imageMode === 'upload' ? (
                  <>
                    <div
                      onClick={() => !processing && fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={e => {
                        e.preventDefault();
                        setIsDragging(false);
                        const f = e.dataTransfer.files[0];
                        if (f?.type.startsWith('image/')) processFile(f);
                      }}
                      style={{
                        position: 'relative',
                        borderRadius: 12,
                        overflow: 'hidden',
                        border: `2px dashed ${isDragging ? '#002147' : uploadStep === 'done' ? '#10b981' : '#cbd5e1'}`,
                        background: isDragging ? 'rgba(0,33,71,0.04)' : uploadStep === 'done' ? 'rgba(16,185,129,0.02)' : '#f8fafc',
                        cursor: processing ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                        height: '185px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={e => { if (e.target.files?.[0]) processFile(e.target.files[0]); }}
                      />

                      {processing && (
                        <div style={{
                          position: 'absolute', inset: 0, zIndex: 10,
                          background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(4px)',
                          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.75rem'
                        }}>
                          <div style={{ position: 'relative', width: 44, height: 44 }}>
                            <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', border: '2.5px solid #002147', borderTopColor: 'transparent', animation: '_spin 0.85s linear infinite' }} />
                            <div style={{ position: 'absolute', inset: 7, borderRadius: '50%', border: '2px solid #38bdf8', borderTopColor: 'transparent', animation: '_spin 1.2s linear infinite reverse' }} />
                          </div>
                          <div style={{ textAlign: 'center' }}>
                            <p style={{ fontWeight: 700, fontSize: '0.82rem', color: '#0f172a', margin: '0 0 2px' }}>
                              {uploadStep === 'compressing' ? 'Optimizing Image…' : 'AI Vision Analyzing Poster…'}
                            </p>
                            <p style={{ fontSize: '0.72rem', color: '#64748b', margin: 0 }}>
                              {uploadStep === 'compressing' ? 'Converting format for database' : 'Auto-extracting event date, title & venue'}
                            </p>
                          </div>
                        </div>
                      )}

                      {uploadStep === 'done' && imageUrl ? (
                        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                          <img src={imageUrl} alt="Uploaded Poster" style={{ width: '100%', height: '185px', objectFit: 'cover' }} />
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)',
                            display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: '0.6rem'
                          }}>
                            <span style={{ fontSize: '0.7rem', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '3px 10px', borderRadius: 20, fontWeight: 600 }}>
                              Click to replace image
                            </span>
                          </div>
                          <div style={{ position: 'absolute', top: 8, right: 8, background: '#10b981', borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 6px rgba(16,185,129,0.3)' }}>
                            <CheckCircle2 size={14} color="#fff" />
                          </div>
                        </div>
                      ) : (uploadStep === 'idle' || uploadStep === 'error') && (
                        <div style={{ textAlign: 'center', padding: '1rem', pointerEvents: 'none' }}>
                          <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(0,33,71,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.5rem' }}>
                            <Upload size={18} color="#002147" />
                          </div>
                          <p style={{ fontWeight: 700, fontSize: '0.84rem', color: '#0f172a', margin: '0 0 2px' }}>
                            {isDragging ? 'Drop poster image' : 'Drag & Drop Event Poster'}
                          </p>
                          <p style={{ fontSize: '0.72rem', color: '#94a3b8', margin: 0 }}>
                            AI Vision scans & auto-fills details automatically
                          </p>
                          {uploadStep === 'error' && (
                            <p style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center', color: '#ef4444', fontSize: '0.72rem', marginTop: '0.4rem' }}>
                              <AlertCircle size={12} />{uploadMsg || 'Failed to process image'}
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {uploadStep === 'done' && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.35rem 0.65rem', borderRadius: 6,
                        background: uploadMsg === 'ai' ? 'rgba(16,185,129,0.08)' : 'rgba(0,33,71,0.05)',
                        border: `1px solid ${uploadMsg === 'ai' ? 'rgba(16,185,129,0.25)' : 'rgba(0,33,71,0.1)'}`
                      }}>
                        {uploadMsg === 'ai' ? (
                          <>
                            <Sparkles size={12} color="#10b981" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>AI Vision populated form details below</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} color="#475569" style={{ flexShrink: 0 }} />
                            <span style={{ fontSize: '0.75rem', color: '#475569' }}>Poster ready. Please complete the form</span>
                          </>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label">Image URL</label>
                      <input
                        type="url"
                        className="form-control"
                        placeholder="https://example.com/poster.jpg"
                        value={manualUrl}
                        onChange={e => setManualUrl(e.target.value)}
                      />
                    </div>
                    {manualUrl && (
                      <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid #e2e8f0', height: 130, background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={manualUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'contain' }} onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Form Fields */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', minWidth: 0 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Event Title *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={title}
                      onChange={e => setTitle(e.target.value)}
                      required
                      placeholder="e.g. Annual Tech Fest 2026"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Venue *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={venue}
                      onChange={e => setVenue(e.target.value)}
                      required
                      placeholder="e.g. Main Auditorium"
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Date & Time *</label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ margin: 0 }}>
                    <label className="form-label">Department *</label>
                    <select className="form-control" value={dept} onChange={e => setDept(e.target.value)}>
                      <option value="CSM">CSM (AI & ML)</option>
                      <option value="CSE">CSE</option>
                      <option value="ECE">ECE</option>
                      <option value="ME">Mech Eng</option>
                      <option value="CIVIL">Civil Eng</option>
                      <option value="MBA">MBA</option>
                      <option value="CULT">Cultural</option>
                      <option value="SA">Student Affairs</option>
                      <option value="GENERIC">All Departments</option>
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Provide a summary of topics, chief guests, or eligibility criteria…"
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.2rem' }}>
                  <button
                    type="submit"
                    disabled={submitting || submitDone}
                    className="btn btn-primary"
                    style={{
                      minWidth: 180,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      background: submitDone ? '#10b981' : '#002147',
                      opacity: submitting && !submitDone ? 0.8 : 1,
                      cursor: submitting || submitDone ? 'not-allowed' : 'pointer',
                      transition: 'background 0.3s ease',
                      animation: submitDone ? '_pop 0.4s ease' : undefined
                    }}
                  >
                    {submitDone ? (
                      <><CheckCircle2 size={14} /><span>Published Successfully!</span></>
                    ) : submitting ? (
                      <><Loader2 size={14} style={{ animation: '_spin 0.8s linear infinite' }} /><span>Publishing…</span></>
                    ) : (
                      <><Plus size={14} /><span>Confirm & Publish</span></>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* ════════════════════════ EVENTS SECTION & FILTERS ════════════════════════ */}
          <div>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              marginBottom: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <div style={{ padding: '6px', borderRadius: '8px', background: 'rgba(0, 33, 71, 0.06)' }}>
                  <Calendar size={16} color="#002147" />
                </div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Scheduled Campus Events
                </h3>
                {!loading && (
                  <span style={{
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: '#002147',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: 999
                  }}>
                    {filteredEvents.length}
                  </span>
                )}
              </div>

              {/* Search Bar & Department Filter Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <div style={{ position: 'relative', width: '220px' }}>
                  <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                  <input
                    type="text"
                    placeholder="Search events or venue…"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '5px 10px 5px 30px',
                      fontSize: '0.78rem',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      background: '#ffffff',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
                  {['ALL', 'CSM', 'CSE', 'ECE', 'ME', 'CIVIL', 'MBA', 'CULT', 'SA'].map(code => (
                    <button
                      key={code}
                      className={`filter-chip ${selectedDeptFilter === code ? 'active' : ''}`}
                      onClick={() => setSelectedDeptFilter(code)}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Events Grid */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', alignItems: 'start' }}>
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="skeleton skeleton-box" style={{ height: 260, borderRadius: 14 }} />
                ))}
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1rem', color: '#94a3b8', borderRadius: 16 }}>
                <Calendar size={36} style={{ margin: '0 auto 0.75rem', opacity: 0.25 }} />
                <p style={{ fontSize: '0.9rem', fontWeight: 600, color: '#475569', margin: 0 }}>No matching events found</p>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '4px' }}>Try adjusting your search query or department filter.</p>
              </div>
            ) : (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                gap: '1.1rem',
                alignItems: 'start' /* Crucial: stops row stretching */
              }}>
                {filteredEvents.map(evt => {
                  const theme = getDeptTheme(evt.department_code);
                  const DeptIcon = theme.icon;
                  const { date: evDate, time: evTime, isUpcoming } = formatDateObj(evt.event_date);
                  const hasImg = !!evt.image_url;

                  return (
                    <div key={evt.id} className="ev-card-pro">
                      {/* Top Header: Dual-Layer Poster Image OR Styled Vector Hero */}
                      {hasImg ? (
                        <div
                          className="poster-hero-bg"
                          onClick={() => setLightbox(evt.image_url!)}
                          title="Click to view full poster"
                        >
                          {/* Blurred background image for ultra-smooth fit */}
                          <img src={evt.image_url} alt="" className="bg-blur" />
                          {/* Main centered poster (no text cutoff) */}
                          <img src={evt.image_url} alt={evt.title} className="fg-poster" />

                          {/* Top Badges */}
                          <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 3 }}>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              background: 'rgba(15, 23, 42, 0.75)',
                              backdropFilter: 'blur(6px)',
                              padding: '3px 9px',
                              borderRadius: 20,
                              border: '1px solid rgba(255, 255, 255, 0.2)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <DeptIcon size={10} />
                              {evt.department_code?.toUpperCase()}
                            </span>
                          </div>

                          <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 3, display: 'flex', gap: '6px' }}>
                            <button
                              className="del-btn"
                              onClick={(e) => { e.stopPropagation(); handleDelete(evt.id); }}
                              title="Delete Event"
                              style={{
                                background: 'rgba(239, 68, 68, 0.85)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 26,
                                height: 26,
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backdropFilter: 'blur(4px)'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>

                            <div style={{
                              background: 'rgba(15, 23, 42, 0.65)',
                              borderRadius: '50%',
                              width: 26,
                              height: 26,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#fff',
                              backdropFilter: 'blur(4px)'
                            }}>
                              <Eye size={12} />
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Styled Dynamic Graphic Hero when no image exists */
                        <div style={{
                          height: '145px',
                          background: theme.gradient,
                          position: 'relative',
                          padding: '12px 14px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between',
                          overflow: 'hidden'
                        }}>
                          {/* Decorative Background Icon Pattern */}
                          <DeptIcon
                            size={110}
                            style={{
                              position: 'absolute',
                              right: '-20px',
                              bottom: '-25px',
                              color: 'rgba(255, 255, 255, 0.1)',
                              transform: 'rotate(-12deg)'
                            }}
                          />

                          {/* Top Row: Dept Pill + Delete Button */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', zIndex: 2 }}>
                            <span style={{
                              fontSize: '0.66rem',
                              fontWeight: 700,
                              color: '#ffffff',
                              background: 'rgba(255, 255, 255, 0.18)',
                              backdropFilter: 'blur(6px)',
                              padding: '3px 9px',
                              borderRadius: 20,
                              border: '1px solid rgba(255, 255, 255, 0.25)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}>
                              <DeptIcon size={10} />
                              {evt.department_code?.toUpperCase()}
                            </span>

                            <button
                              className="del-btn"
                              onClick={() => handleDelete(evt.id)}
                              title="Delete Event"
                              style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                borderRadius: '50%',
                                width: 26,
                                height: 26,
                                cursor: 'pointer',
                                color: '#fff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>

                          {/* Category Subtext */}
                          <div style={{ zIndex: 2 }}>
                            <span style={{ fontSize: '0.68rem', fontWeight: 600, color: 'rgba(255, 255, 255, 0.75)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                              {theme.label}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Card Content Area */}
                      <div style={{ padding: '0.85rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.63rem',
                            fontWeight: 700,
                            color: isUpcoming ? '#059669' : '#64748b',
                            background: isUpcoming ? 'rgba(16, 185, 129, 0.1)' : '#f1f5f9',
                            padding: '2px 7px',
                            borderRadius: '4px'
                          }}>
                            {isUpcoming ? 'UPCOMING' : 'PAST'}
                          </span>
                        </div>

                        <h4 style={{
                          fontSize: '0.92rem',
                          fontWeight: 700,
                          color: '#0f172a',
                          lineHeight: 1.3,
                          margin: 0,
                          minHeight: '2.6em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {evt.title}
                        </h4>

                        <p style={{
                          fontSize: '0.76rem',
                          color: '#64748b',
                          margin: 0,
                          lineHeight: 1.4,
                          minHeight: '2.8em',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}>
                          {evt.description || 'No additional event details provided.'}
                        </p>

                        <div style={{
                          marginTop: 'auto',
                          paddingTop: '0.55rem',
                          borderTop: '1px solid #f1f5f9',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.35rem'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: '#475569' }}>
                            <Calendar size={12} color={theme.primary} style={{ flexShrink: 0 }} />
                            <span style={{ fontWeight: 600 }}>{evDate}</span>
                            <span style={{ color: '#cbd5e1' }}>•</span>
                            <Clock size={12} color="#94a3b8" style={{ flexShrink: 0 }} />
                            <span>{evTime}</span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: '#64748b' }}>
                            <MapPin size={12} color={theme.primary} style={{ flexShrink: 0 }} />
                            <span style={{
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis'
                            }}>
                              {evt.venue}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
