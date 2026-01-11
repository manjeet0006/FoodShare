import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { DonationCard } from "@/components/DonationCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Search, MapPin, Sparkles, LayoutGrid, Heart, TrendingUp, Users, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Cooked Meals", "Bakery Items", "Fresh Produce", "Dairy", "Packaged Foods"];

export default function Donations() {
  const { toast } = useToast();
  const { user } = useAuth();

  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cities, setCities] = useState([]);

  // New State for Dynamic Hero Stats
  const [stats, setStats] = useState({
    totalRescued: 0,
    activeNGOs: 0,
    avgRescueTime: 0,
    impactScore: 0
  });

  useEffect(() => {
    fetchDonations();
    fetchGlobalStats(); // Fetch the "How this project helps" data
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const { data } = await API.get("/donations/feed");
      setDonations(data || []);
      setCities([...new Set(data?.map((d) => d.city) || [])]);
    } catch (error) {
      console.error("Error fetching donations:", error);
    } finally {
      setLoading(false);
    }
  };

  // NEW: Fetch actual impact data from database
  const fetchGlobalStats = async () => {
    try {
      // This endpoint should return aggregate data from your MongoDB
      const { data } = await API.get("/donations/stats/global");
      setStats({
        totalRescued: data.totalWeight || 0,
        activeNGOs: data.ngoCount || 0,
        avgRescueTime: data.avgMinutes || 0,
        impactScore: data.successRate || 0
      });
    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };

  const handleClaim = async (donationId) => {
    try {
      await API.patch(`/donations/${donationId}/status`, { status: 'claimed' });
      toast({
        title: "Success!",
        description: "You have claimed this donation. Check your messages to coordinate pickup.",
        className: "bg-emerald-50 border-emerald-200"
      });
      fetchDonations();
      fetchGlobalStats(); // Update stats as someone claims food
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to claim",
        variant: "destructive",
      });
    }
  };

  const filteredDonations = useMemo(() => {
    return donations.filter((d) => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === "all" || d.city === cityFilter;
      const matchesCat = activeCategory === "All" || d.food_type === activeCategory;
      return matchesSearch && matchesCity && matchesCat;
    });
  }, [donations, searchTerm, cityFilter, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAFB] w-full overflow-x-hidden">
      <Header />

      {/* 1. HERO SECTION */}
      <section className="py-8 px-4"> {/* Exterior spacing */}
        <div className="container mx-auto">
          {/* This main div now controls the width and background */}
          <div className="relative overflow-hidden bg-slate-900 rounded-3xl pt-12 pb-10 px-6 md:px-12 border border-slate-800">

            {/* Decorative Blur - constrained to the rounded box */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[100px]" />

            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-center md:text-left">
                <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5 backdrop-blur-md">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-yellow-400" />
                  <span className="tracking-wide uppercase text-[10px] font-bold">Community Marketplace</span>
                </Badge>

                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.9]">
                  RESCUE <span className="text-primary italic">FRESH</span> FOOD.
                </h1>

                <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium">
                  Real-time surplus food directory connecting local donors with high-impact NGOs.
                </p>
              </div>

              {/* DYNAMIC STATS */}
              <div className="hidden lg:grid grid-cols-2 gap-4">
                <StatCard
                  icon={TrendingUp}
                  label="Total Rescued"
                  value={stats.totalRescued > 1000 ? (stats.totalRescued / 1000).toFixed(1) : stats.totalRescued}
                  sub={stats.totalRescued > 1000 ? "ton" : "kg"}
                />
                <StatCard
                  icon={Users}
                  label="Active NGOs"
                  value={stats.activeNGOs}
                  sub="orgs"
                />
                <StatCard
                  icon={Clock}
                  label="Avg Rescue"
                  value={stats.avgRescueTime}
                  sub="min"
                />
                <StatCard
                  icon={Heart}
                  label="Impact"
                  value={stats.impactScore}
                  sub="%"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SEARCH & FILTERS (Command Center) */}
      <main className="container mx-auto px-4 -mt-16 relative z-20 pb-20">
        <div className="bg-white rounded-4xl shadow-xl p-8 border border-white/60 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Search Listing</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <Input
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-slate-50 border-none rounded-2xl text-lg focus-visible:ring-primary/20"
                />
              </div>
            </div>

            <div className="w-full lg:w-72 space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10" />
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="h-14 pl-12 bg-slate-50 border-none rounded-2xl">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="all">Everywhere</SelectItem>
                    {cities.map((city) => <SelectItem key={city} value={city}>{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 overflow-x-auto pb-2 no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0",
                  activeCategory === cat ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* 3. GRID CONTENT */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Recent Listings</h2>
              <p className="text-slate-500 font-medium">Real-time availability in your area</p>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {[1, 2, 3].map((i) => <div key={i} className="h-96 bg-slate-200 animate-pulse rounded-4xl" />)}
            </div>
          ) : filteredDonations.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {filteredDonations.map((donation) => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  onClaim={handleClaim}
                  showClaimButton={user?.role === "receiver"}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl w-40 hover:bg-white/10 transition-colors">
      <Icon className="h-5 w-5 text-primary mb-3" />
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-slate-500 uppercase">{sub}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
      <Search className="h-10 w-10 text-slate-300 mx-auto mb-6" />
      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">No Matches Found</h3>
    </div>
  );
}