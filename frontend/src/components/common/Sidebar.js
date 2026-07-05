/**
 * Sidebar
 * Navigation is generated dynamically from ROLE_CONFIG[role].navItems.
 * No hardcoded switch/case — adding a new role only requires updating roleConfig.js.
 */
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  FiShield, FiLogOut, FiMenu, FiX, FiMoon, FiSun, FiChevronLeft,
} from 'react-icons/fi';
import { useAuth }  from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getRoleConfig } from '../../config/roleConfig';
import { getRoleLabel, getRoleColor } from '../../utils/riskUtils';

// ── Single nav item ──────────────────────────────────────────────────────────
const NavItem = ({ to, icon: Icon, label, collapsed }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150
       ${isActive
         ? 'bg-primary-600 text-white shadow-sm'
         : 'text-slate-400 hover:bg-dark-700 hover:text-white'}
       ${collapsed ? 'justify-center' : ''}`
    }
    title={collapsed ? label : undefined}
  >
    <Icon size={18} className="flex-shrink-0" />
    {!collapsed && <span>{label}</span>}
  </NavLink>
);

// ── Desktop sidebar ──────────────────────────────────────────────────────────
const Sidebar = ({ collapsed, setCollapsed }) => {
  const { user, logout }    = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate            = useNavigate();
  const primaryRole         = user?.roles?.[0];
  const config              = getRoleConfig(primaryRole);
  const navItems            = config.navItems || [];

  return (
    <aside className={`flex flex-col h-full bg-dark-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>

      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-dark-700">
        {!collapsed && (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <FiShield size={16} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white text-sm leading-none">ComplianceAI</p>
              <p className="text-xs text-slate-500 mt-0.5">Enterprise Platform</p>
            </div>
          </div>
        )}
        {collapsed
          ? (
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center mx-auto">
              <FiShield size={16} className="text-white" />
            </div>
          ) : (
            <button
              onClick={() => setCollapsed(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
              aria-label="Collapse sidebar"
            >
              <FiChevronLeft size={16} />
            </button>
          )
        }
      </div>

      {/* Expand button when collapsed */}
      {collapsed && (
        <button
          onClick={() => setCollapsed(false)}
          className="p-2 mx-auto mt-2 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
          aria-label="Expand sidebar"
        >
          <FiMenu size={16} />
        </button>
      )}

      {/* Nav — generated from ROLE_CONFIG */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {navItems.map(item => (
          <NavItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>

      {/* Bottom — theme toggle + user card + logout */}
      <div className="px-2 py-4 border-t border-dark-700 space-y-1">
        <button
          onClick={toggleTheme}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-slate-400 hover:bg-dark-700 hover:text-white transition-colors
            ${collapsed ? 'justify-center' : ''}`}
          aria-label="Toggle theme"
        >
          {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
          {!collapsed && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {!collapsed && user && (
          <div className="px-3 py-2.5 rounded-lg bg-dark-800 mt-1">
            <p className="text-xs font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate mb-1">{user.email}</p>
            {primaryRole && (
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(primaryRole)}`}>
                {getRoleLabel(primaryRole)}
              </span>
            )}
          </div>
        )}

        <button
          onClick={() => { logout(); navigate('/'); }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors
            ${collapsed ? 'justify-center' : ''}`}
          aria-label="Logout"
        >
          <FiLogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </aside>
  );
};

// ── Mobile sidebar ────────────────────────────────────────────────────────────
export const MobileSidebar = ({ open, onClose }) => {
  const { user, logout }        = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate                = useNavigate();
  const primaryRole             = user?.roles?.[0];
  const config                  = getRoleConfig(primaryRole);
  const navItems                = config.navItems || [];

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-dark-900 text-white
        transform transition-transform duration-300 lg:hidden
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-dark-700">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center flex-shrink-0">
              <FiShield size={16} className="text-white" />
            </div>
            <span className="font-bold text-white">ComplianceAI</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-dark-700 transition-colors"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>

        {/* Nav — generated from ROLE_CONFIG */}
        <nav className="px-2 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                 ${isActive ? 'bg-primary-600 text-white' : 'text-slate-400 hover:bg-dark-700 hover:text-white'}`
              }
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-2 py-4 border-t border-dark-700 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-dark-700 hover:text-white transition-colors"
          >
            {isDark ? <FiSun size={18} /> : <FiMoon size={18} />}
            <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>
          </button>

          {user && (
            <div className="px-3 py-2 rounded-lg bg-dark-800">
              <p className="text-xs font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{user.email}</p>
              {primaryRole && (
                <span className={`mt-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${getRoleColor(primaryRole)}`}>
                  {getRoleLabel(primaryRole)}
                </span>
              )}
            </div>
          )}

          <button
            onClick={() => { logout(); navigate('/'); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-red-900/30 hover:text-red-400 transition-colors"
          >
            <FiLogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
