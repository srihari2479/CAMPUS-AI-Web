import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FileText, Calendar, UserCheck, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { supabase } from '../services/supabase';
import './Sidebar.css';

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <button className="collapse-btn" onClick={onToggle} aria-label="Toggle Sidebar">
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      <div className="sidebar-brand-wrapper">
        <div className="sidebar-brand">
          <div className="logo-container">
            <img src="/logo.png" alt="DIET Logo" className="brand-logo" />
          </div>
          {!isCollapsed && (
            <div className="brand-text-group">
              <span className="brand-title">DIET</span>
              <span className="brand-subtitle">Console Admin</span>
            </div>
          )}
        </div>
      </div>
      
      <nav className="sidebar-menu">
        <NavLink 
          to="/" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Dashboard" : undefined}
        >
          <LayoutDashboard size={20} className="menu-icon" />
          {!isCollapsed && <span>Dashboard</span>}
        </NavLink>

        <NavLink 
          to="/students" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Student Approvals" : undefined}
        >
          <UserCheck size={20} className="menu-icon" />
          {!isCollapsed && <span>Student Approvals</span>}
        </NavLink>

        <NavLink 
          to="/uploads" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Document Manager" : undefined}
        >
          <FileText size={20} className="menu-icon" />
          {!isCollapsed && <span>Document Manager</span>}
        </NavLink>

        <NavLink 
          to="/events" 
          className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          title={isCollapsed ? "Event Portal" : undefined}
        >
          <Calendar size={20} className="menu-icon" />
          {!isCollapsed && <span>Event Portal</span>}
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        {isCollapsed ? (
          <div 
            className="profile-avatar-mini" 
            title="Click to Sign Out" 
            onClick={() => supabase.auth.signOut()}
          >
            <div className="profile-avatar-container">
              <img src="https://api.dicebear.com/7.x/initials/svg?seed=Abhishek&backgroundColor=002147" alt="Avatar" className="user-avatar" />
              <div className="online-dot"></div>
            </div>
          </div>
        ) : (
          <div className="profile-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div className="profile-avatar-container">
                <img src="https://api.dicebear.com/7.x/initials/svg?seed=Abhishek&backgroundColor=002147" alt="Avatar" className="user-avatar" />
                <div className="online-dot"></div>
              </div>
              <div className="profile-info">
                <span className="profile-name">Abhishek K.</span>
                <span className="profile-role">Root Admin</span>
              </div>
            </div>
            <button 
              onClick={() => supabase.auth.signOut()}
              style={{
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.45)',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s'
              }}
              title="Sign Out"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ef4444';
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'rgba(255, 255, 255, 0.45)';
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
