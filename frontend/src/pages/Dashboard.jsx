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

  const initiateCancel = (donation) => {
    if (profile?.role === "donator") {
      setPendingCancel(donation);
      setIsModalOpen(true); // Open Shadcn Modal for Donor
    } else {
      if (window.confirm("Return this item to the feed?")) {
        processCancellation(donation._id);
      }
    }
  };

  const processCancellation = async (donationId, reason = "") => {
    // Ensure we have the ID string, not the whole object
    const targetReceiverId = pendingCancel?.claimed_by?._id || pendingCancel?.claimed_by;

    try {
      // 1. Send Message with explicit keys
      await API.post("/messages", {
        receiverId: targetReceiverId,
        donationId: donationId,
        content: `⚠️ ORDER CANCELLED: The donor has cancelled the pickup for "${pendingCancel.title}". \nReason: ${reason}`
      });

      // 2. Update Status
      await API.patch(`/donations/${donationId}/cancel-claim`);

      // 3. UI Cleanup
      toast({ title: "Successfully Cancelled", description: "Receiver notified and item returned to feed." });
      setIsModalOpen(false);
      setCancelReason("");
      setPendingCancel(null);
      fetchDonations();

    } catch (error) {
      console.error("Cancellation Error:", error);
      toast({ title: "Error", description: "The process failed. Check console for details.", variant: "destructive" });
    }
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
    <div className="min-h-screen bg-[#FDFDFF] relative overflow-x-hidden w-full">
      {/* Background Blobs for Glassmorphism */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      {/* SHADCN MODAL FOR CANCELLATION REASON */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem] border-none shadow-2xl p-8">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight">Cancellation Reason</DialogTitle>
            <DialogDescription className="font-medium text-slate-500 mt-2">
              Explain why you are cancelling this pickup. This message will be sent to the receiver.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="e.g., Items no longer available or pickup logistics failed."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 p-4 font-medium"
            />
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)} className="rounded-xl font-bold">Go Back</Button>
            <Button
              disabled={!cancelReason.trim()}
              onClick={() => processCancellation(pendingCancel._id, cancelReason)}
              className="rounded-xl bg-rose-600 hover:bg-rose-700 font-bold px-6 text-white"
            >
              Confirm & Notify
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
            <Link to={profile?.role === "donator" ? "/donate" : "/donations"} className="flex items-center gap-2">
              {profile?.role === "donator" ? "Create New Donation" : "Browse Food Listings"}
              {profile?.role === "donator" ? <Plus className="h-5 w-5" /> : <Search className="h-5 w-5" />}
            </Link>
          </Button>
        </motion.div>

        {/* STATS STRIP */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-16">
          {stats.map((s) => (
            <motion.div key={s.label} variants={itemVariants} className={cn("bg-white/80 backdrop-blur-md border rounded-[2.5rem] p-8 shadow-2xl", s.glow)}>
              <div className="flex items-center gap-4 mb-6">
                <div className={cn("p-3.5 rounded-2xl bg-white shadow-inner", s.color)}><s.icon className="h-6 w-6" /></div>
                <span className="text-xs font-black uppercase text-slate-400">{s.label}</span>
              </div>
              <div className="text-5xl font-black text-slate-900 tracking-tighter">{s.count}</div>
            </motion.div>
          ))}
        </motion.div>

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

            <div className="min-h-[450px] relative">
              <AnimatePresence mode="wait">
                {loadingDonations ? <DashboardSkeleton /> : (
                  <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>

                    <TabsContent value="active" className="m-0 focus-visible:outline-none">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {available.length === 0 ? <div className="col-span-full"><EmptyState icon={Inbox} text="No active items found." /></div> :
                          available.map(d => (
                            <div key={d._id} className="group text-red-600 relative">
                              <DonationCard donation={d} />
                              <Button
                                variant="destructive" size="icon"
                                className="absolute top-2 right-2  group-hover:opacity-100 text-red-400 transition-opacity rounded-full shadow-lg"
                                onClick={() => handleDeleteDonation(d._id)}
                              >
                                <Trash2 className="h-4  w-4" />
                              </Button>
                            </div>
                          ))}
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