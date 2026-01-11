import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { Heart, Building2, HandHeart, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import API from "@/services/api"; // MERN: Custom Axios instance
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const containerVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { staggerChildren: 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
};

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [organizationName, setOrganizationName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("donator");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // MERN: Replacing Supabase auth.signUp with your Express API call
      const { data } = await API.post('/auth/signup', {
        email,
        password,
        full_name: fullName,
        organization_name: organizationName,
        phone: phone || null,
        address: address || null,
        role
      });

      // MERN: Store the returned JWT token
      localStorage.setItem("token", data.token);
      
      toast({ title: "Welcome aboard!", description: "Account created successfully." });
      navigate("/dashboard");
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.response?.data?.error || error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // FIX: Added 'w-full' and 'overflow-x-hidden' to the root div to stop horizontal scroll gaps
    <div className="min-h-screen bg-[#FDFDFF] relative w-full overflow-x-hidden flex items-center justify-center py-16 px-4">
      {/* 1. BRANDED MESH BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-15%] right-[-10%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-15%] left-[-10%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[140px]" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-2xl bg-white/70 backdrop-blur-3xl border border-white/50 rounded-[3.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-8 md:p-14">
          <div className="text-center mb-12 space-y-4">
            <motion.div variants={itemVariants} className="inline-flex items-center justify-center p-4 bg-primary rounded-3xl shadow-lg mb-2">
              <Heart className="h-7 w-7 text-white" />
            </motion.div>
            <div className="space-y-1">
                <motion.h1 variants={itemVariants} className="text-5xl font-black tracking-tighter text-slate-900 leading-none">
                    Create <span className="text-primary">Impact.</span>
                </motion.h1>
                <motion.p variants={itemVariants} className="text-slate-500 font-medium text-lg">
                    Join the elite network of food rescuers.
                </motion.p>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-10">
            <motion.div variants={itemVariants} className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-3">Identity Type</Label>
              <RadioGroup
                value={role}
                onValueChange={(value) => setRole(value)}
                className="grid grid-cols-2 gap-5"
              >
                {[
                  { id: "donator", icon: Building2, label: "Donor", sub: "Supply Side" },
                  { id: "receiver", icon: HandHeart, label: "Rescuer", sub: "Impact Side" }
                ].map((option) => (
                  <div key={option.id}>
                    <RadioGroupItem value={option.id} id={option.id} className="peer sr-only" />
                    <Label
                      htmlFor={option.id}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-slate-100 bg-white/40 p-8 cursor-pointer transition-all duration-500",
                        "hover:border-primary/30 hover:bg-white",
                        "peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-white peer-data-[state=checked]:shadow-xl peer-data-[state=checked]:shadow-primary/10"
                      )}
                    >
                      <option.icon className={cn("mb-4 h-10 w-10 transition-colors duration-500", role === option.id ? "text-primary" : "text-slate-300")} />
                      <span className="font-black text-slate-900 text-lg tracking-tight">{option.label}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1">{option.sub}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="fullName" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Display Name</Label>
                <Input
                  id="fullName"
                  placeholder="John Wick"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                  required
                />
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="organizationName" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                  {role === "donator" ? "Establishment Name" : "Foundation Name"}
                </Label>
                <Input
                  id="organizationName"
                  value={organizationName}
                  onChange={(e) => setOrganizationName(e.target.value)}
                  placeholder={role === "donator" ? "The Continental" : "Rescue Foundation"}
                  className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                />
              </motion.div>
            </div>

            <motion.div variants={itemVariants} className="space-y-8">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Official Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@impact.org"
                  className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Secure Key</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 focus-visible:ring-primary/20"
                  required
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="pt-6 space-y-6">
              <Button 
                type="submit" 
                className="w-full h-16 rounded-3xl bg-linear-to-r from-primary to-indigo-600 text-lg font-black shadow-xl border-none group"
                disabled={loading}
              >
                {loading ? "CREATING PROFILE..." : (
                  <span className="flex items-center gap-2">
                    INITIATE MEMBERSHIP <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 px-2">
                <p className="text-sm font-bold text-slate-400">
                  Already registered? <Link to="/login" className="text-primary font-black hover:underline underline-offset-4">Sign In</Link>
                </p>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/5 px-4 py-2 rounded-full border border-accent/10">
                  <ShieldCheck className="h-4 w-4" /> Trusted Network
                </div>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  );
}