import React, { useState } from 'react';
import { FiMenu } from 'react-icons/fi';
import Sidebar, { MobileSidebar } from './Sidebar';

const AppLayout = ({ children, title, actions }) => {
  const [collapsed,   setCollapsed]   = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-dark-950">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-shrink-0">
        <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      </div>

      {/* Mobile sidebar */}
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        {/* Topbar */}
        <header className="flex items-center justify-between px-4 lg:px-6 py-4 bg-white dark:bg-dark-900 border-b border-slate-200 dark:border-dark-700 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-dark-700 transition-colors" onClick={() => setMobileOpen(true)} aria-label="Open menu">
              <FiMenu size={20} />
            </button>
            {title && <h1 className="text-xl font-bold text-slate-800 dark:text-white">{title}</h1>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
