import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { queryAPI, savedAPI, schemaAPI } from '../utils/api';
import toast from 'react-hot-toast';
import {
  Zap, Copy, Download, Save, AlertTriangle, CheckCircle,
  ChevronDown, ChevronUp, Lightbulb, Shield, Gauge, Wrench, Sparkles
} from 'lucide-react';

const PROMPTS = [
  'Show all employees with salary > ₹50,000',
  'Find top 10 products by revenue',
  'Get users who signed up last month',
  'Calculate average rating per category',
  'Find orders with no payment record',
];

export default function GeneratorPage() {
  const location = useLocation();
  const [prompt, setPrompt] = useState(location.state?.prompt || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [schemas, setSchemas] = useState([]);
  const [selectedSchema, setSelectedSchema] = useState('');
  const [activeTab, setActiveTab] = useState('result');
  const [explanation, setExplanation] = useState(null);
  const [optimized, setOptimized] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [fixLoading, setFixLoading] = useState(false);
  const [saveModal, setSaveModal] = useState(false);
  const [saveTitle, setSaveTitle] = useState('');
  const textareaRef = useRef();

  useEffect(() => {
    schemaAPI.getAll().then(r => setSchemas(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.prompt) {
      setPrompt(location.state.prompt);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const generate = async () => {
    if (!prompt.trim()) { toast.error('Enter a prompt first'); return; }
    setLoading(true);
    setResult(null);
    setExplanation(null);
    setOptimized(null);
    try {
      const res = await queryAPI.generate({ prompt, schemaId: selectedSchema || undefined });
      setResult(res.data.data);
      toast.success('SQL generated!');
    } catch (err) {
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  const explain = async () => {
    if (!result?.sql) return;
    setExplainLoading(true);
    try {
      const res = await queryAPI.explain(result.sql);
      setExplanation(res.data.data);
      setActiveTab('explanation');
    } catch (err) { toast.error('Failed to explain'); }
    finally { setExplainLoading(false); }
  };

  const optimize = async () => {
    if (!result?.sql) return;
    setOptimizeLoading(true);
    try {
      const res = await queryAPI.optimize(result.sql, result.historyId);
      setOptimized(res.data.data);
      setActiveTab('optimized');
    } catch (err) { toast.error('Failed to optimize'); }
    finally { setOptimizeLoading(false); }
  };

  const autoFix = async () => {
    if (!result?.sql) return;
    setFixLoading(true);
    try {
      const res = await queryAPI.autoFix(result.sql);
      setResult(prev => ({ ...prev, sql: res.data.data.fixedSQL }));
      toast.success('SQL fixed!');
    } catch (err) { toast.error('Failed to fix'); }
    finally { setFixLoading(false); }
  };

  const copy = (text) => {
    navigator.clipboard.writeText(text).then(() => toast.success('Copied!'));
  };

  const download = (sql) => {
    const blob = new Blob([sql], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'query.sql';
    a.click();
  };

  const save = async () => {
    if (!saveTitle.trim()) { toast.error('Enter a title'); return; }
    try {
      await savedAPI.save({ title: saveTitle, sql: result.sql, prompt });
      toast.success('Query saved!');
      setSaveModal(false);
      setSaveTitle('');
    } catch (err) { toast.error('Failed to save'); }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') generate();
  };

  const displaySQL = activeTab === 'optimized' && optimized ? optimized.optimizedSQL : result?.sql;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={styles.title}>SQL Generator</h1>
        <p style={styles.sub}>Describe what you need in plain English — get SQL instantly</p>
      </div>

      {/* Prompt area */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Suggestion chips */}
        <div style={styles.suggestions}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>Try:</span>
          {PROMPTS.map((p, i) => (
            <button key={i} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }} onClick={() => setPrompt(p)}>
              {p}
            </button>
          ))}
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <textarea
            ref={textareaRef}
            value={prompt}
            onChange={e => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="e.g. Show all employees in the IT department with salary above 50000, ordered by name..."
            style={styles.textarea}
            rows={4}
          />
          <div style={styles.promptFooter}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              {schemas.length > 0 && (
                <select value={selectedSchema} onChange={e => setSelectedSchema(e.target.value)} style={styles.schemaSelect}>
                  <option value="">No schema</option>
                  {schemas.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              )}
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Ctrl+Enter to generate</span>
            </div>
            <button className="btn btn-primary" onClick={generate} disabled={loading}>
              {loading ? <div className="spinner" /> : <><Zap size={16} />Generate SQL</>}
            </button>
          </div>
        </div>
      </div>

      {/* Result */}
      {result && (
        <div className="card fade-in" style={{ padding: 0, overflow: 'hidden' }}>
          {/* Danger banner */}
          {result.isDangerous && (
            <div className="danger-banner" style={{ borderRadius: 0, borderBottom: '1px solid rgba(255,77,109,0.3)' }}>
              <AlertTriangle size={16} />
              <span><strong>Dangerous Query:</strong> {result.dangerReason}</span>
              <span style={{ marginLeft: 'auto', fontSize: 11, background: 'var(--red)', color: '#fff', padding: '2px 8px', borderRadius: 4 }}>
                {result.riskLevel} RISK
              </span>
            </div>
          )}

          {/* Tabs */}
          <div style={styles.tabs}>
            {[
              { key: 'result', label: 'SQL Query' },
              { key: 'explanation', label: 'Explanation' },
              { key: 'optimized', label: 'Optimized' },
            ].map(t => (
              <button key={t.key} onClick={() => setActiveTab(t.key)}
                style={{ ...styles.tab, ...(activeTab === t.key ? styles.tabActive : {}) }}>
                {t.label}
                {t.key === 'explanation' && !explanation && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 4 }}>new</span>}
              </button>
            ))}
          </div>

          <div style={{ padding: 20 }}>
            {/* Info row */}
            <div style={styles.infoRow}>
              <span className={`badge badge-${result.queryType.toLowerCase()}`}>{result.queryType}</span>
              <span className={`badge badge-${result.difficulty?.toLowerCase()}`}>{result.difficulty}</span>
              {result.tablesUsed?.length > 0 && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Tables: {result.tablesUsed.join(', ')}
                </span>
              )}
              {result.estimatedRows && (
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  ~{result.estimatedRows} rows
                </span>
              )}
            </div>

            {/* SQL block */}
            {(activeTab === 'result' || activeTab === 'optimized') && (
              <>
                <div style={styles.sqlHeader}>
                  <span style={{ fontSize: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {activeTab === 'optimized' ? 'optimized.sql' : 'query.sql'}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => copy(displaySQL)}><Copy size={13} />Copy</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => download(displaySQL)}><Download size={13} />Download</button>
                    {activeTab === 'result' && <button className="btn btn-ghost btn-sm" onClick={() => setSaveModal(true)}><Save size={13} />Save</button>}
                  </div>
                </div>
                <div className="sql-block">{displaySQL}</div>
                {activeTab === 'optimized' && optimized?.improvements?.length > 0 && (
                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8 }}>Improvements made:</p>
                    {optimized.improvements.map((imp, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <CheckCircle size={13} color="var(--green)" style={{ marginTop: 2, flexShrink: 0 }} />
                        {imp}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Explanation tab */}
            {activeTab === 'explanation' && (
              !explanation ? (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 16 }}>Get a plain-English explanation of this query</p>
                  <button className="btn btn-primary" onClick={explain} disabled={explainLoading}>
                    {explainLoading ? <div className="spinner" /> : <><Lightbulb size={16} />Explain Query</>}
                  </button>
                </div>
              ) : (
                <div>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 14, lineHeight: 1.8, marginBottom: 16 }}>{explanation.explanation}</p>
                  {explanation.clauses?.length > 0 && (
                    <>
                      <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Clauses used:</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                        {explanation.clauses.map((c, i) => (
                          <span key={i} style={{ padding: '4px 10px', background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 20, fontSize: 12, fontFamily: 'var(--font-mono)' }}>{c}</span>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )
            )}

            {/* Action buttons */}
            <div style={styles.actions}>
              <button className="btn btn-secondary btn-sm" onClick={explain} disabled={explainLoading}>
                {explainLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Lightbulb size={14} />}
                Explain
              </button>
              <button className="btn btn-secondary btn-sm" onClick={optimize} disabled={optimizeLoading}>
                {optimizeLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Sparkles size={14} />}
                Optimize
              </button>
              <button className="btn btn-secondary btn-sm" onClick={autoFix} disabled={fixLoading}>
                {fixLoading ? <div className="spinner" style={{ width: 14, height: 14 }} /> : <Wrench size={14} />}
                Auto Fix
              </button>
            </div>

            {/* Difficulty insight */}
            {result.difficultyReason && (
              <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--bg-input)', borderRadius: 8, fontSize: 12, color: 'var(--text-muted)' }}>
                <Gauge size={12} style={{ marginRight: 6, display: 'inline' }} />
                {result.difficultyReason}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Save modal */}
      {saveModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={{ marginBottom: 16 }}>Save Query</h3>
            <input className="input" placeholder="Query title..." value={saveTitle}
              onChange={e => setSaveTitle(e.target.value)} style={{ marginBottom: 16 }} />
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setSaveModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={save}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  title: { fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 },
  sub: { fontSize: 14, color: 'var(--text-muted)' },
  suggestions: {
    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px',
    borderBottom: '1px solid var(--border)', flexWrap: 'wrap', overflowX: 'auto'
  },
  textarea: {
    width: '100%', padding: '14px 16px', background: 'var(--bg-input)',
    border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text-primary)',
    fontFamily: 'var(--font-sans)', fontSize: 14, outline: 'none', resize: 'vertical',
    lineHeight: 1.7, marginBottom: 12, transition: 'border-color 0.2s'
  },
  promptFooter: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  schemaSelect: {
    padding: '8px 12px', background: 'var(--bg-input)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-secondary)', fontSize: 13, outline: 'none', cursor: 'pointer'
  },
  tabs: { display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 20px' },
  tab: {
    padding: '12px 16px', background: 'transparent', border: 'none',
    color: 'var(--text-muted)', fontSize: 13, fontWeight: 500, cursor: 'pointer',
    borderBottom: '2px solid transparent', transition: 'all 0.15s'
  },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  infoRow: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 14 },
  sqlHeader: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  actions: { display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' },
  modalOverlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  modal: {
    background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
    padding: 24, width: '100%', maxWidth: 400
  }
};
