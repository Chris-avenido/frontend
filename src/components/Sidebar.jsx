import React from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, Users, Settings, } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/home' },
  { name: 'Projects', icon: Users, path: '/projects-list' },
  { name: 'Settings', icon: Settings, path: '/profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 z-50 w-full h-20 bg-white border-t border-slate-200 shadow-md"
    >
      <div className="flex items-center justify-around h-full">
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path;

          return (
            <button key={path} onClick={() => navigate(path)} className="relative flex flex-col items-center gap-1">
              <Icon className={`w-6 h-6 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`text-[11px] font-semibold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>{name}</span>
              {isActive && (
                <span className="absolute -bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
              )}
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
};

export default Sidebar;