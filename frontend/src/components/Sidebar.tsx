import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sliders, FlaskConical, FileText, Settings, ShieldAlert } from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { name: 'Command Centre', path: '/command-centre', icon: LayoutDashboard },
    { name: 'Budget Optimizer', path: '/optimizer', icon: Sliders },
    { name: 'Risk Lab & Provenance', path: '/lab', icon: FlaskConical },
    { name: 'Reports', path: '/reports', icon: FileText },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <div className="w-64 bg-slate-navy text-white h-full flex flex-col shadow-lg relative z-10">
      <div className="p-6 flex items-center gap-3 border-b border-dark-navy/20">
        <ShieldAlert className="text-risklekha-orange h-8 w-8" />
        <div>
          <h1 className="font-space font-bold text-xl tracking-tight">RiskLekha</h1>
          <p className="text-[10px] text-white/60 tracking-wider uppercase font-semibold">AICTE Decision Platform</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-md transition-colors duration-200 font-medium ${
                  isActive
                    ? 'bg-dark-navy text-risklekha-orange'
                    : 'text-white/80 hover:bg-dark-navy/50 hover:text-white'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4 border-t border-dark-navy/20">
        <div className="flex items-center gap-3 px-4 py-2">
          <div className="h-8 w-8 rounded-full bg-risklekha-orange flex items-center justify-center text-sm font-bold text-dark-navy">
            P
          </div>
          <div className="text-sm">
            <p className="font-semibold">Principal</p>
            <p className="text-xs text-white/60">Demo Institution</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
