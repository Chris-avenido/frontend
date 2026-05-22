import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Sidebar from '../components/Sidebar';
import api from '../utils/api';
import { Briefcase, CreditCard, Wallet, Activity } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
  Legend
} from 'recharts';

const COLORS = ['#0ea5e9', '#f59e0b', '#f43f5e', '#8b5cf6'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-100">
        <p className="text-sm font-bold text-slate-800 mb-1">{label}</p>
        <p className="text-lg font-extrabold" style={{ color: payload[0].payload.fill || payload[0].color }}>
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const StatCard = ({ title, value, icon: Icon, color, delay, loading }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-between h-[140px] animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="h-4 bg-slate-200 rounded w-24"></div>
          <div className="w-10 h-10 bg-slate-200 rounded-xl"></div>
        </div>
        <div className="h-10 bg-slate-200 rounded w-32 mt-4"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ y: -6, scale: 1.02 }}
      className="relative overflow-hidden bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100/60 flex flex-col justify-between group min-h-[140px]"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color} opacity-10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-500 group-hover:scale-150`}></div>
      <div className="relative z-10 flex items-center justify-between mb-4 gap-3">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">{title}</h3>
        <div className={`p-2.5 rounded-xl bg-gradient-to-br ${color} text-white shadow-sm shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="relative z-10">
        <p className="text-[clamp(1.35rem,2vw,2.25rem)] font-extrabold text-slate-800 tracking-tight leading-tight break-words">
          {typeof value === 'number' && title.includes('Budget')
            ? new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(value)
            : value.toLocaleString()}
        </p>
      </div>
    </motion.div>
  );
};

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);

  const [totalProject, setTotalProject] = useState(0);
  const [totalBudget, setTotalBudget] = useState(0);
  const [tranche1, setTranche1] = useState(0);
  const [tranche2, setTranche2] = useState(0);
  const [tranche3, setTranche3] = useState(0);

  const trancheData = [
    { name: 'Tranche 1', value: tranche1 },
    { name: 'Tranche 2', value: tranche2 },
    { name: 'Tranche 3', value: tranche3 },
  ];

  const barData = [
    { name: 'Total Projects', value: totalProject },
    { name: 'T1 Disbursed', value: tranche1 },
    { name: 'T2 Disbursed', value: tranche2 },
    { name: 'T3 Disbursed', value: tranche3 },
  ];

  useEffect(() => {
    const fetchTotalProject = async () => {
      try {
        const response = await api.get('/projects/all-projects');
        const summary = response.data.summary;
        setTotalProject(Number(summary.total_project || 0));
        setTotalBudget(Number(summary.approved_budget_for_contract || 0));

        // Mock data logic for demonstration, replace with DB later
        setTranche1(10000);
        setTranche2(9000);
        setTranche3(8000);
      } catch (error) {
        console.error('Failed to fetch projects', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTotalProject();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans relative overflow-hidden">
      <Sidebar />
      <main className="flex-1 p-6 md:p-10 lg:p-12 pb-28 h-screen overflow-y-auto z-10 relative custom-scrollbar">

        {/* Subtle background blurs for depth */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/40 rounded-full blur-[100px] -z-10 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-amber-50/50 rounded-full blur-[80px] -z-10 pointer-events-none"></div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }}>
          <header className="mb-12">
            <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <h2 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#0B3A68] to-[#2563eb] tracking-tight mb-2">
                Command Center
              </h2>
              <p className="text-slate-500 font-medium text-base md:text-lg max-w-xl">
                Real-time oversight of Department of Education project disbursements and budget allocations.
              </p>
            </motion.div>
          </header>

          {/* STATS CARDS */}
          <div className="space-y-4 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <StatCard title="Total Budget" value={totalBudget} icon={Wallet} color="from-emerald-400 to-green-600" delay={0.1} loading={isLoading} />
              <StatCard title="Total Projects" value={totalProject} icon={Briefcase} color="from-sky-400 to-blue-600" delay={0.2} loading={isLoading} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Tranche 1" value={tranche1} icon={Activity} color="from-amber-400 to-orange-500" delay={0.3} loading={isLoading} />
              <StatCard title="Tranche 2" value={tranche2} icon={CreditCard} color="from-rose-400 to-red-600" delay={0.4} loading={isLoading} />
              <StatCard title="Tranche 3" value={tranche3} icon={Wallet} color="from-violet-400 to-purple-600" delay={0.5} loading={isLoading} />
            </div>
          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

            {/* BAR CHART */}
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-extrabold text-[#0B3A68] uppercase tracking-widest">
                  Disbursement Overview
                </h3>
                <span className="px-3 py-1 bg-blue-50 text-blue-600 text-xs font-bold rounded-full">FY 2026</span>
              </div>
              <div className="h-[350px]">
                {isLoading ? (
                  <div className="w-full h-full bg-slate-200/50 animate-pulse rounded-xl"></div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }} />
                      <Tooltip cursor={{ fill: '#f8fafc' }} content={<CustomTooltip />} />
                      <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={40}>
                        {barData.map((entry, index) => (
                          <Cell key={`cell-\${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </motion.div>

            {/* PIE CHART */}
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }}
              whileHover={{ y: -4 }}
              className="bg-white/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-sm font-extrabold text-[#0B3A68] uppercase tracking-widest">
                  Tranche Distribution
                </h3>
              </div>
              <div className="h-[350px] relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-48 h-48 bg-slate-200/50 animate-pulse rounded-full"></div>
                  </div>
                ) : (
                  <>
                    <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none z-0">
                      <span className="text-3xl font-extrabold text-slate-800">
                        {(tranche1 + tranche2 + tranche3).toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Released</span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%" className="relative z-10">
                      <PieChart>
                        <Pie
                          data={trancheData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={120}
                          paddingAngle={5}
                          stroke="none"
                        >
                          {trancheData.map((entry, index) => (
                            <Cell key={`cell-\${index}`} fill={COLORS[(index + 1) % COLORS.length]} className="hover:opacity-80 transition-opacity outline-none" />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 600, color: '#64748b' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </>
                )}
              </div>
            </motion.div>

          </div>
        </motion.div>
      </main>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
      `}} />
    </div>
  );
};

export default Home;
