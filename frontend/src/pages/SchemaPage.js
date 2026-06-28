import React, { useState, useEffect } from 'react';
import { schemaAPI } from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Database, Table, ChevronDown, ChevronRight, Key, Link } from 'lucide-react';

export default function SchemaPage() {
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', rawSchema: '' });
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState({});
  const [tableExpanded, setTableExpanded] = useState({});

  useEffect(() => {
    schemaAPI.getAll().then(r => setSchemas(r.data.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.rawSchema) { toast.error('Name and schema required'); return; }
    setSaving(true);
    try {
      const res = await schemaAPI.create(form);
      setSchemas(prev => [res.data.data, ...prev]);
      setForm({ name: '', rawSchema: '' });
      setShowAdd(false);
      toast.success('Schema created and parsed!');
    } catch (err) { toast.error(err.message || 'Failed to create schema'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schema?')) return;
    try {
      await schemaAPI.delete(id);
      setSchemas(prev => prev.filter(s => s._id !== id));
      toast.success('Schema deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const toggleSchema = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  const toggleTable = (key) => setTableExpanded(prev => ({ ...prev, [key]: !prev[key] }));

  const EXAMPLE_SCHEMA = `CREATE TABLE Employee (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10,2),
  manager_id INT REFERENCES Employee(id)
);

CREATE TABLE Department (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  budget DECIMAL(15,2)
);`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 2 }}>Schema Explorer</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Manage your database schemas for better AI-powered SQL generation</p>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setShowAdd(!showAdd)}>
          <Plus size={16} />Add Schema
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="card fade-in">
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>Add Database Schema</h3>
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 16 }}>Paste your CREATE TABLE statements — AI will parse and understand your schema structure</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input className="input" placeholder="Schema name (e.g. 'E-commerce DB')" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            <textarea className="input" placeholder={EXAMPLE_SCHEMA} value={form.rawSchema}
              onChange={e => setForm(p => ({ ...p, rawSchema: e.target.value }))} rows={10}
              style={{ fontFamily: 'var(--font-mono)', fontSize: 12, resize: 'vertical' }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleCreate} disabled={saving}>
                {saving ? <div className="spinner" /> : <><Database size={14} />Parse & Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schemas list */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}><div className="spinner" style={{ width: 32, height: 32 }} /></div>
      ) : schemas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <Database size={40} style={{ opacity: 0.2, marginBottom: 12 }} />
          <p style={{ marginBottom: 8 }}>No schemas yet</p>
          <p style={{ fontSize: 13 }}>Add a schema to get schema-aware SQL generation</p>
        </div>
      ) : (
        schemas.map(schema => (
          <div key={schema._id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }} onClick={() => toggleSchema(schema._id)}>
              <Database size={18} color="var(--accent)" />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 600, marginBottom: 2 }}>{schema.name}</p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>{schema.tables?.length || 0} tables · Added {new Date(schema.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={e => { e.stopPropagation(); handleDelete(schema._id); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <Trash2 size={15} />
              </button>
              {expanded[schema._id] ? <ChevronDown size={16} color="var(--text-muted)" /> : <ChevronRight size={16} color="var(--text-muted)" />}
            </div>
            {expanded[schema._id] && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px 20px' }}>
                {schema.tables?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {schema.tables.map((table, ti) => {
                      const key = `${schema._id}-${ti}`;
                      return (
                        <div key={ti} style={{ border: '1px solid var(--border)', borderRadius: 8, overflow: 'hidden' }}>
                          <div style={{ padding: '10px 14px', background: 'var(--bg-input)', display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }} onClick={() => toggleTable(key)}>
                            <Table size={14} color="var(--blue)" />
                            <span style={{ fontWeight: 600, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--blue)' }}>{table.name}</span>
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>({table.columns?.length} cols)</span>
                            <span style={{ marginLeft: 'auto' }}>{tableExpanded[key] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}</span>
                          </div>
                          {tableExpanded[key] && table.columns && (
                            <div style={{ padding: '8px 0' }}>
                              {table.columns.map((col, ci) => (
                                <div key={ci} style={{ padding: '6px 14px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: ci < table.columns.length - 1 ? '1px solid var(--border)' : 'none' }}>
                                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', minWidth: 120 }}>{col.name}</span>
                                  <span style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{col.type}</span>
                                  <div style={{ display: 'flex', gap: 6, marginLeft: 'auto' }}>
                                    {col.isPrimaryKey && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#ffd166' }}><Key size={10} />PK</span>}
                                    {col.isForeignKey && <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'var(--blue)' }}><Link size={10} />FK</span>}
                                    {col.nullable === false && <span style={{ fontSize: 10, color: 'var(--red)' }}>NOT NULL</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="sql-block" style={{ fontSize: 11, maxHeight: 200, overflow: 'auto' }}>{schema.rawSchema}</div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
