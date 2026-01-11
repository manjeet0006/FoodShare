import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import API from "@/services/api"; // MERN: Custom Axios instance
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { 
  Loader2, Save, User, Phone, MapPin, 
  ShieldCheck, Sparkles 
} from "lucide-react";

// ANIMATION VARIANTS
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.42, 0, 0.58, 1] }
  },
};

export default function Settings() {
  const { user, loading: authLoading } = useAuth(); // MERN: 'user' is the MongoDB object
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) navigate("/login");
  }, [user, authLoading, navigate]);

  // Sync state with authenticated user data
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setOrganizationName(user.organizationName || "");
      setPhone(user.phone || "");
      setAddress(user.address || "");
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // MERN: Replacing Supabase update with Axios PATCH to Express
      const { data } = await API.patch("/auth/profile", {
        fullName,
        organizationName,
        phone,
        address,
      });

      toast({ title: "Profile updated", description: "Changes saved successfully." });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.message || "Failed to update profile", 
        variant: "destructive" 
      });
    } finally {
      setSaving(false);
    }
  };

  if (authLoading) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-[#FDFDFF] relative overflow-x-hidden flex flex-col w-full">
      {/* BACKGROUND MESH BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-5%] left-[-5%] w-[45%] h-[45%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[5%] right-[-5%] w-[40%] h-[40%] bg-blue-400/5 rounded-full blur-[100px]" />
      </div>

      <Header />
      
      <main className="container mx-auto px-4 py-12 max-w-3xl relative z-10">
        <motion.div initial="hidden" animate="visible" variants={fadeUp} className="mb-10">
          <div className="flex items-center gap-2 mb-3">
             <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
               <ShieldCheck className="h-3 w-3" />
               Account Security
             </div>
          </div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 mb-2">Settings</h1>
          <p className="text-slate-500 font-medium text-lg italic">
            "Your profile is your community identity."
          </p>
        </motion.div>

        <motion.div 
          initial="hidden" animate="visible" variants={fadeUp}
          className="bg-white/70 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-2xl overflow-hidden"
        >
          <form onSubmit={handleSave}>
            <div className="p-8 md:p-12 space-y-12">
              
              {/* SECTION: Identity */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Personal Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Legal Full Name</Label>
                    <Input
                      id="fullName"
                      placeholder="e.g. John Wick"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="h-14 bg-slate-50/50 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="organizationName" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                      {user?.role === "donator" ? "Business Name" : "NGO Name"}
                    </Label>
                    <Input
                      id="organizationName"
                      placeholder="e.g. Continental Hotels"
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="h-14 bg-slate-50/50 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                    />
                  </div>
                </div>
              </section>

              {/* SECTION: Logistics */}
              <section className="space-y-6">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600">
                    <Phone className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Contact & Logistics</h2>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Direct Phone Line</Label>
                    <div className="relative">
                      <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 55500 00000"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="h-14 bg-slate-50/50 border-none rounded-2xl pl-12 pr-6 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Physical Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                      <Input
                        id="address"
                        placeholder="Suite 404, Main Street"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="h-14 bg-slate-50/50 border-none rounded-2xl pl-12 pr-6 focus-visible:ring-primary/20"
                      />
                    </div>
                  </div>
                </div>
              </section>

              <Button 
                type="submit" 
                className="w-full h-16 rounded-3xl bg-primary text-lg font-black shadow-xl shadow-primary/20 border-none" 
                disabled={saving}
              >
                {saving ? "UPDATING..." : "SAVE SETTINGS"}
              </Button>
            </div>
          </form>
        </motion.div>
      </main>
    </div>
  );
}