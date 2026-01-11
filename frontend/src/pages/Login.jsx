import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Heart, Mail, Lock, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // MERN: Custom hook
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// --- ANIMATION VARIANTS (Consistent with previous project style) ---
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

const blobVariants = {
    animate: (i) => ({
        x: [0, 40, -20, 0],
        y: [0, -50, 30, 0],
        scale: [1, 1.1, 0.95, 1],
        transition: { duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" },
    }),
};

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // MERN: Get login function from AuthContext
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // MERN: Call the login function which handles the Axios POST and JWT storage
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Access Granted",
          description: "Welcome back to the rescue network.",
        });
        navigate("/dashboard");
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      toast({
        title: "Authorization Failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    // MERN FIX: Added 'w-full' and 'overflow-x-hidden' to resolve right-side blank space
    <div className="min-h-screen relative w-full overflow-x-hidden flex items-center justify-center py-16 px-4 bg-[#FDFDFF]">
      
      {/* 1. ANIMATED MESH BACKGROUND */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-15%] right-[-10%] w-[70%] h-[70%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-20%] left-[-15%] w-[60%] h-[60%] bg-accent/10 rounded-full blur-[140px]" />
        <motion.div custom={3} variants={blobVariants} animate="animate" className="absolute top-[30%] left-[20%] w-[30%] h-[30%] bg-indigo-400/5 rounded-full blur-[100px]" />
      </div>

      {/* 2. ENHANCED GLASS CARD */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className={cn(
          "w-full max-w-md bg-white/70 backdrop-blur-3xl overflow-hidden relative",
          "rounded-[3.5rem] border-[1.5px] border-white/60 shadow-2xl shadow-primary/10"
        )}
      >
        <div className="p-10 md:p-14 relative z-10">
          
          {/* HEADER SECTION */}
          <div className="text-center mb-10 space-y-4">
            <motion.div 
              variants={itemVariants} 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="inline-flex items-center justify-center p-4 bg-primary rounded-3xl shadow-lg mb-2 cursor-pointer"
            >
              <Heart className="h-7 w-7 text-white" />
            </motion.div>
            <div className="space-y-1">
              <motion.h1 variants={itemVariants} className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                Access <span className="text-primary">Hub.</span>
              </motion.h1>
              <motion.p variants={itemVariants} className="text-slate-500 font-medium pt-1">
                Enter your secure rescue credentials.
              </motion.p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-8">
            <motion.div variants={itemVariants} className="space-y-6">
              {/* EMAIL FIELD */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 ml-3">Identity Email</Label>
                <div className="relative group">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-all duration-300" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contact@impact.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-14 pl-12 bg-slate-100/40 border-none rounded-2xl focus-visible:ring-primary/20 text-slate-900 font-medium"
                    required
                  />
                </div>
              </div>

              {/* PASSWORD FIELD */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-3">
                  <Label htmlFor="password" className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Access Key</Label>
                  <Link to="#" className="text-[10px] font-black uppercase tracking-widest text-primary hover:opacity-70">Recovery?</Link>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-primary transition-all duration-300" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-14 pl-12 bg-slate-100/40 border-none rounded-2xl focus-visible:ring-primary/20"
                    required
                  />
                </div>
              </div>
            </motion.div>

            {/* SUBMIT SECTION */}
            <motion.div variants={itemVariants} className="pt-2 space-y-6">
              <Button 
                type="submit" 
                className="w-full h-16 rounded-3xl bg-linear-to-r from-primary to-indigo-600 text-lg font-black shadow-xl shadow-primary/20 border-none group"
                disabled={loading}
              >
                {loading ? "AUTHORIZING..." : (
                  <span className="flex items-center gap-2">
                    SIGN IN <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                )}
              </Button>
              
              <div className="flex flex-col items-center gap-5">
                <p className="text-sm font-bold text-slate-400">
                  New Rescuer? <Link to="/signup" className="text-primary font-black hover:underline underline-offset-4">Create Account</Link>
                </p>
                
                {/* 3. EMERALD SECURITY BADGE */}
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-accent bg-accent/5 px-4 py-2 rounded-full border border-accent/10"
                >
                  <ShieldCheck className="h-4 w-4" /> Trusted Node
                </motion.div>
              </div>
            </motion.div>
          </form>
        </div>
      </motion.div>

      {/* 4. DECORATIVE FLOATING ELEMENT */}
      <div className="hidden lg:block absolute bottom-12 right-12">
          <motion.div 
            animate={{ y: [0, -15, 0], rotate: [0, 2, -2, 0] }} 
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="flex items-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full shadow-lg border border-white"
          >
            <Sparkles className="h-5 w-5 text-accent animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Securing Global Food Chains</span>
          </motion.div>
      </div>
    </div>
  );
}