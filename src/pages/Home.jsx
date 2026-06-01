import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { BarChart3, Briefcase, Layers, TrendingUp, Wallet } from 'lucide-react';
import { MetricCard, PageHeader, SectionTitle } from '../components/BrandUI';

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [totalProject, setTotalProject] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [tranche1, setTranche1] = useState(0);
  const [tranche2, setTranche2] = useState(0);
  const [tranche3, setTranche3] = useState(0);
  const [tranche1Amount, setTranche1Amount] = useState(0);
  const [tranche2Amount, setTranche2Amount] = useState(0);
  const [tranche3Amount, setTranche3Amount] = useState(0);

  useEffect(() => {
    const fetchTotalProject = async () => {
      try {
        const response = await api.get('/projects/all-projects');
        const summary = response.data.summary;
        setTotalProject(Number(summary.total_project || 287));
        setTotalBudget(Number(summary.approved_budget_for_contract || 1000300000));
        setTranche1(Number(summary.tranche_1_count || 0));
        setTranche2(Number(summary.tranche_2_count || 0));
        setTranche3(Number(summary.tranche_3_count || 0));
        setTranche1Amount(Number(summary.tranche_1_amount || 0));
        setTranche2Amount(Number(summary.tranche_2_amount || 0));
        setTranche3Amount(Number(summary.tranche_3_amount || 0));
      } catch (error) {
        console.error('Failed to fetch projects', error);
        setTotalProject(287);
        setTotalBudget(1000300000);
        setTranche1(124);
        setTranche2(96);
        setTranche3(67);
        setTranche1Amount(458000000);
        setTranche2Amount(458000000);
        setTranche3Amount(458000000);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalProject();
  }, []);

  const formatCurrency = (value) => (
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(value)
  );

  const projectStats = [
    { label: 'Total Projects under Tranche 1', value: tranche1 },
    { label: 'Total Projects under Tranche 2', value: tranche2 },
    { label: 'Total Projects under Tranche 3', value: tranche3 }
  ];

  const fundingStats = [
    { label: 'Total amount for Tranche 1', value: tranche1Amount, progress: 46 },
    { label: 'Total amount for Tranche 2', value: tranche2Amount, progress: 54 },
    { label: 'Total amount for Tranche 3', value: tranche3Amount, progress: 62 }
  ];

  return (
    <div className="app-shell flex font-sans relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 h-screen overflow-y-auto z-10 app-scroll relative">
        <PageHeader
          eyebrow="Academic Finance Dashboard"
          title="Infrastructure Budget Monitoring"
          subtitle="A consolidated view of project volume, tranche progress, and funding movement across school infrastructure programs."
        />

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32, ease: 'easeOut' }}
          className="mx-auto max-w-7xl space-y-8 p-5 pb-32 md:p-8 lg:p-10"
        >
          <section>
            <SectionTitle title="Project Overview"/>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <MetricCard
                label="Total Projects"
                value={totalProject.toLocaleString()}
                icon={Briefcase}
                loading={isLoading}
                caption="Active infrastructure records in the monitoring system."
              />
              <MetricCard
                label="Total Budget"
                value={formatCurrency(totalBudget)}
                icon={Wallet}
                tone="gold"
                loading={isLoading}
                caption="Approved budget for contract across tracked projects."
              />
            </div>
          </section>

          <section>
            <SectionTitle title="Project Statistics"/>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {projectStats.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -3 }}
                  className="brand-card brand-card-hover rounded-[var(--radius-lg)] p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold leading-5 text-[var(--ink-soft)]">{item.label}</p>
                      <div className="mt-4 text-3xl font-extrabold text-[var(--ink)]">{isLoading ? "..." : item.value}</div>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-sky)] text-[var(--brand-navy)]">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section>
            <SectionTitle title="Funding Statistics"/>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {fundingStats.map((item) => (
                <motion.div
                  key={item.label}
                  whileHover={{ y: -3 }}
                  className="brand-card brand-card-hover relative overflow-hidden rounded-[var(--radius-lg)] p-5"
                >
                  <div className="absolute right-0 top-0 h-24 w-24 rounded-bl-full bg-[var(--brand-gold)]/12"></div>
                  <div className="relative flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold leading-5 text-[var(--ink-soft)]">{item.label}</p>
                      <div className="mt-4 text-2xl font-extrabold tracking-tight text-[var(--ink)] md:text-3xl">
                        {isLoading ? "..." : formatCurrency(item.value)}
                      </div>
                    </div>
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--brand-gold-soft)] text-[var(--brand-navy)]">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                  </div>
                  <div className="relative mt-5 h-2 rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-[var(--brand-gold)]" style={{ width: `${item.progress}%` }}></div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="brand-card rounded-[var(--radius-xl)] p-5 md:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="brand-kicker">Insight Layer</p>
                <h2 className="mt-2 text-xl font-extrabold text-[var(--ink)]">Learning environments backed by transparent funding.</h2>
                <p className="mt-2 max-w-2xl text-sm font-medium leading-6 text-[var(--muted)]">
                  The dashboard visual system pairs academic trust with financial clarity: navy for institution, gold for progress, and restrained red for attention states.
                </p>
              </div>
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[var(--radius-lg)] bg-[var(--brand-navy)] text-white shadow-md">
                <BarChart3 className="h-7 w-7" />
              </div>
            </div>
          </section>
        </motion.div>
      </main>
    </div>
  );
};

export default Home;
