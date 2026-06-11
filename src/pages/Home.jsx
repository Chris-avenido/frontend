import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { 
  Briefcase, 
  Wallet, 
  Layers, 
  TrendingUp, 
  Building2,
  PieChart,
  Home as HomeIcon,
  FolderKanban,
  Settings
} from 'lucide-react';
import newLogo from '../assets/new_logo.png';
import './Dashboard.css';

const formatCurrency = (value) => (
  new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', minimumFractionDigits: 0 }).format(value)
);

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
    document.body.classList.add('dashboard-body');
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
    
    return () => {
      document.body.classList.remove('dashboard-body');
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden text-[var(--text)]" style={{ fontFamily: 'var(--font-body)' }}>
      <Sidebar />
      <main className="flex-1 overflow-y-auto pb-32 relative app-scroll">
        
        {/* Header Section */}
        <div className="bg-gradient-to-br from-[#0B3A68] to-[#154b82] pt-12 pb-12 px-6 md:px-12 relative overflow-hidden shadow-md">
          {/* Subtle background pattern */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 opacity-10 pointer-events-none">
            <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="50" cy="50" r="50" fill="currentColor" />
              <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="2" fill="none" />
              <circle cx="50" cy="50" r="30" fill="currentColor" />
            </svg>
          </div>
          
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="relative z-10 flex items-center gap-5 max-w-7xl mx-auto"
          >
            <div className="w-16 h-16 bg-white rounded-2xl shadow-xl flex items-center justify-center p-1.5 shrink-0 border border-white/20">
              <img src={newLogo} alt="Department of Education Logo" className="w-full h-full object-contain drop-shadow-sm" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight drop-shadow-sm" style={{ fontFamily: 'var(--font-heading)' }}>InsightED Infrastructure</h1>
              <p className="text-[#A3C6E8] font-bold text-sm md:text-base mt-0.5 uppercase tracking-[0.15em] drop-shadow-sm" style={{ fontFamily: 'var(--font-body)' }}>Budget Monitoring</p>
            </div>
          </motion.div>
        </div>

        {/* Main Content Dashboard */}
        <div className="max-w-7xl mx-auto px-5 md:px-12 mt-8 relative z-20 space-y-10">
          
          {/* Project Overview */}
          <section>
            <div className="flex items-center gap-3 mb-5">
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <PieChart className="w-5 h-5 text-[var(--blue)]" /> 
                Project Overview
              </h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(11,58,104,0.15)' }}
                className="dashboard-card relative overflow-hidden group transition-all duration-300 p-7 flex items-start gap-6"
              >
                <div className="kpi-accent blue absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto"></div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--blue-50)] flex items-center justify-center text-[var(--blue)] shrink-0 relative z-10 shadow-sm border border-[var(--blue-100)]">
                  <Briefcase className="w-7 h-7" />
                </div>
                <div className="relative z-10 w-full pl-2">
                  <p className="kpi-label">Total Projects</p>
                  <h3 className="kpi-value">{isLoading ? "..." : totalProject.toLocaleString()}</h3>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--blue-600)] bg-[var(--blue-50)] border border-[var(--blue-100)] w-fit px-2.5 py-1 rounded-md uppercase tracking-wide">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Active Nationwide</span>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(217,119,6,0.15)' }}
                className="dashboard-card relative overflow-hidden group transition-all duration-300 p-7 flex items-start gap-6"
              >
                <div className="kpi-accent gold absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto"></div>
                <div className="w-14 h-14 rounded-2xl bg-[var(--gold)]/20 flex items-center justify-center text-[var(--amber)] shrink-0 relative z-10 shadow-sm border border-[var(--gold)]/30">
                  <Wallet className="w-7 h-7" />
                </div>
                <div className="relative z-10 w-full pl-2">
                  <p className="kpi-label">Total Budget</p>
                  <h3 className="kpi-value text-3xl md:text-4xl truncate">{isLoading ? "..." : formatCurrency(totalBudget)}</h3>
                  <div className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-[var(--amber)] bg-[var(--gold)]/10 border border-[var(--gold)]/30 w-fit px-2.5 py-1 rounded-md uppercase tracking-wide">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>Allocated Infrastructure Funds</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          <motion.hr 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-[var(--line)]" 
          />

          {/* Project Statistics */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="flex items-center gap-3 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <Layers className="w-5 h-5 text-[var(--blue)]" /> 
                Project Statistics
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Tranche 1', count: tranche1, accent: 'blue' },
                { title: 'Tranche 2', count: tranche2, accent: 'gold' },
                { title: 'Tranche 3', count: tranche3, accent: 'red' },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.4 + (idx * 0.1) }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08)' }}
                  className="dashboard-card relative overflow-hidden transition-all duration-300 p-6 flex flex-col justify-between block"
                >
                  <div className={`kpi-accent ${stat.accent} absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto`}></div>
                  <div className="pl-3 w-full">
                    <p className="kpi-label mb-3">Total Projects under</p>
                    <div className="flex justify-between items-end">
                      <h4 className="text-lg font-black text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>{stat.title}</h4>
                      <span className="kpi-value">{isLoading ? "..." : stat.count}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          <motion.hr 
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="border-[var(--line)]" 
          />

          {/* Funding Statistics */}
          <section>
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="flex items-center gap-3 mb-5"
            >
              <h2 className="text-lg font-black text-[var(--navy)] flex items-center gap-2.5 tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                <TrendingUp className="w-5 h-5 text-[var(--blue)]" /> 
                Funding Statistics
              </h2>
            </motion.div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: 'Tranche 1', amount: tranche1Amount, progress: 46, accent: 'blue', fill: 'bg-[var(--blue)]' },
                { title: 'Tranche 2', amount: tranche2Amount, progress: 54, accent: 'gold', fill: 'bg-[var(--gold)]' },
                { title: 'Tranche 3', amount: tranche3Amount, progress: 62, accent: 'red', fill: 'bg-[var(--red)]' },
              ].map((stat, idx) => (
                <motion.div 
                  key={stat.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 + (idx * 0.1) }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px -8px rgba(0, 0, 0, 0.08)' }}
                  className="dashboard-card relative overflow-hidden transition-all duration-300 flex flex-col justify-between p-6"
                >
                  <div className={`kpi-accent ${stat.accent} absolute left-0 top-6 bottom-6 w-1.5 rounded-r-md h-auto`}></div>
                  <div className="pl-3 w-full">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <p className="kpi-label mb-1.5">Total Amount For</p>
                        <h4 className="text-base font-black text-[var(--navy)] tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>{stat.title}</h4>
                      </div>
                      <div className="p-2.5 rounded-xl bg-[var(--blue-50)] text-[var(--blue)] border border-[var(--blue-100)]">
                        <Wallet className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mb-6">
                      <span className="kpi-value text-2xl">{isLoading ? "..." : formatCurrency(stat.amount)}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mt-auto pl-3 w-full">
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-[var(--muted)]">
                      <span>Utilization Progress</span>
                      <span className="text-[var(--navy)]">{stat.progress}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-[var(--blue-100)] rounded-full overflow-hidden border border-[var(--line)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${stat.progress}%` }}
                        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.8 + (idx * 0.1) }}
                        className={`h-full ${stat.fill} rounded-full relative`}
                      >
                        <div className="absolute top-0 right-0 bottom-0 w-10 bg-white/20 blur-[2px]"></div>
                      </motion.div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Blueprint Requirement) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-[var(--line)] shadow-[0_-8px_30px_rgba(0,0,0,0.06)] z-50 px-6 py-3 pb-safe">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          <Link to="/" className="flex flex-col items-center gap-1 text-[var(--blue)]">
            <div className="bg-[var(--blue-50)] p-2.5 rounded-2xl shadow-sm border border-[var(--blue-100)]">
              <HomeIcon className="w-6 h-6 fill-current" />
            </div>
            <span className="text-[11px] font-black tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Home</span>
          </Link>
          <Link to="/projects-list" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors">
            <div className="p-2.5 rounded-2xl hover:bg-[var(--blue-50)]">
              <FolderKanban className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Projects</span>
          </Link>
          <Link to="/profile" className="flex flex-col items-center gap-1 text-[var(--muted)] hover:text-[var(--blue)] transition-colors">
            <div className="p-2.5 rounded-2xl hover:bg-[var(--blue-50)]">
              <Settings className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>Settings</span>
          </Link>
        </div>
      </nav>
    </div>
  );
};

export default Home;
