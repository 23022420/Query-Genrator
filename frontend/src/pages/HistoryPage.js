import React, { useState, useEffect } from 'react';
import { historyAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Search, Trash2, Star, AlertTriangle, RefreshCw, Filter, X } from 'lucide-react';

const TYPE_FILTERS = ['ALL', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'OTHER'];

export default function HistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [favFilter, setFavFilter] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({});
  const [expanded, setExpanded] = useState(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await historyAPI.getAll({
        page, limit: 15, search: search || undefined,
        queryType: typeFilter !== 'ALL' ? typeFilter : undefined,
        favorites: favFilter ? 'true' : undefined
      });
      setHistory(res.data.data);
      setPagination(res.data.pagination);
    } catch (err) { toast.error('Failed to load history'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [page, typeFilter, favFilter]);
  useEffect(() => {
    const t = setTimeout(() => { setPage(1); fetchHistory(); }, 500);
    return () => clearTimeout(t);
  }, [search]);

  const toggleFav = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await historyAPI.toggleFavorite(id);
      setHistory(prev => prev.map(h => h._id === id ? { ...h, isFavorite: res.data.isFavorite } : h));
    } catch { toast.error('Failed to update'); }
  };

  const deleteItem = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete this history item?')) return;
    try {
      await historyAPI.delete(id);
      setHistory(prev => prev.filter(h => h._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const clearAll = async () => {
    if (!window.confirm('Clear all history? This cannot be undone.')) return;
    try {
      await historyAPI.clearAll();
      setHistory([]);
      toast.success('History cleared');
    } catch { toast.error('Failed to clear'); }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Query History</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{pagination.total || 0} total queries</p>
        </div>
        <button className="btn btn-danger btn-sm" onClick={clearAll}><Trash2 size={14} />Clear All</button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search queries..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {TYPE_FILTERS.map(t => (
            <button key={t} className={`btn btn-sm ${typeFilter === t ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setTypeFilter(t); setPage(1); }}>
              {t}
            </button>
          ))}
        </div>
        <button className={`btn btn-sm ${favFilter ? 'btn-primary' : 'btn-ghost'}`} onClick={() => { setFavFilter(!favFilter); setPage(1); }}>
          <Star size={14} />Favorites
        </button>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : history.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <RefreshCw size={32} style={{ opacity: 0.3, marginBottom: 12 }} />
          <p>No history found</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {history.map(item => (
            <div key={item._id} className="card" style={{ padding: 0, cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <span className={`badge badge-${item.queryType.toLowerCase()}`}>{item.queryType}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 2 }}>
                    {item.prompt}
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {new Date(item.createdAt).toLocaleString()} · <span className={`badge badge-${item.difficulty?.toLowerCase()}`} style={{ padding: '1px 6px', fontSize: 10 }}>{item.difficulty}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {item.isDangerous && <AlertTriangle size={15} color="var(--red)" title="Dangerous query" />}
                  <button onClick={e => toggleFav(item._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.isFavorite ? '#ffd166' : 'var(--text-muted)', padding: 4 }}>
                    <Star size={15} fill={item.isFavorite ? '#ffd166' : 'none'} />
                  </button>
                  <button onClick={e => deleteItem(item._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              {expanded === item._id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px' }}>
                  <div className="sql-block" style={{ marginBottom: item.explanation ? 12 : 0 }}>{item.generatedSQL}</div>
                  {item.explanation && <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.explanation}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>← Prev</button>
          <span style={{ padding: '8px 12px', fontSize: 13, color: 'var(--text-muted)' }}>Page {page} of {pagination.pages}</span>
          <button className="btn btn-ghost btn-sm" onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages}>Next →</button>
        </div>
      )}
    </div>
  );
}
