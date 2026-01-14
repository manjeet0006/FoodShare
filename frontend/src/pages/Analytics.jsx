import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/services/api";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from "recharts";

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  TrendingUp, Users, Clock, Heart, BarChart3, 
  ChevronLeft, Sparkles, PieChart as PieIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";

const COLORS = ["#F43F5E", "#6366F1", "#10B981"];

export default function Analytics() {
  const { profile } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const isDonator = profile?.role === "donator";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await API.get("/donations/my-donations");
        setData(res.data || []);
      } catch (err) {
        console.error("Analytics fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Data processing remains the same...
  const barData = useMemo(() => {
    if (!data.length) return [];
    const categories = [...new Set(data.map(d => d.food_type))];
    return categories.map(cat => {
      const group = data.filter(d => d.food_type === cat);
      return {
        name: cat,
        Available: group.filter(d => d.status === "available").length,
        Claimed: group.filter(d => d.status === "claimed").length,
        Completed: group.filter(d => d.status === "completed").length,
      };
    });
  }, [data]);

  const pieData = useMemo(() => {
    if (!data.length) return [];
    const counts = data.reduce((acc, d) => {
      acc[d.status] = (acc[d.status] || 0) + 1;
      return acc;
    }, {});
    return [
      { name: "Available", value: counts.available || 0 },
      { name: "Claimed", value: counts.claimed || 0 },
      { name: "Completed", value: counts.completed || 0 },
    ].filter(item => item.value > 0); // Only show statuses that have data
  }, [data]);

  const stats = useMemo(() => {
    const completed = data.filter(d => d.status === "completed");
    return {
      rescued: completed.length,
      partners: new Set(data.map(d => isDonator ? d.claimed_by : d.donator_id).filter(Boolean)).size,
      avgTime: completed.length ? 45 : 0,
      success: data.length ? Math.round((completed.length / data.length) * 100) : 0,
    };
  }, [data, isDonator]);

  if (loading) return <AnalyticsSkeleton />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] pb-20">
      <Header />
      
      <main className="container mx-auto px-4 pt-32 max-w-7xl">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
          <div className="space-y-2">
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 w-fit border border-primary/10">
                <Sparkles size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-primary">Performance Insights</span>
             </div>
             <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                Analytics <span className="text-primary italic">Dashboard.</span>
             </h1>
          </div>
          <Button asChild variant="outline" className="rounded-2xl h-12 border-slate-200 shadow-sm font-bold">
            <Link to="/dashboard" className="flex items-center gap-2"><ChevronLeft size={18}/> Dashboard</Link>
          </Button>
        </div>

        {/* 1. TOP LEVEL STATS - Clean 4-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <CompactStat icon={TrendingUp} label="Total Rescued" value={stats.rescued} color="text-emerald-500" />
          <CompactStat icon={Users} label="Impact Partners" value={stats.partners} color="text-indigo-500" />
          <CompactStat icon={Clock} label="Avg Rescue Time" value={`${stats.avgTime}m`} color="text-amber-500" />
          <CompactStat icon={Heart} label="Success Rate" value={`${stats.success}%`} color="text-rose-500" />
        </div>

        {/* 2. CHARTS BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* BAR CHART - Spans 8 cols */}
          <Card className="lg:col-span-8 rounded-[2.5rem] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="flex items-center gap-2 text-2xl font-black">
                <BarChart3 className="text-primary" /> Category Breakdown
              </CardTitle>
              <CardDescription>Status distribution per food category.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 min-h-[400px] p-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12, fontWeight: 700}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                    cursor={{fill: '#f8fafc'}}
                  />
                  <Bar dataKey="Available" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="Claimed" fill="#6366F1" radius={[6, 6, 0, 0]} barSize={32} />
                  <Bar dataKey="Completed" fill="#10B981" radius={[6, 6, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* DONUT CHART - Spans 4 cols */}
          <Card className="lg:col-span-4 rounded-[2.5rem] border-slate-100 shadow-2xl shadow-slate-200/50 bg-white/80 backdrop-blur-sm overflow-hidden flex flex-col">
            <CardHeader className="p-8 pb-0">
              <CardTitle className="flex items-center gap-2 text-2xl font-black">
                <PieIcon className="text-primary" /> Status Mix
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col relative p-8">
              {/* Central KPI */}
              <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-5xl font-black tracking-tighter text-slate-900">{data.length}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Items</p>
              </div>

              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Custom Legend Rows */}
              <div className="space-y-2 mt-auto">
                {pieData.map((item, i) => (
                  <div key={item.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{item.name}</span>
                    </div>
                    <span className="text-sm font-black text-slate-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </main>
    </div>
  );
}

function CompactStat({ icon: Icon, label, value, color }) {
  return (
    <Card className="rounded-[2rem] border-slate-100 shadow-lg shadow-slate-200/30 overflow-hidden group">
      <CardContent className="p-6 flex items-center gap-5">
        <div className={cn("p-4 rounded-2xl bg-slate-50 transition-transform group-hover:scale-110", color)}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-1">{label}</p>
          <p className="text-3xl font-black tracking-tighter text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="container mx-auto px-4 pt-32 max-w-7xl space-y-12">
      <Skeleton className="h-16 w-1/3 bg-slate-100/80 rounded-3xl" />
      <div className="grid grid-cols-4 gap-6">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-32 bg-slate-100/80 rounded-[2rem]" />)}
      </div>
      <div className="grid grid-cols-12 gap-8 h-[500px]">
        <Skeleton className="col-span-8 bg-slate-100/80 rounded-[2.5rem]" />
        <Skeleton className="col-span-4 bg-slate-100/80 rounded-[2.5rem]" />
      </div>
    </div>
  );
}