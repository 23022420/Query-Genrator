import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { User, Lock, Shield, Save, Eye, EyeOff } from 'lucide-react';

export default function SettingsPage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [passForm, setPassForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);

  const saveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required'); return; }
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.message || 'Update failed'); }
    finally { setLoading(false); }
  };

  const changePassword = async () => {
    if (!passForm.currentPassword || !passForm.newPassword) { toast.error('Fill all fields'); return; }
    if (passForm.newPassword !== passForm.confirmPassword) { toast.error('Passwords do not match'); return; }
    if (passForm.newPassword.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passForm.newPassword)) {
      toast.error('Password must have uppercase, lowercase and number'); return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({ currentPassword: passForm.currentPassword, newPassword: passForm.newPassword });
      toast.success('Password changed! Please log in again.');
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.message || 'Failed to change password'); }
    finally { setLoading(false); }
  };

  const tabs = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Security', icon: Lock },
    { key: 'account', label: 'Account Info', icon: Shield },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 700 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Settings</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage your account preferences</p>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {tabs.map(({ key, label, icon: Icon }) => (
          <button key={key} onClick={() => setActiveTab(key)}
            style={{ ...styles.tab, ...(activeTab === key ? styles.tabActive : {}) }}>
            <Icon size={15} />{label}
          </button>
        ))}
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card fade-in">
          <h3 style={styles.sectionTitle}>Profile Information</h3>

          {/* Avatar preview */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
            <div style={styles.avatarLarge}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
            <div>
              <p style={{ fontWeight: 600, marginBottom: 2 }}>{user?.name}</p>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>{user?.email}</p>
              <span style={{ fontSize: 11, padding: '2px 8px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 10, display: 'inline-block', marginTop: 4, textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
          </div>

          <div style={styles.formGrid}>
            <div style={styles.field}>
              <label style={styles.label}>Full Name</label>
              <input className="input" value={profileForm.name}
                onChange={e => setProfileForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Email</label>
              <input className="input" value={user?.email} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Email cannot be changed</p>
            </div>
          </div>

          <button className="btn btn-primary" onClick={saveProfile} disabled={loading} style={{ marginTop: 8 }}>
            {loading ? <div className="spinner" /> : <><Save size={15} />Save Changes</>}
          </button>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="card fade-in">
          <h3 style={styles.sectionTitle}>Change Password</h3>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Use a strong password with uppercase, lowercase, and numbers
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { key: 'current', label: 'Current Password', field: 'currentPassword' },
              { key: 'new', label: 'New Password', field: 'newPassword' },
              { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
            ].map(({ key, label, field }) => (
              <div key={key} style={styles.field}>
                <label style={styles.label}>{label}</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" type={showPass[key] ? 'text' : 'password'}
                    style={{ paddingRight: 40 }}
                    value={passForm[field]}
                    onChange={e => setPassForm(p => ({ ...p, [field]: e.target.value }))} />
                  <button type="button"
                    onClick={() => setShowPass(p => ({ ...p, [key]: !p[key] }))}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    {showPass[key] ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>
            ))}

            {passForm.newPassword && (
              <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px' }}>
                {[
                  { label: 'At least 8 characters', ok: passForm.newPassword.length >= 8 },
                  { label: 'Uppercase letter', ok: /[A-Z]/.test(passForm.newPassword) },
                  { label: 'Lowercase letter', ok: /[a-z]/.test(passForm.newPassword) },
                  { label: 'Number', ok: /\d/.test(passForm.newPassword) },
                ].map(({ label, ok }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: ok ? 'var(--green)' : 'var(--text-muted)' }}>{ok ? '✓' : '○'}</span>
                    <span style={{ color: ok ? 'var(--green)' : 'var(--text-muted)' }}>{label}</span>
                  </div>
                ))}
              </div>
            )}

            <button className="btn btn-primary" onClick={changePassword} disabled={loading} style={{ alignSelf: 'flex-start' }}>
              {loading ? <div className="spinner" /> : <><Lock size={15} />Change Password</>}
            </button>
          </div>
        </div>
      )}

      {/* Account Info Tab */}
      {activeTab === 'account' && (
        <div className="card fade-in">
          <h3 style={styles.sectionTitle}>Account Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'User ID', value: user?._id },
              { label: 'Role', value: user?.role },
              { label: 'Total Queries', value: user?.queryCount || 0 },
              { label: 'Member Since', value: new Date(user?.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) },
              { label: 'Account Status', value: 'Active' },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{label}</span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, fontFamily: label === 'User ID' ? 'var(--font-mono)' : 'inherit', fontSize: label === 'User ID' ? 11 : 13 }}>{value}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, padding: 16, background: 'var(--red-dim)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 10 }}>
            <p style={{ fontWeight: 600, color: 'var(--red)', marginBottom: 4, fontSize: 14 }}>Danger Zone</p>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Once you delete your account, all your data will be permanently removed.</p>
            <button className="btn btn-danger btn-sm" onClick={() => toast.error('Contact support to delete your account')}>
              Delete Account
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' },
  tab: { display: 'flex', alignItems: 'center', gap: 7, padding: '8px 16px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: 'var(--accent)', color: '#fff' },
  sectionTitle: { fontSize: 16, fontWeight: 600, marginBottom: 20 },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' },
  avatarLarge: { width: 60, height: 60, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #4da6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#fff', flexShrink: 0 },
};
