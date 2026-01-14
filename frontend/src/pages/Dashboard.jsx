import { useEffect, useState, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { DonationCard } from "@/components/DonationCard";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Plus, Package, CheckCircle, Clock, Search,
  Inbox, Sparkles, Trash2, RotateCcw, XCircle, User
} from "lucide-react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

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

export default function Dashboard() {
  const { user, profile, loading } = useAuth();
  const [donations, setDonations] = useState([]);
  const [loadingDonations, setLoadingDonations] = useState(true);
  const { toast } = useToast();

  // --- STATE FOR CANCELLATION MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [pendingCancel, setPendingCancel] = useState(null);

  const [activeTab, setActiveTab] = useState(profile?.role === "donator" ? "active" : "claimed");

  // --- DATA FETCHING & POLLING ---
  const fetchDonations = async () => {
    try {
      // Fetching actual data from MongoDB backend
      const { data } = await API.get("/donations/my-donations");
      console.log(data);
      setDonations(data || []);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setLoadingDonations(false);
    }
  };

  useEffect(() => {
    if (profile) {
      setActiveTab(profile.role === "donator" ? "active" : "claimed");
      fetchDonations();

      // Automatic polling every 5 seconds to keep data fresh without refreshing
      const interval = setInterval(() => fetchDonations(), 5000);
      return () => clearInterval(interval);
    }
  }, [profile]);

  // --- ACTION HANDLERS ---
  const handleMarkComplete = async (donationId) => {
    try {
      await API.patch(`/donations/${donationId}/status`, { status: "completed" });
      toast({ title: "Rescue Successful!", description: "Moved to history.", className: "bg-green-50 text-green-800 border-green-200" });
      fetchDonations();
    } catch (error) {
      toast({ title: "Error", description: "Status update failed.", variant: "destructive" });
    }
  };

  const processCancellation = async (donationId, reason = "") => {
    // Use the local 'donationId' and find the correct target from the actual donation object
    // If pendingCancel is null (Receiver flow), we need to find the donation in our local state list
    const activeDonation = pendingCancel || donations.find(d => d._id === donationId);

    // Logic: If I am the donor, the receiver is the target. If I am the receiver, the donor is the target.
    const targetId = profile?.role === "donator"
      ? (activeDonation?.claimed_by?._id || activeDonation?.claimed_by)
      : (activeDonation?.donator_id?._id || activeDonation?.donator_id);

    if (!targetId) {
      toast({ title: "Error", description: "Recipient not found. Cannot send notification.", variant: "destructive" });
      return;
    }

    try {
      // 1. Send Message
      await API.post("/messages", {
        receiver_id: targetId,
        donation_id: donationId,
        content: profile?.role === "donator"
          ? `⚠️ ORDER CANCELLED: The donor has cancelled the pickup for "${activeDonation.title}". Reason: ${reason}`
          : `👋 CLAIM RELEASED: The receiver has released their claim on "${activeDonation.title}". It is back in the feed.`
      });

      // 2. Update Status
      await API.patch(`/donations/${donationId}/cancel-claim`);

      // 3. UI Cleanup
      toast({ title: "Success", description: "Action processed and party notified." });
      setIsModalOpen(false);
      setCancelReason("");
      setPendingCancel(null);
      fetchDonations(); // Refresh the list

    } catch (error) {
      console.error("Cancellation Error:", error?.response?.data || error);
      toast({
        title: "Action Failed",
        description: error?.response?.data?.message || "Check network connection.",
        variant: "destructive"
      });
    }
  };

  // Open cancellation modal and set the pending donation
  const initiateCancel = (donation) => {
    setPendingCancel(donation);
    setIsModalOpen(true);
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Permanently delete this listing?")) return;
    try {
      await API.delete(`/donations/${donationId}`);
      toast({ title: "Deleted", description: "Donation removed." });
      fetchDonations();
    } catch (error) {
      toast({ title: "Error", description: "Delete failed.", variant: "destructive" });
    }
  };

  // --- MEMOIZED DATA & STATS ---
  const { available, claimed, completed } = useMemo(() => ({
    available: donations.filter((d) => d.status === "available"),
    claimed: donations.filter((d) => d.status === "claimed"),
    completed: donations.filter((d) => d.status === "completed"),
  }), [donations]);

  const stats = useMemo(() => {
    const baseStats = [
      { label: "Claimed", count: claimed.length, icon: Clock, color: "text-orange-500", glow: "shadow-orange-200/50" },
      { label: "History", count: completed.length, icon: CheckCircle, color: "text-green-500", glow: "shadow-green-200/50" },
    ];
    if (profile?.role === "donator") {
      return [{ label: "Active", count: available.length, icon: Package, color: "text-primary", glow: "shadow-indigo-200/50" }, ...baseStats];
    }
    return baseStats;
  }, [profile, available, claimed, completed]);

  if (loading) return <DashboardSkeleton />;
  if (!user) return <Navigate to="/login" />;

  return (
    <div className="min-h-screen pb-10 bg-[#FDFDFF] relative overflow-x-hidden w-full">
      {/* Background Blobs for Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      {/* SHADCN MODAL FOR CANCELLATION REASON */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-106.2 rounded-4xl border-white/10 bg-slate-900/90 backdrop-blur-2xl text-white shadow-2xl">
          <DialogHeader className="space-y-3">
            <div className="h-12 w-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 mb-2">
              <AlertCircle size={24} />
            </div>
            <DialogTitle className="text-2xl font-black tracking-tight leading-none uppercase">
              Cancel <span className="text-rose-500">Pickup?</span>
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium">
              This will notify the NGO and return <span className="text-white font-bold">"{pendingCancel?.title}"</span> back to the public feed.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reason for cancellation</label>
              <textarea
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm focus:ring-1 focus:ring-rose-500 outline-none transition-all placeholder:text-slate-600"
                placeholder="e.g., Change in store hours, items no longer safe..."
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              onClick={() => setIsModalOpen(false)}
              className="rounded-full font-bold uppercase text-[10px] tracking-widest text-slate-400 hover:text-white"
            >
              Keep Order
            </Button>
            <Button
              onClick={() => processCancellation(pendingCancel?._id, cancelReason)}
              className="rounded-full bg-rose-600 hover:bg-rose-700 font-black uppercase text-[10px] tracking-widest px-8 shadow-lg shadow-rose-900/20"
            >
              Confirm Cancellation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <motion.main className="container mx-auto px-4 py-12 max-w-6xl relative z-10" variants={containerVariants} initial="hidden" animate="show">
        {/* WELCOME SECTION */}
        <motion.div variants={itemVariants} className="mt-8 mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 border border-slate-100 w-fit shadow-sm mb-4">
              <Sparkles className="h-3 w-3 text-primary animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Impact Summary</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-slate-900 leading-none">
              Welcome, <span className="text-primary">{profile?.organizationName || profile?.fullName || "User"}</span>
            </h1>
            <p className="text-slate-500 font-medium text-lg">Manage your donations and community impact.</p>
          </div>
          <Button asChild className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 border-none font-bold transition-all hover:scale-105">
            <Link to={profile?.role === "donator" ? "/donate" : "/"} className="flex items-center gap-2">
              {profile?.role === "donator" ? "Create New Donation" : "Browse Food Listings"}
              {profile?.role === "donator" ? <Plus className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Link>
          </Button>
        </motion.div>

        {/* STATS STRIP */}
        {/* WRAPPER: Constrains the total width and centers the stats */}
        <div className="flex justify-center w-full mb-10">
          <motion.div
            variants={containerVariants}
            className="grid grid-cols-1  sm:grid-cols-3 gap-10  w-full max-w-3xl" // Restricted width and tighter gap
          >
            {stats.map((s) => (
              <motion.div
                key={s.label}
                variants={itemVariants}
                className={cn(
                  "relative group overflow-hidden backdrop-blur-md border  rounded-2xl p-3 transition-all duration-300 hover:border-primary/50  shadow-xl",
                  s.glow
                )}
              >
                {/* Ghost Icon - Fills the background to prevent "blankness" */}
                <s.icon className="absolute -right-1 -bottom-1 h-12 w-12 text-white/5 -rotate-12 group-hover:text-primary/10 transition-colors" />

                <div className="flex p-2 items-center gap-7 relative z-10">
                  {/* Icon - Smaller and sharper */}
                  <div className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center border border-white/5 shadow-inner",
                    s.color
                  )}>
                    <s.icon className="h-7 w-7" />
                  </div>

                  <div className="flex flex-col min-w-0">
                    {/* Label - Ultra-compact */}
                    <span className="text-[8px] font-black uppercase tracking-[0.15em] text-slate-500 leading-none mb-1">
                      {s.label}
                    </span>

                    {/* Value - Strong but not oversized */}
                    <div className="flex items-center gap-1.5">
                      <span className="text-xl font-black text-black tracking-tighter leading-none">
                        {s.count}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600 uppercase">
                        {s.unit || ""}
                      </span>
                      <div className="h-1 w-1 rounded-full bg-primary animate-pulse ml-auto" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* WORKSPACE */}
        <motion.div variants={itemVariants} className="space-y-8 mt-16">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="bg-primary/5 p-1.5 h-14 rounded-2xl border border-primary/10">
                {profile?.role === "donator" && <TabsTrigger value="active" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-primary font-bold">Active</TabsTrigger>}
                <TabsTrigger value="claimed" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-primary font-bold">Claimed</TabsTrigger>
                <TabsTrigger value="completed" className="rounded-xl px-10 h-full data-[state=active]:bg-white data-[state=active]:text-primary font-bold">History</TabsTrigger>
              </TabsList>
            </div>

            <div className="min-h-112.5 relative">
              <AnimatePresence mode="wait">
                {loadingDonations ? <DashboardSkeleton /> : (
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                    <TabsContent value="active" className="m-0 focus-visible:outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {available.length === 0 ? (
                          <div className="col-span-full">
                            <EmptyState icon={Inbox} text="No active items found." />
                          </div>
                        ) : (
                          available.map((d) => (
                            <motion.div
                              key={d._id}
                              layout
                              className="group relative" // "group" allows children to react to hover
                            >
                              {/* 1. Main Donation Card */}
                              <DonationCard donation={d} />

                              {/* 2. Overlaid "Live" Tag (Top-Left) */}
                              <div className="absolute top-3 left-3 z-10">
                                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/90 backdrop-blur-md border border-emerald-400/50 shadow-sm">
                                  <div className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                                  <span className="text-[10px] font-black uppercase tracking-widest text-white">
                                    Live
                                  </span>
                                </div>
                              </div>

                              {/* 3. Floating Trash Action (Top-Right) */}
                              <div className="absolute top-3 right-3 z-20">
                                <Button
                                  variant="destructive"
                                  size="icon"
                                  className={cn(
                                    "h-9 w-9 rounded-xl shadow-2xl transition-all duration-300",
                                    "bg-rose-500/90 hover:bg-rose-600 backdrop-blur-md border border-rose-400/50",
                                    "opacity-0 translate-y-2.5 group-hover:opacity-100 group-hover:translate-y-0"
                                  )}
                                  onClick={(e) => {
                                    e.stopPropagation(); // Prevents the card from expanding when clicking delete
                                    handleDeleteDonation(d._id);
                                  }}
                                >
                                  <Trash2 className="h-4 w-4 text-white" />
                                </Button>
                              </div>
                            </motion.div>
                          ))
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="claimed" className="m-0 focus-visible:outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {claimed.length === 0 ? <div className="col-span-full"><EmptyState icon={Inbox} text="No claimed items found." /></div> :
                          claimed.map(d => (
                            <div key={d._id} className="flex flex-col gap-4">
                              {/* Internal confirm button handled by DonationCard */}
                              <DonationCard donation={d} showMessageButton onClaim={() => handleMarkComplete(d._id)} />

                              <div className="px-2 flex gap-2">
                                {profile?.role === "donator" && (
                                  <>
                                    <Button
                                      variant="outline"
                                      onClick={() => initiateCancel(d)}
                                      className="flex-1 h-12 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600 transition-all"
                                    >
                                      <XCircle className="w-4 h-4 mr-2" /> Cancel Pickup
                                    </Button>
                                    <Button variant="destructive" size="icon" onClick={() => handleDeleteDonation(d._id)} className="h-12 w-12 rounded-2xl"><Trash2 size={20} /></Button>
                                  </>
                                )}
                                {profile?.role === "receiver" && (
                                  <Button variant="outline" onClick={() => initiateCancel(d)} className="w-full h-12 rounded-2xl border-slate-200 text-slate-500 font-bold hover:bg-rose-50 hover:text-rose-600">
                                    <XCircle className="w-4 h-4 mr-2" /> Cannot Pickup
                                  </Button>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="completed" className="m-0 focus-visible:outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {completed.map(d => <DonationCard key={d._id} donation={d} />)}
                      </div>
                    </TabsContent>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Tabs>
        </motion.div>
      </motion.main>
    </div>
  );
}

// --- HELPERS ---
function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 bg-white/40 backdrop-blur-sm rounded-[3rem] border-2 border-dashed border-primary/10 w-full">
      <Icon className="h-10 w-10 text-primary/20 mb-6" />
      <p className="text-slate-400 font-bold text-xl">{text}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-72 w-full rounded-[2.5rem] bg-slate-100/80" />)}
      </div>
    </div>
  );
}