import { useState } from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Home, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const navItems = [
  { name: 'Home', icon: Home, path: '/home' },
  { name: 'Projects', icon: FolderOpen, path: '/projects-list' },
  { name: 'Settings', icon: Settings, path: '/profile' },
];

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isVisible, setIsVisible] = useState(true);

  return (
    <>
      {/* Show/Hide Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`fixed right-4 z-50 flex items-center justify-center rounded-full bg-white p-2.5 text-[#0B3A68] border border-slate-200 shadow-lg transition-all duration-300 ease-in-out hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-[#0B3A68]/30 ${
          isVisible ? 'bottom-[100px]' : 'bottom-6'
        }`}
        aria-label={isVisible ? "Hide navigation" : "Show navigation"}
      >
        {isVisible ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
      </button>

      {/* Bottom Navigation Bar */}
      <motion.aside
        initial={false}
        animate={{ x: isVisible ? '0%' : '-100%' }}
        transition={{ type: "spring", stiffness: 250, damping: 28 }}
        className="fixed bottom-0 left-0 z-40 w-full border-t border-[var(--line)] bg-white/90 shadow-[0_-12px_34px_rgba(13,45,88,0.08)] backdrop-blur-xl"
      >
        <div className="mx-auto flex min-h-[84px] max-w-[1040px] flex-row items-center justify-center gap-2 px-2 py-3 sm:gap-3 sm:px-5">
          {navItems.map(({ name, icon: Icon, path }) => {
            const isActive = pathname === path;

            return (
              <button
                key={path}
                onClick={() => navigate(path)}
                className={`brand-focus flex h-14 min-w-0 flex-1 items-center justify-center gap-1.5 rounded-2xl border px-2 text-xs font-extrabold transition-all sm:max-w-[320px] sm:gap-2 sm:px-4 sm:text-base ${
                  isActive
                    ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white shadow-[0_10px_24px_rgba(13,45,88,0.24)]'
                    : 'border-[var(--line)] bg-[var(--surface-soft)] text-[var(--ink-soft)] hover:border-[var(--brand-gold)] hover:bg-white hover:text-[var(--brand-navy)]'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0 sm:h-5 sm:w-5" />
                <span className="truncate">{name}</span>
              </button>
            );
          })}
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
