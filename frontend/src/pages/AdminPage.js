import React, { useState, useEffect } from 'react';
import { adminAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Users, Zap, AlertTriangle, Activity, Shield, ToggleLeft, ToggleRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminPage() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    Promise.all([adminAPI.getStats(), adminAPI.getUsers()])
      .then(([statsRes, usersRes]) => {
        setStats(statsRes.data.data);
        setUsers(usersRes.data.data);
      })
      .catch(() => toast.error('Failed to load admin data'))
      .finally(() => setLoading(false));
  }, []);

  const toggleUser = async (id) => {
    try {
      const res = await adminAPI.toggleUser(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: res.data.isActive } : u));
      toast.success('User status updated');
    } catch { toast.error('Failed to update user'); }
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'Total Queries', value: stats?.totalQueries || 0, icon: Zap, color: '#00d4a0', bg: 'rgba(0,212,160,0.15)' },
    { label: 'Queries Today', value: stats?.activeToday || 0, icon: Activity, color: '#4da6ff', bg: 'rgba(77,166,255,0.15)' },
    { label: 'Dangerous Queries', value: stats?.dangerousQueries || 0, icon: AlertTriangle, color: '#ff4d6d', bg: 'rgba(255,77,109,0.15)' },
  ];

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: 80 }}>
      <div className="spinner" style={{ width: 40, height: 40 }} />
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, background: 'rgba(255,77,109,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Shield size={18} color="var(--red)" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Admin Panel</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>System overview and user management</p>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid-4">
        {statCards.map((card, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
              <card.icon size={18} color={card.color} />
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{card.value}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {['overview', 'users'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}>
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {/* Query type chart */}
          <div className="card">
            <h3 style={styles.cardTitle}>Queries by Type</h3>
            {stats?.queryByType?.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats.queryByType.map(t => ({ name: t._id, count: t.count }))} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                  <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px 0' }}>No data</p>}
          </div>

          {/* Recent users */}
          <div className="card">
            <h3 style={styles.cardTitle}>Recent Registrations</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {stats?.recentUsers?.map(u => (
                <div key={u._id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={styles.avatar}>{u.name[0].toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name}</p>
                    <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</span>
                </div>
              ))}
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>No users yet</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Users tab */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
            <h3 style={{ fontSize: 15, fontWeight: 600 }}>All Users ({users.length})</h3>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-input)' }}>
                  {['User', 'Role', 'Queries', 'Joined', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={styles.avatar}>{u.name[0].toUpperCase()}</div>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 500 }}>{u.name}</p>
                          <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', background: u.role === 'admin' ? 'rgba(255,77,109,0.15)' : 'var(--accent-dim)', color: u.role === 'admin' ? 'var(--red)' : 'var(--accent)', borderRadius: 12, textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--text-secondary)' }}>{u.queryCount || 0}</td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-muted)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ fontSize: 11, padding: '3px 8px', background: u.isActive ? 'var(--green-dim)' : 'var(--red-dim)', color: u.isActive ? 'var(--green)' : 'var(--red)', borderRadius: 12 }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button onClick={() => toggleUser(u._id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        {u.isActive ? <ToggleRight size={18} color="var(--green)" /> : <ToggleLeft size={18} />}
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  tabs: { display: 'flex', gap: 4, background: 'var(--bg-card)', padding: 4, borderRadius: 10, width: 'fit-content', border: '1px solid var(--border)' },
  tab: { padding: '8px 20px', background: 'transparent', border: 'none', borderRadius: 8, color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s' },
  tabActive: { background: 'var(--accent)', color: '#fff' },
  cardTitle: { fontSize: 14, fontWeight: 600, marginBottom: 14 },
  avatar: { width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #6c63ff, #4da6ff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', flexShrink: 0 },
};
