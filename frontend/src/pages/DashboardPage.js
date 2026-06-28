import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { historyAPI } from '../utils/api';
import { Zap, History, Bookmark, AlertTriangle, TrendingUp, ArrowRight, Code2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#6c63ff', '#4da6ff', '#00d4a0', '#ff4d6d', '#ffd166', '#ff6b9d'];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentHistory, setRecentHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([historyAPI.getStats(), historyAPI.getAll({ limit: 5 })])
      .then(([statsRes, historyRes]) => {
        setStats(statsRes.data.data);
        setRecentHistory(historyRes.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const greet = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const statCards = [
    { label: 'Total Queries', value: stats?.total || 0, icon: Zap, color: '#6c63ff', bg: 'rgba(108,99,255,0.15)' },
    { label: 'This Week', value: stats?.recentWeek || 0, icon: TrendingUp, color: '#00d4a0', bg: 'rgba(0,212,160,0.15)' },
    { label: 'Dangerous', value: stats?.dangerous || 0, icon: AlertTriangle, color: '#ff4d6d', bg: 'rgba(255,77,109,0.15)' },
    { label: 'Query Types', value: stats?.byType?.length || 0, icon: Code2, color: '#4da6ff', bg: 'rgba(77,166,255,0.15)' },
  ];

  const pieData = stats?.byType?.map(t => ({ name: t._id, value: t.count })) || [];
  const diffData = stats?.byDifficulty?.map(d => ({ name: d._id, count: d.count })) || [];

  const suggestions = [
    'Show all employees with salary above ₹50,000',
    'Find top 5 customers by purchase amount',
    'Get all orders from last 30 days',
    'List products with stock less than 10',
    'Count users registered this month',
    'Find duplicate email addresses in users table'
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.greeting}>{greet()}, {user?.name?.split(' ')[0]} 👋</h1>
          <p style={styles.sub}>What SQL query can we help you generate today?</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/generator')}>
          <Zap size={16} /> New Query
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4">
        {statCards.map((card, i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <card.icon size={18} color={card.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
              {loading ? '—' : card.value}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{card.label}</div>
          </div>
        ))}
      </div>

      {/* Charts + Quick Start */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 20 }}>
        {/* Pie chart */}
        <div className="card">
          <h3 style={styles.cardTitle}>Query Types</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No queries yet
            </div>
          )}
        </div>

        {/* Bar chart */}
        <div className="card">
          <h3 style={styles.cardTitle}>By Difficulty</h3>
          {diffData.length > 0 ? (
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={diffData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
                <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
              No data yet
            </div>
          )}
        </div>

        {/* Prompt ideas */}
        <div className="card">
          <h3 style={styles.cardTitle}>Try These Prompts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
            {suggestions.map((s, i) => (
              <button key={i} onClick={() => navigate('/generator', { state: { prompt: s } })}
                style={{ textAlign: 'left', background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: 12, transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                <span>{s}</span>
                <ArrowRight size={12} style={{ flexShrink: 0 }} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Recent history */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h3 style={styles.cardTitle}>Recent Queries</h3>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>View all <ArrowRight size={12} /></button>
        </div>
        {recentHistory.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
            <Zap size={32} style={{ marginBottom: 8, opacity: 0.3 }} />
            <p>No queries yet. <button onClick={() => navigate('/generator')} style={{ color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer' }}>Generate your first one</button></p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentHistory.map(item => (
              <div key={item._id} style={styles.historyItem} onClick={() => navigate('/history')}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <span className={`badge badge-${item.queryType.toLowerCase()}`}>{item.queryType}</span>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.prompt}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {item.isDangerous && <AlertTriangle size={14} color="var(--red)" />}
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 },
  greeting: { fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 },
  sub: { color: 'var(--text-muted)', fontSize: 14 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 },
  historyItem: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
    padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 8,
    cursor: 'pointer', transition: 'background 0.15s', border: '1px solid var(--border)'
  }
};
