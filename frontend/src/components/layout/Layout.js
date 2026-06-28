import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Zap, History, Bookmark, Database,
  Settings, Shield, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/generator', icon: Zap, label: 'SQL Generator' },
  { to: '/history', icon: History, label: 'History' },
  { to: '/saved', icon: Bookmark, label: 'Saved Queries' },
  { to: '/schema', icon: Database, label: 'Schema Explorer' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function Layout() {
  const { user, logout, isAdmin } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div style={styles.sidebar}>
      {/* Logo */}
      <div style={styles.logo}>
        <div style={styles.logoIcon}>
          <Zap size={20} color="#fff" />
        </div>
        {!collapsed && <span style={styles.logoText}>QueryNova</span>}
      </div>

      <div style={styles.divider} />

      {/* Nav */}
      <nav style={styles.nav}>
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}>
            <Icon size={18} />
            {!collapsed && <span>{label}</span>}
            {!collapsed && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/admin" onClick={() => setMobileOpen(false)}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.navItemActive : {})
            })}>
            <Shield size={18} />
            {!collapsed && <span>Admin</span>}
            {!collapsed && <ChevronRight size={14} style={{ marginLeft: 'auto', opacity: 0.4 }} />}
          </NavLink>
        )}
      </nav>

      <div style={{ flex: 1 }} />

      {/* User */}
      <div style={styles.userSection}>
        <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
        {!collapsed && (
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={styles.userName}>{user?.name}</div>
            <div style={styles.userRole}>{user?.role}</div>
          </div>
        )}
        <button onClick={handleLogout} style={styles.logoutBtn} title="Logout">
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.layout}>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={styles.overlay} onClick={() => setMobileOpen(false)} />
      )}

      {/* Desktop sidebar */}
      <div style={{ ...styles.sidebarWrapper, width: collapsed ? 70 : 240 }} className="desktop-sidebar">
        <SidebarContent />
        <button style={styles.collapseBtn} onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? <ChevronRight size={16} /> : <Menu size={16} />}
        </button>
      </div>

      {/* Mobile sidebar */}
      <div style={{ ...styles.mobileSidebar, transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)' }}>
        <SidebarContent />
      </div>

      {/* Main content */}
      <div style={{ ...styles.main, marginLeft: collapsed ? 70 : 240 }}>
        {/* Topbar */}
        <header style={styles.topbar}>
          <button style={styles.menuBtn} onClick={() => setMobileOpen(!mobileOpen)} className="mobile-menu-btn">
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={styles.topbarRight}>
            <div style={styles.queryBadge}>
              <Zap size={12} />
              {user?.queryCount || 0} queries
            </div>
            <div style={styles.avatar}>{user?.name?.[0]?.toUpperCase() || 'U'}</div>
          </div>
        </header>
        <main style={styles.content}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (min-width: 769px) {
          .mobile-menu-btn { display: none !important; }
        }
      `}</style>
    </div>
  );
}

const styles = {
  layout: { display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' },
  sidebarWrapper: {
    position: 'fixed', top: 0, left: 0, height: '100vh',
    background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
    transition: 'width 0.2s ease', zIndex: 100, overflow: 'hidden'
  },
  mobileSidebar: {
    position: 'fixed', top: 0, left: 0, height: '100vh', width: 240,
    background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)',
    transition: 'transform 0.3s ease', zIndex: 200
  },
  overlay: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    zIndex: 150, backdropFilter: 'blur(2px)'
  },
  sidebar: {
    display: 'flex', flexDirection: 'column', height: '100%',
    padding: '20px 0', overflow: 'hidden'
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '0 16px 0 20px', marginBottom: 4
  },
  logoIcon: {
    width: 34, height: 34, background: 'linear-gradient(135deg, #6c63ff, #4da6ff)',
    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0
  },
  logoText: { fontWeight: 700, fontSize: 18, color: 'var(--text-primary)' },
  divider: { height: 1, background: 'var(--border)', margin: '16px 0' },
  nav: { display: 'flex', flexDirection: 'column', gap: 4, padding: '0 10px' },
  navItem: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
    borderRadius: 8, color: 'var(--text-secondary)', textDecoration: 'none',
    fontSize: 14, fontWeight: 500, transition: 'all 0.15s ease',
    whiteSpace: 'nowrap', overflow: 'hidden'
  },
  navItemActive: {
    background: 'var(--accent-dim)', color: 'var(--accent)',
    borderLeft: '2px solid var(--accent)', paddingLeft: 10
  },
  userSection: {
    display: 'flex', alignItems: 'center', gap: 10, padding: '16px 16px 0',
    borderTop: '1px solid var(--border)', marginTop: 16
  },
  avatar: {
    width: 32, height: 32, borderRadius: '50%',
    background: 'linear-gradient(135deg, #6c63ff, #4da6ff)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 600, color: '#fff', flexShrink: 0
  },
  userName: { fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis' },
  userRole: { fontSize: 11, color: 'var(--text-muted)', textTransform: 'capitalize' },
  logoutBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-muted)', padding: 4, borderRadius: 6,
    display: 'flex', alignItems: 'center', transition: 'color 0.15s'
  },
  collapseBtn: {
    position: 'absolute', bottom: 80, right: -12, width: 24, height: 24,
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '50%', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)'
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', transition: 'margin-left 0.2s ease' },
  topbar: {
    height: 60, background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0 24px', position: 'sticky', top: 0, zIndex: 50
  },
  menuBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-secondary)', padding: 4
  },
  topbarRight: { display: 'flex', alignItems: 'center', gap: 12 },
  queryBadge: {
    display: 'flex', alignItems: 'center', gap: 5, padding: '4px 10px',
    background: 'var(--accent-dim)', color: 'var(--accent)', borderRadius: 20,
    fontSize: 12, fontWeight: 500
  },
  content: { flex: 1, padding: 24, overflow: 'auto' }
};
