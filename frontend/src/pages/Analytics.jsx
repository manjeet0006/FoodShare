import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/services/api";
import { cn } from "@/lib/utils";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
  BarChart, Bar // Added BarChart components
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, Clock, PieChart as PieIcon, Sparkles, Users, Heart, BarChart3 
} from "lucide-react";

// --- ANIMATION VARIANTS ---
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 120, damping: 20 } }
};

const blobVariants = {
  animate: (i) => ({
    x: [0, 40, -20, 0],
    y: [0, -50, 30, 0],
    scale: [1, 1.1, 0.95, 1],
    transition: { duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" },
  }),
};

const COLORS = ['#F43F5E', '#6366F1', '#10B981']; // Rose, Indigo, Emerald

export default function Analytics() {
  const { profile } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const isDonator = profile?.role === "donator";

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        const { data } = await API.get("/donations/my-donations");
        setData(data || []);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchAnalyticsData();
  }, []);

  // --- DATA TRANSFORMATIONS ---

  const stackedBarData = useMemo(() => {
    const categories = [...new Set(data.map(d => d.food_type))];
    return categories.map(cat => {
      const group = data.filter(d => d.food_type === cat);
      return {
        name: cat,
        Available: group.filter(d => d.status === 'available').length,
        Claimed: group.filter(d => d.status === 'claimed').length,
        Completed: group.filter(d => d.status === 'completed').length,
      };
    });
  }, [data]);

  const pieChartData = useMemo(() => {
    const counts = data.reduce((acc, d) => { acc[d.status] = (acc[d.status] || 0) + 1; return acc; }, {});
    return [
      { name: 'Available', value: counts.available || 0 },
      { name: 'Claimed', value: counts.claimed || 0 },
      { name: 'Completed', value: counts.completed || 0 },
    ].filter(v => v.value > 0);
  }, [data]);

  const areaChartData = useMemo(() => {
    const daily = data.reduce((acc, d) => {
      const date = new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(daily).map(([name, total]) => ({ name, total }));
  }, [data]);

  const stats = useMemo(() => {
    if (!data.length) return { weight: 0, partners: 0, time: 0, success: 0 };
    const completed = data.filter(d => d.status === "completed");
    const weight = completed.reduce((sum, d) => sum + (parseFloat(d.quantity) || 0), 0);
    const partners = new Set(data.map(d => isDonator ? d.claimed_by : d.donator_id).filter(Boolean)).size;
    const time = completed.length ? Math.round(completed.reduce((sum, d) => sum + (new Date(d.updatedAt) - new Date(d.createdAt)) / 60000, 0) / completed.length) : 0;
    const success = Math.round((completed.length / data.length) * 100);
    return { weight, partners, time, success };
  }, [data, isDonator]);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] relative overflow-x-hidden w-full">
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />
      
      <motion.main variants={containerVariants} initial="hidden" animate="show" className="container mx-auto px-4 py-12 max-w-6xl relative z-10 space-y-12">
        
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8">
          <motion.div variants={itemVariants} className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-100 w-fit shadow-sm">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Database Insights</span>
            </div>
            <h1 className="text-5xl font-black text-slate-900 tracking-tight leading-none">
              Analytics <span className="text-primary">Hub.</span>
            </h1>
          </motion.div>
          <Button asChild className="h-12 px-6 rounded-2xl bg-slate-900 text-white font-bold hover:scale-105 transition-all">
            <Link to="/dashboard">Back to Workspace</Link>
          </Button>
        </div>

        {/* STATS */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <SmallStat icon={TrendingUp} label="Total Rescued" value={stats.weight} sub="kg" color="text-rose-500" />
          <SmallStat icon={Users} label="Partners" value={stats.partners} sub="orgs" color="text-indigo-500" />
          <SmallStat icon={Clock} label="Avg. Speed" value={stats.time} sub="min" color="text-slate-600" />
          <SmallStat icon={Heart} label="Efficiency" value={stats.success} sub="%" color="text-emerald-500" />
        </motion.div>

        {/* CHARTS TOP ROW */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* AREA CHART */}
          <Card className="lg:col-span-3 rounded-[3rem] border border-white/50 shadow-2xl bg-white/60 backdrop-blur-2xl p-8 overflow-hidden">
            <CardHeader className="p-0 mb-8"><CardTitle className="text-xl font-black flex items-center gap-2 text-slate-900"><TrendingUp className="text-rose-500" /> Activity Trends</CardTitle></CardHeader>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={areaChartData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3}/><stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/></linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 10, fontWeight: 700}} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="total" stroke="#F43F5E" strokeWidth={3} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* PIE CHART */}
          <Card className="lg:col-span-1 rounded-[3rem] border border-white/50 shadow-2xl bg-white/60 backdrop-blur-2xl p-6 flex flex-col items-center">
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none translate-y-[-5%]">
                <span className="text-3xl font-black text-slate-900">{data.length}</span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
             </div>
             <CardHeader className="p-0 mb-4 text-center"><CardTitle className="text-sm font-black uppercase tracking-widest text-slate-400">Status</CardTitle></CardHeader>
             <div className="h-64 w-full">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie data={pieChartData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={8} cornerRadius={10} dataKey="value" stroke="none">
                     {pieChartData.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                   </Pie>
                   <Tooltip content={<CustomTooltip />} />
                 </PieChart>
               </ResponsiveContainer>
             </div>
          </Card>
        </div>

        {/* CHARTS BOTTOM ROW: STACKED BAR CHART */}
        <motion.div variants={itemVariants}>
          <Card className="rounded-[3rem] border border-white/50 shadow-2xl bg-white/60 backdrop-blur-2xl p-8">
            <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-black flex items-center gap-2 text-slate-900">
                <BarChart3 className="text-indigo-500" /> Category Performance
              </CardTitle>
              <div className="flex gap-4 text-[10px] font-bold uppercase tracking-widest">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#F43F5E]"/> Available</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#6366F1]"/> Claimed</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#10B981]"/> Completed</div>
              </div>
            </CardHeader>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stackedBarData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11, fontWeight: 700}} />
                  <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                  <Bar dataKey="Available" stackId="a" fill="#F43F5E" radius={[0, 0, 0, 0]} barSize={40} />
                  <Bar dataKey="Claimed" stackId="a" fill="#6366F1" radius={[0, 0, 0, 0]} barSize={40} />
                  <Bar dataKey="Completed" stackId="a" fill="#10B981" radius={[10, 10, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

      </motion.main>
    </div>
  );
}

// --- SUBCOMPONENTS ---

function SmallStat({ icon: Icon, label, value, sub, color }) {
  return (
    <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md border border-white/50 rounded-[2.5rem] p-7 shadow-2xl">
      <div className="flex items-center gap-4 mb-4">
        <div className={cn("p-3 rounded-2xl bg-white shadow-inner", color)}><Icon size={20} /></div>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-4xl font-black text-slate-900 tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase">{sub}</span>
      </div>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-2xl">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm font-bold" style={{ color: entry.color || entry.fill }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto px-4 py-20 space-y-12">
      <Skeleton className="h-16 w-64 rounded-xl bg-slate-100" />
      <div className="grid grid-cols-4 gap-4">{[1,2,3,4].map(i => <Skeleton key={i} className="h-32 rounded-[2.5rem] bg-slate-100" />)}</div>
      <Skeleton className="h-96 rounded-[3rem] bg-slate-100" />
    </div>
  );
}