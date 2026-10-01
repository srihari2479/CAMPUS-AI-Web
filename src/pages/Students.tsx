import { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle2, XCircle, Search, RefreshCw, AlertCircle, Users, ShieldAlert } from 'lucide-react';

interface Student {
  email: string;
  roll_number: string;
  full_name: string;
  department: string;
  status: 'pending' | 'approved' | 'rejected' | string;
  created_at: string;
}

const API_BASE_URLS = [
  'http://127.0.0.1:8000',
  'http://localhost:8000',
  'https://srihari2479-college-rag-api.hf.space'
];

export default function Students() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingEmail, setUpdatingEmail] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStudents = async () => {
    setLoading(true);
    let fetched = false;

    for (const baseUrl of API_BASE_URLS) {
      try {
        const res = await fetch(`${baseUrl}/api/rag/admin/students`);
        if (res.ok) {
          const data = await res.json();
          setStudents(data);
          fetched = true;
          break;
        }
      } catch (_) {
        // Try next fallback
      }
    }

    if (!fetched) {
      // Demo fallback data if server is initializing
      setStudents([
        {
          email: '23u41a4215@diet.edu.in',
          roll_number: '23U41A4215',
          full_name: 'choppa srihari',
          department: 'CSM (AI & ML)',
          status: 'pending',
          created_at: new Date().toISOString()
        },
        {
          email: '23u41a4216@diet.edu.in',
          roll_number: '23U41A4216',
          full_name: 'Chopra Srihari',
          department: 'CSM (AI & ML)',
          status: 'approved',
          created_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          email: '23u41a4299@diet.edu.in',
          roll_number: '23U41A4299',
          full_name: 'Srihari CSM',
          department: 'CSM (AI & ML)',
          status: 'approved',
          created_at: new Date(Date.now() - 172800000).toISOString()
        }
      ]);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleStatusChange = async (email: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    setUpdatingEmail(email);

    // Optimistic UI update
    setStudents(prev =>
      prev.map(s => (s.email.toLowerCase() === email.toLowerCase() ? { ...s, status: newStatus } : s))
    );

    let success = false;
    for (const baseUrl of API_BASE_URLS) {
      try {
        const res = await fetch(`${baseUrl}/api/rag/admin/students/${encodeURIComponent(email)}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        });
        if (res.ok) {
          success = true;
          break;
        }
      } catch (_) {
        // Try next
      }
    }

    if (success) {
      setToastMessage({
        type: 'success',
        text: `Student ${email.split('@')[0].toUpperCase()} status updated to ${newStatus.toUpperCase()}`
      });
    } else {
      setToastMessage({
        type: 'error',
        text: `Failed to update status on server. Please check backend connection.`
      });
    }

    setUpdatingEmail(null);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filter students by tab and search query
  const filteredStudents = students.filter(s => {
    const matchesTab = activeTab === 'all' ? true : (s.status || 'pending').toLowerCase() === activeTab;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (s.roll_number || '').toLowerCase().includes(query) ||
      (s.full_name || '').toLowerCase().includes(query) ||
      (s.email || '').toLowerCase().includes(query) ||
      (s.department || '').toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  // Summary counts
  const totalCount = students.length;
  const pendingCount = students.filter(s => (s.status || 'pending').toLowerCase() === 'pending').length;
  const approvedCount = students.filter(s => (s.status || 'pending').toLowerCase() === 'approved').length;
  const rejectedCount = students.filter(s => (s.status || 'pending').toLowerCase() === 'rejected').length;

  return (
    <div className="students-page">
      {/* Global Standard Header */}
      <header className="page-header" style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserCheck size={28} style={{ color: 'var(--accent-primary)' }} />
            <h1 style={{ margin: 0 }}>Student Approvals & Directory</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
            Review <code style={{ background: 'rgba(0, 33, 71, 0.06)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '6px', fontWeight: 600, fontSize: '0.85rem' }}>@diet.edu.in</code> student registrations, approve portal access, and manage department permissions.
          </p>
        </div>

        <button
          className="btn btn-secondary"
          onClick={fetchStudents}
          style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh</span>
        </button>
      </header>

      {/* Global Error/Toast Notification Banner */}
      {toastMessage && (
        <div
          style={{
            marginBottom: '1.5rem',
            padding: '0.9rem 1.25rem',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            background: toastMessage.type === 'success' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(239, 68, 68, 0.08)',
            border: `1px solid ${toastMessage.type === 'success' ? '#10b981' : '#ef4444'}`,
            color: toastMessage.type === 'success' ? '#047857' : '#b91c1c',
            fontWeight: 600,
            fontSize: '0.92rem'
          }}
        >
          {toastMessage.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Global Stat Cards Grid (Light theme matching Dashboard) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}
      >
        {/* Total Registered */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(0, 33, 71, 0.04) 0%, rgba(255, 255, 255, 0.95) 100%)',
            borderLeft: '4px solid #002147'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#e0f2fe', color: '#002147' }}>
            <Users size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#002147', fontWeight: 700, whiteSpace: 'nowrap' }}>Total Registered</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-primary)' }}>
              {loading ? <div className="skeleton" style={{ width: '50px', height: '32px' }} /> : totalCount}
            </div>
          </div>
        </div>

        {/* Pending Approval */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
            borderLeft: '4px solid #f59e0b'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#fef3c7', color: '#d97706' }}>
            <Clock size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#d97706', fontWeight: 700, whiteSpace: 'nowrap' }}>Pending Approval</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#f59e0b' }}>
              {loading ? <div className="skeleton" style={{ width: '50px', height: '32px' }} /> : pendingCount}
            </div>
          </div>
        </div>

        {/* Active Approved */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
            borderLeft: '4px solid #10b981'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#16a34a' }}>
            <CheckCircle2 size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 700, whiteSpace: 'nowrap' }}>Active Approved</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#10b981' }}>
              {loading ? <div className="skeleton" style={{ width: '50px', height: '32px' }} /> : approvedCount}
            </div>
          </div>
        </div>

        {/* Declined / Restricted */}
        <div
          className="card"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            padding: '1.5rem',
            background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(255, 255, 255, 0.95) 100%)',
            borderLeft: '4px solid #ef4444'
          }}
        >
          <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: '#fee2e2', color: '#dc2626' }}>
            <ShieldAlert size={28} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.85rem', color: '#dc2626', fontWeight: 700, whiteSpace: 'nowrap' }}>Declined / Restricted</div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.25rem', color: '#ef4444' }}>
              {loading ? <div className="skeleton" style={{ width: '50px', height: '32px' }} /> : rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar: Filter Tabs & Search Bar */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '1rem',
          marginBottom: '1.5rem'
        }}
      >
        {/* Filter Buttons */}
        <div
          style={{
            display: 'flex',
            background: '#ffffff',
            padding: '4px',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          {(['pending', 'approved', 'rejected', 'all'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '9px',
                border: 'none',
                background: activeTab === tab ? 'var(--accent-primary)' : 'transparent',
                color: activeTab === tab ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: activeTab === tab ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textTransform: 'capitalize'
              }}
            >
              {tab === 'pending' ? `Pending (${pendingCount})` : tab}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative', width: '360px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
          <input
            type="text"
            className="form-control"
            placeholder="Search by Roll No, Name, or Email..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              paddingLeft: '2.5rem',
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              fontSize: '0.86rem',
              boxShadow: 'var(--shadow-sm)'
            }}
          />
        </div>
      </div>

      {/* Global Custom Table Container */}
      <div className="table-container">
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            <div className="skeleton skeleton-box" style={{ width: '40px', height: '40px', borderRadius: '50%', margin: '0 auto 1rem' }} />
            Loading student accounts...
          </div>
        ) : filteredStudents.length === 0 ? (
          <div style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: '#ffffff' }}>
            <UserCheck size={44} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)', margin: 0 }}>No student records found</h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
              {searchQuery
                ? `No matches for "${searchQuery}" under ${activeTab} filter.`
                : `No student accounts currently under ${activeTab} status.`}
            </p>
          </div>
        ) : (
          <table className="custom-table">
            <thead>
              <tr>
                <th style={{ whiteSpace: 'nowrap' }}>STUDENT ROLL NO</th>
                <th style={{ whiteSpace: 'nowrap' }}>FULL NAME</th>
                <th style={{ whiteSpace: 'nowrap' }}>EMAIL ADDRESS</th>
                <th style={{ whiteSpace: 'nowrap' }}>DEPARTMENT</th>
                <th style={{ whiteSpace: 'nowrap' }}>STATUS</th>
                <th style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => {
                const status = (student.status || 'pending').toLowerCase();
                const isUpdating = updatingEmail === student.email;

                return (
                  <tr key={student.email}>
                    {/* Roll Number */}
                    <td style={{ fontWeight: 700, color: '#0384c7', whiteSpace: 'nowrap' }}>
                      {student.roll_number || student.email.split('@')[0].toUpperCase()}
                    </td>

                    {/* Full Name */}
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                      {student.full_name || 'Student'}
                    </td>

                    {/* Email */}
                    <td style={{ color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{student.email}</td>

                    {/* Department Badge */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <span className="badge badge-info">
                        {student.department || 'CSM (AI & ML)'}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {status === 'approved' && (
                        <span className="badge badge-success" style={{ gap: '0.35rem' }}>
                          <CheckCircle2 size={13} /> Approved
                        </span>
                      )}
                      {status === 'pending' && (
                        <span className="badge badge-warning" style={{ gap: '0.35rem' }}>
                          <Clock size={13} /> Pending Review
                        </span>
                      )}
                      {status === 'rejected' && (
                        <span className="badge badge-error" style={{ gap: '0.35rem' }}>
                          <XCircle size={13} /> Rejected
                        </span>
                      )}
                    </td>

                    {/* Action Buttons */}
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '0.5rem', alignItems: 'center', justifyContent: 'flex-end' }}>
                        {status !== 'approved' && (
                          <button
                            onClick={() => handleStatusChange(student.email, 'approved')}
                            disabled={isUpdating}
                            style={{
                              padding: '0.4rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid #10b981',
                              background: '#ecfdf5',
                              color: '#047857',
                              fontWeight: 700,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <CheckCircle2 size={14} /> Approve Access
                          </button>
                        )}

                        {status !== 'rejected' && (
                          <button
                            onClick={() => handleStatusChange(student.email, 'rejected')}
                            disabled={isUpdating}
                            style={{
                              padding: '0.4rem 0.85rem',
                              borderRadius: '8px',
                              border: '1px solid #fca5a5',
                              background: '#fef2f2',
                              color: '#dc2626',
                              fontWeight: 600,
                              fontSize: '0.82rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.35rem',
                              transition: 'all 0.2s'
                            }}
                          >
                            <XCircle size={14} /> Reject
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
