import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Zap, Mail, Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(form.password)) {
      toast.error('Password must have uppercase, lowercase and number'); return;
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const strength = !form.password ? 0 :
    (form.password.length >= 8 ? 1 : 0) +
    (/[A-Z]/.test(form.password) ? 1 : 0) +
    (/[0-9]/.test(form.password) ? 1 : 0) +
    (/[^A-Za-z0-9]/.test(form.password) ? 1 : 0);

  const strengthColors = ['', '#ff4d6d', '#ffd166', '#00d4a0', '#6c63ff'];
  const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div style={styles.page}>
      <div style={styles.bg} />
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logoIcon}><Zap size={24} color="#fff" /></div>
          <h1 style={styles.title}>Create Account</h1>
          <p style={styles.subtitle}>Start querying smarter with AI</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Full Name</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.inputIcon} />
              <input type="text" required className="input" style={{ paddingLeft: 38 }}
                placeholder="John Doe" value={form.name}
                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <div style={styles.inputWrap}>
              <Mail size={16} style={styles.inputIcon} />
              <input type="email" required className="input" style={{ paddingLeft: 38 }}
                placeholder="you@example.com" value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
          </div>

          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <div style={styles.inputWrap}>
              <Lock size={16} style={styles.inputIcon} />
              <input type={showPass ? 'text' : 'password'} required className="input"
                style={{ paddingLeft: 38, paddingRight: 38 }}
                placeholder="Min. 8 characters" value={form.password}
                onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              <button type="button" onClick={() => setShowPass(!showPass)} style={styles.eyeBtn}>
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
                  {[1,2,3,4].map(i => (
                    <div key={i} style={{
                      flex: 1, height: 3, borderRadius: 2,
                      background: i <= strength ? strengthColors[strength] : 'var(--border)'
                    }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: strengthColors[strength] }}>{strengthLabels[strength]}</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', height: 44 }} disabled={loading}>
            {loading ? <div className="spinner" /> : <><span>Create Account</span><ArrowRight size={16} /></>}
          </button>
        </form>

        <p style={styles.footer}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: 20, position: 'relative', overflow: 'hidden' },
  bg: { position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 0%, rgba(108, 99, 255, 0.15) 0%, transparent 60%)', pointerEvents: 'none' },
  card: { width: '100%', maxWidth: 420, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 40, position: 'relative', zIndex: 1 },
  header: { textAlign: 'center', marginBottom: 32 },
  logoIcon: { width: 56, height: 56, background: 'linear-gradient(135deg, #6c63ff, #4da6ff)', borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' },
  title: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 },
  subtitle: { color: 'var(--text-muted)', fontSize: 14 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  inputWrap: { position: 'relative' },
  inputIcon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' },
  eyeBtn: { position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 },
  footer: { textAlign: 'center', marginTop: 24, fontSize: 14, color: 'var(--text-muted)' }
};
