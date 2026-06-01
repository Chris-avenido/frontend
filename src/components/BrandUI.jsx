import { motion } from 'framer-motion';
import newLogo from '../assets/new_logo.png';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.32, ease: 'easeOut' }
};

export const BrandLockup = ({ title = 'InsightED', subtitle, compact = false, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className={`${compact ? 'h-12 w-12' : 'h-16 w-16'} flex shrink-0 items-center justify-center rounded-[18px] border border-white/70 bg-white shadow-sm`}>
      <img src={newLogo} alt="InsightED logo" className="h-[86%] w-[86%] object-contain" />
    </div>
    <div className="min-w-0">
      <h1 className={`${compact ? 'text-xl' : 'text-2xl md:text-3xl'} font-extrabold leading-tight tracking-tight text-[var(--ink)]`}>
        {title}
      </h1>
      {subtitle && <p className="mt-1 text-sm font-semibold text-[var(--muted)]">{subtitle}</p>}
    </div>
  </div>
);

export const PageHeader = ({ title, subtitle, eyebrow, action, children }) => (
  <motion.header {...pageTransition} className="relative overflow-hidden border-b border-[var(--line)] bg-white/88">
    <div className="academic-grid absolute inset-0 opacity-60"></div>
    <div className="absolute right-8 top-6 h-28 w-28 rounded-full bg-[var(--brand-gold)]/14 blur-3xl"></div>
    <div className="relative mx-auto flex max-w-7xl flex-col gap-6 px-5 py-7 sm:px-7 lg:flex-row lg:items-center lg:justify-between lg:px-8">
      <div className="flex items-start gap-4">
        <BrandLockup compact title="InsightED" subtitle="Infrastructure Intelligence" />
        <div className="hidden h-14 w-px bg-[var(--line)] sm:block"></div>
        <div className="min-w-0 pt-1">
          {eyebrow && <p className="brand-kicker mb-2">{eyebrow}</p>}
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--ink)] md:text-4xl">{title}</h2>
          {subtitle && <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)] md:text-base">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
      {children}
    </div>
  </motion.header>
);

export const SectionTitle = ({ eyebrow, title, description }) => (
  <div className="mb-4">
    {eyebrow && <p className="brand-kicker mb-1">{eyebrow}</p>}
    <h2 className="text-lg font-extrabold tracking-tight text-[var(--ink)] md:text-xl">{title}</h2>
    {description && <p className="mt-1 text-sm font-medium text-[var(--muted)]">{description}</p>}
  </div>
);

export const MetricCard = ({ label, value, icon: Icon, tone = 'navy', caption, loading }) => {
  const toneMap = {
    navy: 'bg-[var(--brand-navy)] text-white',
    gold: 'bg-[var(--brand-gold)] text-[var(--brand-navy-deep)]',
    red: 'bg-[var(--brand-red)] text-white',
    soft: 'bg-[var(--brand-sky)] text-[var(--brand-navy)]'
  };

  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ duration: 0.18 }}
      className="brand-card brand-card-hover rounded-[var(--radius-lg)] p-5"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-[var(--muted)]">{label}</p>
          <p className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--ink)] md:text-4xl">
            {loading ? <span className="inline-block h-9 w-24 animate-pulse rounded-lg bg-slate-100"></span> : value}
          </p>
        </div>
        {Icon && (
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${toneMap[tone]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      {caption && <p className="mt-4 text-sm font-semibold text-[var(--muted)]">{caption}</p>}
    </motion.div>
  );
};

export const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse rounded-[var(--radius-lg)] border border-[var(--line)] bg-white/80 ${className}`} />
);

export const EmptyState = ({ icon: Icon, title, description }) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="brand-card flex flex-col items-center justify-center rounded-[var(--radius-lg)] px-6 py-16 text-center"
  >
    {Icon && (
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--brand-sky)] text-[var(--brand-navy)]">
        <Icon className="h-7 w-7" />
      </div>
    )}
    <h3 className="text-xl font-extrabold text-[var(--ink)]">{title}</h3>
    {description && <p className="mt-2 max-w-md text-sm font-medium text-[var(--muted)]">{description}</p>}
  </motion.div>
);
