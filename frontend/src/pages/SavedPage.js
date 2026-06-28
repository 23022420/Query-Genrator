import React, { useState, useEffect } from 'react';
import { savedAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Star, Copy, Edit2, Search, X, Check } from 'lucide-react';

export default function SavedPage() {
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ title: '', sql: '', description: '', tags: '' });
  const [expanded, setExpanded] = useState(null);

  const fetchSaved = async () => {
    setLoading(true);
    try {
      const res = await savedAPI.getAll({ search: search || undefined });
      setSaved(res.data.data);
    } catch { toast.error('Failed to load saved queries'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchSaved(); }, []);
  useEffect(() => {
    const t = setTimeout(fetchSaved, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleSave = async () => {
    if (!form.title || !form.sql) { toast.error('Title and SQL required'); return; }
    try {
      if (editId) {
        const res = await savedAPI.update(editId, { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
        setSaved(prev => prev.map(s => s._id === editId ? res.data.data : s));
        toast.success('Query updated');
      } else {
        const res = await savedAPI.save({ ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) });
        setSaved(prev => [res.data.data, ...prev]);
        toast.success('Query saved');
      }
      resetForm();
    } catch (err) { toast.error(err.message || 'Failed to save'); }
  };

  const resetForm = () => {
    setForm({ title: '', sql: '', description: '', tags: '' });
    setShowAdd(false);
    setEditId(null);
  };

  const startEdit = (item, e) => {
    e.stopPropagation();
    setForm({ title: item.title, sql: item.sql, description: item.description || '', tags: (item.tags || []).join(', ') });
    setEditId(item._id);
    setShowAdd(true);
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Delete saved query?')) return;
    try {
      await savedAPI.delete(id);
      setSaved(prev => prev.filter(s => s._id !== id));
      toast.success('Deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleFav = async (id, e) => {
    e.stopPropagation();
    try {
      const res = await savedAPI.toggleFavorite(id);
      setSaved(prev => prev.map(s => s._id === id ? { ...s, isFavorite: res.data.isFavorite } : s));
    } catch { toast.error('Failed to update'); }
  };

  const copy = (sql, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(sql).then(() => toast.success('Copied!'));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Saved Queries</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>{saved.length} saved</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />Save Query
        </button>
      </div>

      {/* Add/Edit form */}
      {showAdd && (
        <div className="card fade-in">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 16 }}>{editId ? 'Edit Query' : 'Save New Query'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input" placeholder="Title *" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
            <textarea className="input" placeholder="SQL Query *" value={form.sql} onChange={e => setForm(p => ({ ...p, sql: e.target.value }))} rows={4} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, resize: 'vertical' }} />
            <input className="input" placeholder="Description (optional)" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            <input className="input" placeholder="Tags (comma-separated)" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={resetForm}><X size={14} />Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}><Check size={14} />{editId ? 'Update' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input className="input" style={{ paddingLeft: 36 }} placeholder="Search saved queries..." value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : saved.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p>No saved queries yet. Save a query from the generator!</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {saved.map(item => (
            <div key={item._id} className="card" style={{ padding: 0, cursor: 'pointer', overflow: 'hidden' }}
              onClick={() => setExpanded(expanded === item._id ? null : item._id)}>
              <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: 'var(--text-primary)' }}>{item.title}</p>
                  {item.description && <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>{item.description}</p>}
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {item.tags?.map((tag, i) => (
                      <span key={i} style={{ padding: '2px 8px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 12, fontSize: 11 }}>{tag}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={e => copy(item.sql, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} title="Copy"><Copy size={15} /></button>
                  <button onClick={e => startEdit(item, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }} title="Edit"><Edit2 size={15} /></button>
                  <button onClick={e => toggleFav(item._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.isFavorite ? '#ffd166' : 'var(--text-muted)', padding: 4 }}>
                    <Star size={15} fill={item.isFavorite ? '#ffd166' : 'none'} />
                  </button>
                  <button onClick={e => handleDelete(item._id, e)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}><Trash2 size={15} /></button>
                </div>
              </div>
              {expanded === item._id && (
                <div style={{ borderTop: '1px solid var(--border)', padding: '14px 16px' }}>
                  <div className="sql-block">{item.sql}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
