import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowRight, UserPlus, Database, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';

interface AuthProps {
  defaultMode: 'login' | 'signup';
}

export default function Auth({ defaultMode }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(defaultMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  React.useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  React.useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email || !password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!email.toLowerCase().endsWith('@diet.edu.in')) {
      setError('Access restricted. Only official @diet.edu.in email addresses are accepted.');
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);

      if (mode === 'login') {
        const { error: signInErr } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (signInErr) throw signInErr;
        navigate('/');
      } else {
        const { error: signUpErr } = await supabase.auth.signUp({
          email,
          password
        });
        if (signUpErr) throw signUpErr;
        setMessage('Registration successful! Please check your email for confirmation.');
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
      backgroundColor: '#f8fafc'
    }}>
      {/* Floating Toast Notification Popups at Top Middle with Spring slide-down animation */}
      {message && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '12px',
          color: '#065f46',
          padding: '0.85rem 1.25rem',
          paddingBottom: '1rem',
          boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          zIndex: 1000,
          animation: 'slideDownToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          maxWidth: '90vw',
          width: 'max-content',
          overflow: 'hidden'
        }}>
          <CheckCircle2 size={18} style={{ color: '#10b981' }} />
          <span>{message}</span>
          <button 
            onClick={() => setMessage('')} 
            style={{
              background: 'none',
              border: 'none',
              color: '#065f46',
              cursor: 'pointer',
              marginLeft: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              zIndex: 10
            }}
          >
            &times;
          </button>
          {/* Progress bar timer line */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: '100%',
            backgroundColor: '#10b981',
            animation: 'toastProgress 5s linear forwards'
          }} />
        </div>
      )}

      {error && (
        <div style={{
          position: 'fixed',
          top: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#fef2f2',
          border: '1px solid #ef4444',
          borderRadius: '12px',
          color: '#991b1b',
          padding: '0.85rem 1.25rem',
          paddingBottom: '1rem',
          boxShadow: '0 10px 25px -5px rgba(239, 68, 68, 0.15)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          fontWeight: 600,
          fontSize: '0.9rem',
          zIndex: 1000,
          animation: 'slideDownToast 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards',
          maxWidth: '90vw',
          width: 'max-content',
          overflow: 'hidden'
        }}>
          <AlertCircle size={18} style={{ color: '#ef4444' }} />
          <span>{error}</span>
          <button 
            onClick={() => setError('')} 
            style={{
              background: 'none',
              border: 'none',
              color: '#991b1b',
              cursor: 'pointer',
              marginLeft: '0.75rem',
              fontWeight: 'bold',
              fontSize: '1.1rem',
              display: 'flex',
              alignItems: 'center',
              padding: '2px',
              zIndex: 10
            }}
          >
            &times;
          </button>
          {/* Progress bar timer line */}
          <div style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '3px',
            width: '100%',
            backgroundColor: '#ef4444',
            animation: 'toastProgress 5s linear forwards'
          }} />
        </div>
      )}
      {/* LEFT PANEL: Branding & Visuals (Hides on Mobile via css/inline) */}
      <div className="auth-left-panel" style={{
        flex: 1.3,
        background: 'linear-gradient(135deg, #002147 0%, #00132a 100%)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '3.5rem',
        color: '#ffffff',
        overflow: 'hidden'
      }}>
        {/* Ambient background glows */}
        <div style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
          top: '-10%',
          left: '-10%',
          pointerEvents: 'none'
        }} />
        <div style={{
          position: 'absolute',
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(56, 189, 248, 0.08) 0%, transparent 70%)',
          bottom: '10%',
          right: '-10%',
          pointerEvents: 'none'
        }} />

        {/* Background Decorative Chessboard Grid with Blue-Tinted DIET Logos */}
        <div style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          pointerEvents: 'none',
          backgroundImage: `
            linear-gradient(45deg, rgba(56, 189, 248, 0.05) 25%, transparent 25%), 
            linear-gradient(-45deg, rgba(56, 189, 248, 0.05) 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, rgba(56, 189, 248, 0.05) 75%), 
            linear-gradient(-45deg, transparent 75%, rgba(56, 189, 248, 0.05) 75%),
            url('/logo.png')
          `,
          backgroundSize: '320px 320px, 320px 320px, 320px 320px, 320px 320px, 120px 120px',
          backgroundPosition: '0 0, 0 160px, 160px -160px, -160px 0, 160px 160px',
          backgroundRepeat: 'repeat',
          filter: 'sepia(1) hue-rotate(185deg) saturate(1200%) brightness(1.1) contrast(1.1)',
          opacity: 0.1, /* Clear but non-distracting visual watermark */
          zIndex: 1
        }} />

        {/* Header Branding */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', zIndex: 10 }}>
          <div style={{
            height: '40px',
            width: '40px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            padding: '4px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(56, 189, 248, 0.2)'
          }}>
            <img src="/logo.png" alt="DIET Logo" style={{ height: '100%', width: '100%', objectFit: 'contain', borderRadius: '50%' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem', letterSpacing: '0.05em', fontFamily: 'var(--font-heading)' }}>DIET</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase' }}>Console Admin</span>
          </div>
        </div>

        {/* Middle Feature Highlights */}
        <div style={{ maxWidth: '480px', zIndex: 10, margin: 'auto 0' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '3rem',
            fontWeight: 800,
            lineHeight: 1.15,
            color: '#ffffff',
            marginBottom: '1.5rem'
          }}>
            Manage your campus <span style={{ color: '#38bdf8' }}>intelligently</span>.
          </h1>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
            Secure access to the university's academic document parser, vector databases, and AI poster extraction gateway.
          </p>

          {/* Interactive Status Indicator Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ color: '#38bdf8', padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(56, 189, 248, 0.1)' }}>
                <Database size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Vector Ingestion Active</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Synchronized with Supabase pgvector</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(8px)'
            }}>
              <div style={{ color: '#10b981', padding: '0.5rem', borderRadius: '8px', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
                <CheckCircle2 size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>API Gateways Online</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Connected to Groq, Gemini & RAG engine</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ fontSize: '0.8rem', opacity: 0.4, zIndex: 10 }}>
          &copy; 2026 Dadi Institute of Engineering & Technology. All rights reserved.
        </div>
      </div>

      {/* RIGHT PANEL: Focused Authentication Form */}
      <div style={{
        flex: 0.9,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem 3.5rem',
        backgroundColor: '#ffffff',
        zIndex: 10
      }}>
        <div style={{ maxWidth: '380px', width: '100%', margin: '0 auto' }}>
          {/* Header */}
          <div style={{ marginBottom: '2.5rem' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: '2rem',
              fontWeight: 800,
              color: '#002147',
              marginBottom: '0.5rem'
            }}>
              {mode === 'login' ? 'Welcome back' : 'Create Admin'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {mode === 'login' ? 'Sign in with your @diet.edu.in account' : 'Register a new administrative console user'}
            </p>
          </div>



          {/* Form */}
          <form onSubmit={handleAuthSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  <Mail size={16} />
                </span>
                <input 
                  type="email" 
                  className="form-control" 
                  placeholder="name@diet.edu.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-primary)' }}
                />
              </div>
            </div>

            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Password</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                  <Lock size={16} />
                </span>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  className="form-control" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-primary)' }}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex'
                  }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'signup' && (
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label" style={{ fontWeight: 600 }}>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex' }}>
                    <Lock size={16} />
                  </span>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    className="form-control" 
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingLeft: '2.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="btn" 
              disabled={loading}
              style={{
                width: '100%',
                backgroundColor: '#002147',
                color: '#ffffff',
                fontWeight: 700,
                padding: '0.85rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                marginTop: '0.5rem',
                boxShadow: '0 4px 12px rgba(0, 33, 71, 0.15)',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#00132a';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#002147';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {loading ? (
                <span>Processing...</span>
              ) : mode === 'login' ? (
                <>
                  <span>Sign In</span>
                  <ArrowRight size={16} />
                </>
              ) : (
                <>
                  <span>Register Account</span>
                  <UserPlus size={16} />
                </>
              )}
            </button>
          </form>

          {/* Toggle */}
          <div style={{
            marginTop: '2rem',
            borderTop: '1px solid #e2e8f0',
            paddingTop: '1.25rem',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: 'var(--text-secondary)'
          }}>
            {mode === 'login' ? (
              <span>
                Don't have an account?{' '}
                <button 
                  onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#002147', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Register
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button 
                  onClick={() => { setMode('login'); setError(''); setMessage(''); }}
                  style={{ background: 'none', border: 'none', color: '#002147', fontWeight: 700, cursor: 'pointer', padding: 0 }}
                >
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
