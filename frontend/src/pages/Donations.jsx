import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DonationCard } from "@/components/DonationCard";
import { DonationMap } from "@/components/DonationMap"; // Ensure this import is correct

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Search, MapPin, Sparkles, LayoutGrid, Heart, TrendingUp, Users, Clock,
  Map as MapIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

const CATEGORIES = ["All", "Cooked Meals", "Bakery Items", "Fresh Produce", "Dairy", "Packaged Foods"];

export default function Donations() {
  const { toast } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // --- STATE ---
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [activeCategory, setActiveCategory] = useState("All");
  const [cities, setCities] = useState([]);

  // View & Location State
  const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
  const [userLocation, setUserLocation] = useState(null);

  // Stats State
  const [stats, setStats] = useState({
    totalRescued: 0,
    activeNGOs: 0,
    avgRescueTime: 0,
    impactScore: 0
  });

  const defaultStats = {
  totalRescued: 850,
  activeNGOs: 15,
  avgRescueTime: 45,
  impactScore: 92
};

  // --- 1. INITIAL DATA FETCH ---
  useEffect(() => {
    const initializePage = async () => {
      setLoading(true);
      fetchGlobalStats();

      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          try {
            const { data } = await API.get(`/donations/feed?lat=${latitude}&lng=${longitude}`);
            setDonations(data || []);
            extractCities(data);
          } catch (err) { console.error(err); }
          finally { setLoading(false); }
        },
        async (err) => {
          console.warn("GPS denied/error, fetching default feed.");
          try {
            // FIXED FALLBACK: No lat/lng variables exist in this scope
            const { data } = await API.get("/donations/feed");
            setDonations(data || []);
            extractCities(data);
          } catch (err) { console.error(err); }
          finally { setLoading(false); }
        },
        { enableHighAccuracy: true }
      );
    };

    initializePage();
  }, []);
  const extractCities = (data) => {
    if (!data) return;
    const uniqueCities = [...new Set(data.map((d) => d.city).filter(Boolean))];
    setCities(uniqueCities);
  };

  const fetchGlobalStats = async () => {
    try {
      const { data } = await API.get("/donations/stats/global");
      setStats({
        totalRescued: data.totalWeight || 0,
        activeNGOs: data.ngoCount || 0,
        avgRescueTime: data.avgMinutes || 0,
        impactScore: data.successRate || 0
      });
      console.log(data)


    } catch (error) {
      console.error("Stats fetch error:", error);
    }
  };


  const handleClaim = async (donationId) => {
    if (!user) return navigate("/login");
    try {
      await API.patch(`/donations/${donationId}/status`, { status: 'claimed' });
      toast({
        title: "Success! 🎉",
        description: "Donation claimed. Check your dashboard.",
        className: "bg-emerald-50 border-emerald-200 text-emerald-900"
      });
      const { data } = await API.get("/donations/feed");
      setDonations(data);
      fetchGlobalStats();
    } catch (error) {
      toast({
        title: "Claim Failed",
        description: error.response?.data?.message || "Could not process claim.",
        variant: "destructive",
      });
    }
  };

  const filteredDonations = useMemo(() => {
    const filtered = donations.filter((d) => {
      const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCity = cityFilter === "all" || d.city === cityFilter;
      const matchesCat = activeCategory === "All" || d.food_type === activeCategory;
      return matchesSearch && matchesCity && matchesCat;
    });

    if (userLocation) {
      // Sort by distance (nearest first)
      return filtered.sort((a, b) => a.distance - b.distance);
    }

    return filtered;
  }, [donations, searchTerm, cityFilter, activeCategory, userLocation]);

  return (
    <div className="min-h-screen pb-20 bg-[#FAFAFB] w-full overflow-x-hidden">
      <Header />

      <section className="py-8 px-4">
        <div className="container mx-auto max-w-7xl">
          <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] pt-12 pb-10 px-6 md:px-12 border border-slate-800 shadow-2xl">
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px]" />
            <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="max-w-2xl text-center lg:text-left">
                <Badge className="mb-6 bg-white/10 text-white border-white/20 px-4 py-1.5 backdrop-blur-md rounded-full">
                  <Sparkles className="h-3.5 w-3.5 mr-2 text-yellow-400" />
                  <span className="tracking-wide uppercase text-[10px] font-bold">Community Marketplace</span>
                </Badge>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight mb-6 leading-[0.9]">
                  RESCUE <span className="text-primary italic">FRESH</span> FOOD.
                </h1>
                <p className="text-xl text-slate-400 max-w-lg leading-relaxed font-medium mx-auto lg:mx-0">
                  Real-time surplus food directory connecting local donors with high-impact NGOs.
                </p>
              </div>
              <div className="hidden lg:grid grid-cols-2 gap-4">
                {/* <StatCard icon={TrendingUp} label="Total Rescued" value={stats.totalRescued > 1000 ? (stats.totalRescued / 1000).toFixed(1) : stats.totalRescued} sub={stats.totalRescued > 1000 ? "ton" : "kg"} />
                <StatCard icon={Users} label="Active NGOs" value={stats.activeNGOs} sub="orgs" />
                <StatCard icon={Clock} label="Avg Rescue" value={stats.avgRescueTime} sub="min" />
                <StatCard icon={Heart} label="Impact" value={stats.impactScore} sub="%" /> */}
                <StatCard icon={TrendingUp} label="Total Rescued" value={12} sub={stats.totalRescued > 1000 ? "ton" : "kg"} />
                <StatCard icon={Users} label="Active NGOs" value={5} sub="orgs" />
                <StatCard icon={Clock} label="Avg Rescue" value={45} sub="min" />
                <StatCard icon={Heart} label="Impact" value={89} sub="%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto px-4 -mt-16 relative z-20 pb-20 max-w-7xl">
        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 p-8 border border-white/60 backdrop-blur-md">
          <div className="flex flex-col lg:flex-row gap-6 items-end">
            <div className="flex-1 w-full space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Search Listing</label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input
                  placeholder="What are you looking for?"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-slate-50 border-none rounded-2xl text-lg font-medium focus-visible:ring-2 focus-visible:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <div className="w-full lg:w-72 space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary z-10" />
                <Select value={cityFilter} onValueChange={setCityFilter}>
                  <SelectTrigger className="h-14 pl-12 bg-slate-50 border-none rounded-2xl font-bold text-slate-700">
                    <SelectValue placeholder="All Cities" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                    <SelectItem value="all" className="font-bold">Everywhere</SelectItem>
                    {cities.map((city) => <SelectItem key={city} value={city} className="font-medium">{city}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-8 overflow-x-auto pb-2 scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={cn(
                  "px-6 py-2.5 rounded-xl text-sm font-bold transition-all shrink-0 border border-transparent",
                  activeCategory === cat ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-slate-50 text-slate-500 hover:bg-slate-100 hover:border-slate-200"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div className="space-y-1">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Recent Listings</h2>
              <p className="text-slate-500 font-medium text-lg">Real-time availability near you</p>
            </div>

            {/* VIEW TOGGLE BUTTONS */}
            <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              <button
                onClick={() => setViewMode("grid")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  viewMode === "grid" ? "bg-slate-900 text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <LayoutGrid className="h-4 w-4" /> Grid
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all",
                  viewMode === "map" ? "bg-primary text-white shadow-md" : "text-slate-500 hover:bg-slate-50"
                )}
              >
                <MapIcon className="h-4 w-4" /> Map
              </button>
            </div>
          </div>

          {/* RENDER LOGIC */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-96 rounded-[2.5rem] bg-slate-200/60" />)}
            </div>
          ) : viewMode === "map" ? (
            // MAP VIEW RENDER
            <div className="w-full h-[600px] rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl">
              <DonationMap donations={filteredDonations} userLocation={userLocation} />
            </div>
          ) : filteredDonations.length === 0 ? (
            <EmptyState />
          ) : (
            // GRID VIEW RENDER
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredDonations.map((donation) => (
                <DonationCard
                  key={donation._id}
                  donation={donation}
                  onClaim={handleClaim}
                  showClaimButton={profile?.role === "receiver"}
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
    <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 rounded-3xl w-40 hover:bg-white/10 transition-colors group">
      <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
        <Icon className="h-5 w-5 text-primary" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-xs font-bold text-slate-400 uppercase">{sub}</span>
      </div>
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{label}</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-32 bg-white rounded-[3rem] border-2 border-dashed border-slate-200 flex flex-col items-center justify-center">
      <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
        <Search className="h-8 w-8 text-slate-300" />
      </div>
      <h3 className="text-2xl font-black text-slate-800 tracking-tight uppercase">No Matches Found</h3>
      <p className="text-slate-400 font-medium mt-2">Try adjusting your filters or search term.</p>
    </div>
  );
}