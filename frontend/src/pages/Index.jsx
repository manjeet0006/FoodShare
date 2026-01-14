import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import {
  Heart,
  Users,
  MapPin,
  Clock,
  ArrowRight,
  Building2,
  HandHeart,
  Utensils,
  ShieldCheck,
  Leaf,
  Sparkles,
  ChevronRight
} from "lucide-react";
import heroImage from "@/assets/hero-food-sharing.jpg"; 
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";

export default function Index() {
  const { user } = useAuth();

  const fadeInUp = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
  };

  const stagger = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden selection:bg-rose-500/30">
      <Header />

      {/* ================= HERO SECTION (Maintained Original Fonts) ================= */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 h-full w-full bg-background bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]">
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-77.5 w-77.5 rounded-full bg-rose-500 opacity-20 blur-[100px]" />
          <div className="absolute right-25 top-40 -z-10 h-100 w-100 rounded-full bg-primary opacity-20 blur-[120px]" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-semibold backdrop-blur-md shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>The #1 Food Rescue Platform</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1]"
            >
              Turn Surplus Food Into <br />
              <span className="bg-linear-to-r from-rose-500 via-primary to-orange-500 bg-clip-text text-transparent drop-shadow-sm">
                Shared Happiness
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-light"
            >
              We bridge the gap between abundance and need. <br className="hidden md:block" />
              Restaurants donate, NGOs distribute, communities thrive.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-5 justify-center pt-4"
            >
              <Link to={user ? "/dashboard" : "/signup"}>
                <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-[0_0_40px_-10px_rgba(225,29,72,0.5)] hover:shadow-[0_0_60px_-10px_rgba(225,29,72,0.6)] transition-all duration-300">
                  {user ? "Go to Dashboard" : "Start Donating"}
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/">
                <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-background/50 backdrop-blur-xl border-foreground/10">
                  Find Food
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= PERSONA SELECTION (Role focus) ================= */}
      <section className="py-12 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {/* Donator Persona */}
            <div className="bg-background border border-border p-8 rounded-[2rem] shadow-sm hover:border-primary/40 transition-colors">
              <Building2 className="h-10 w-10 text-rose-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">For Food Donors</h3>
              <p className="text-muted-foreground mb-6">Restaurants, Hotels, and Caterers looking to reduce waste and help others.</p>
              <Link to="/signup" className="text-primary font-semibold inline-flex items-center group">
                Register as Donor <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Receiver Persona */}
            <div className="bg-background border border-border p-8 rounded-[2rem] shadow-sm hover:border-indigo-500/40 transition-colors">
              <HandHeart className="h-10 w-10 text-indigo-500 mb-4" />
              <h3 className="text-2xl font-bold mb-2">For NGOs & Receivers</h3>
              <p className="text-muted-foreground mb-6">Verified organizations and volunteers distributing food to the needy.</p>
              <Link to="/signup" className="text-indigo-500 font-semibold inline-flex items-center group">
                Register as Receiver <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS (Original content) ================= */}
      <section className="py-24 relative">
        <div className="container mx-auto px-4">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="text-center mb-16">
            <motion.h2 variants={fadeInUp} className="text-3xl md:text-5xl font-bold mb-6">
              How FoodShare Works
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { icon: <Building2 className="h-8 w-8 text-rose-500" />, title: "1. Post Donation", desc: "List surplus food in under 2 minutes. Add quantity and pickup time." },
              { icon: <MapPin className="h-8 w-8 text-indigo-500" />, title: "2. Locate & Claim", desc: "Verified NGOs receive alerts and claim food instantly." },
              { icon: <HandHeart className="h-8 w-8 text-emerald-500" />, title: "3. Pickup & Impact", desc: "NGOs distribute food to those in need. Impact is tracked live." }
            ].map((step, i) => (
              <div key={i} className="bg-background/40 backdrop-blur-md rounded-3xl p-8 border border-border shadow-md">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-6">{step.icon}</div>
                <h3 className="font-bold text-xl mb-3">{step.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= BENTO STATS (Tighter Spacing) ================= */}
      <section className="py-20 bg-secondary/10 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
            <div>
              <motion.div className="flex items-center gap-2 text-primary font-bold mb-4 uppercase text-xs tracking-widest">
                <Leaf className="w-4 h-4" /> <span>Accountability Matters</span>
              </motion.div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Why professionals choose <br /> FoodShare.
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <ShieldCheck className="text-primary h-6 w-6" />
                  <div>
                    <h4 className="font-bold">Verified Trust</h4>
                    <p className="text-sm text-muted-foreground">Every organization is vetted for security.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <Clock className="text-primary h-6 w-6" />
                  <div>
                    <h4 className="font-bold">Lightning Fast</h4>
                    <p className="text-sm text-muted-foreground">Optimized logistics for quick pickups.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Re-designed Stats Box */}
            <div className="relative bg-slate-950 p-10 rounded-[2.5rem] text-white shadow-2xl border border-white/5 overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-10"><Utensils size={100} /></div>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h4 className="text-4xl font-bold mb-1">1.2k</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Meals Shared</p>
                </div>
                <div>
                  <h4 className="text-4xl font-bold mb-1">84</h4>
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Active NGOs</p>
                </div>
                <div className="col-span-2 pt-6 border-t border-white/10">
                   <h4 className="text-4xl font-bold mb-1">2.4t</h4>
                   <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">CO2 Prevented</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CTA (Original Colors Maintained) ================= */}
      <section className="py-20 px-4">
        <div className="relative rounded-[3rem] p-12 md:p-24 text-center overflow-hidden border border-slate-800 shadow-2xl">
          <div className="absolute inset-0 bg-slate-900" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent)]" />
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold text-white mb-8 tracking-tight">Ready to be a hero?</h2>
            <p className="text-slate-400 mb-12 text-xl font-medium max-w-xl mx-auto">Join the sustainable future. Setup takes less than 2 minutes.</p>
            <Link to="/signup">
              <Button size="lg" className="h-16 px-10 text-xl rounded-full bg-primary text-white hover:bg-primary/90 shadow-2xl">
                Join ShareFood Now
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      {/* <footer className="py-12 border-t border-border/40">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary rounded-xl"><Heart className="h-5 w-5 text-white fill-white" /></div>
             <span className="font-bold text-xl tracking-tight uppercase">ShareFood</span>
          </div>
          <div className="flex gap-8 text-sm font-medium text-muted-foreground/60">
             <Link to="#" className="hover:text-primary">About</Link>
             <Link to="#" className="hover:text-primary">Impact</Link>
             <Link to="#" className="hover:text-primary">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground/40 italic">© 2026 ShareFood Inc.</p>
        </div>
      </footer> */}
    </div>
  );
}
