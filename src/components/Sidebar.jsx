import { motion } from 'framer-motion';
import { FolderOpen, Home, Settings, } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', icon: Home, path: '/home' },
  { name: 'Projects', icon: FolderOpen, path: '/projects-list' },
  { name: 'Settings', icon: Settings, path: '/profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <motion.aside
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed bottom-0 left-0 z-50 w-full border-t border-[var(--line)] bg-white/90 shadow-[0_-12px_34px_rgba(13,45,88,0.08)] backdrop-blur-xl"
    >
      <div className="mx-auto flex h-[84px] max-w-[1040px] items-center justify-center gap-2 px-3 sm:gap-3 sm:px-5">
        {navItems.map(({ name, icon: Icon, path }) => {
          const isActive = pathname === path;

          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`brand-focus flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl border text-sm font-extrabold transition-all sm:max-w-[320px] sm:text-base ${
                isActive
                  ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white shadow-[0_10px_24px_rgba(13,45,88,0.24)]'
                  : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-soft)] hover:border-[var(--brand-gold)] hover:bg-white hover:text-[var(--brand-navy)]'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="hidden sm:inline">{name}</span>
            </button>
          );
        })}
      </div>
    </motion.aside>
  );
};

export default Sidebar;
