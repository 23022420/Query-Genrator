import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}><Zap size={24} color="#fff" /></div>
          <h1 style={styles.title}>QueryNova</h1>
          <p style={styles.subtitle}>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input
                type="email" required className="input" style={{ paddingLeft: 38 }}
                placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input
                type={showPass ? 'text' : 'password'} required className="input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                placeholder="Your password" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }} disabled={loading}>
            {loading ? <div className="spinner" /> : <><span>Sign in</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={styles.footer}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--accent)' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'var(--bg-primary)', padding: 20, position: 'relative', overflow: 'hidden'
  },
  bg: {
    position: 'absolute', inset: 0,
    background: 'radial-gradient(ellipse at 50% 0%, rgba(108, 99, 255, 0.15) 0%, transparent 60%)',
    pointerEvents: 'none'
  },
  card: {
    width: '100%', maxWidth: 400, background: 'var(--bg-card)',
    border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)',
    padding: 40, position: 'relative', zIndex: 1
  },
  header: { textAlign: 'center', marginBottom: 32 },
  logoIcon: {
    width: 56, height: 56, background: 'linear-gradient(135deg, #6c63ff, #4da6ff)',
    borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 16px'
  },
  title: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  subtitle: { color: 'var(--text-muted)', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' },
  eyeBtn: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4
  },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }
};
