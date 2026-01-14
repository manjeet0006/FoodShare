import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { 
  ShieldCheck, 
  Scale, 
  AlertCircle, 
  Clock, 
  FileText, 
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

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

export default function TCs() {
  const sections = [
    {
      icon: ShieldCheck,
      title: "User Responsibility",
      content: "As a donor, you represent that the food provided is fit for human consumption and has been handled in accordance with local health and safety standards. Recipients agree to inspect all food items upon pickup."
    },
    {
      icon: ShieldAlert,
      title: "Food Safety Disclaimer",
      content: "FoodShare acts solely as a marketplace. We do not inspect, handle, or store food. The platform is not liable for any illness, injury, or damages resulting from the consumption of food shared via our services.",
      highlight: true
    },
    {
      icon: Clock,
      title: "Pickup Timelines",
      content: "Claimed items must be picked up within the time frame specified by the donor. Failure to do so may result in the item being returned to the public feed or user account restrictions."
    },
    {
      icon: Scale,
      title: "Limitation of Liability",
      content: "To the maximum extent permitted by law, FoodShare and its affiliates shall not be liable for any indirect, incidental, or consequential damages arising out of your use of the platform."
    }
  ];

  return (
    <div className="min-h-screen pb-20 bg-[#FDFDFF] relative overflow-x-hidden w-full">
      {/* BACKGROUND BLOBS */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-blue-400/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <motion.main 
        variants={containerVariants} 
        initial="hidden" 
        animate="show" 
        className="container mx-auto px-4 py-20 max-w-4xl relative z-10"
      >
        {/* HERO SECTION */}
        <motion.div variants={itemVariants} className="text-center mb-16 space-y-4 mt-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-100 shadow-sm mb-4">
            <FileText className="h-4 w-4 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Legal Agreement</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tighter">
            Terms & <span className="text-primary">Conditions.</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">
            Last Updated: January 11, 2026
          </p>
        </motion.div>

        {/* CONTENT CARD */}
        <motion.div 
          variants={itemVariants} 
          className="bg-white/70 backdrop-blur-3xl border border-white/60 shadow-2xl rounded-[3rem] p-8 md:p-12 space-y-12"
        >
          {/* INTRO */}
          <section className="space-y-4">
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
              1. Acceptance of Terms
            </h2>
            <p className="text-slate-600 leading-relaxed font-medium">
              By accessing or using the FoodShare platform, you agree to be bound by these Terms and Conditions. Our mission is to reduce food waste and support local communities, and by using this service, you join a network built on trust and mutual respect.
            </p>
          </section>

          {/* DYNAMIC SECTIONS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sections.map((section, idx) => (
              <div 
                key={idx} 
                className={`p-6 rounded-4xl border transition-all duration-300 ${
                  section.highlight 
                  ? "bg-rose-50 border-rose-100 shadow-rose-100" 
                  : "bg-white/50 border-slate-100 hover:shadow-xl shadow-slate-200/50"
                }`}
              >
                <div className={`p-3 w-fit rounded-xl mb-4 ${
                  section.highlight ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <section.icon size={20} />
                </div>
                <h3 className={`text-lg font-black mb-2 ${section.highlight ? "text-rose-900" : "text-slate-900"}`}>
                  {section.title}
                </h3>
                <p className={`text-sm leading-relaxed font-medium ${section.highlight ? "text-rose-700" : "text-slate-500"}`}>
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* SAFETY NOTE */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden">
            <AlertCircle className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <ShieldAlert className="text-primary" /> Important Safety Note
            </h3>
            <p className="text-sm opacity-80 leading-relaxed">
              Recipients are advised to follow standard food safety procedures: 
              Check for unusual odors, ensure packaging is intact, and reheat 
              cooked meals to at least 75°C before consumption. When in doubt, 
              dispose of the item.
            </p>
          </section>

          {/* FOOTER ACTION */}
          <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-sm text-slate-400 font-bold italic">
              Questions? Contact us at legal@foodshare.org
            </p>
            <Button asChild className="rounded-2xl h-12 px-8 bg-primary shadow-lg shadow-primary/20 font-bold">
              <Link to="/signup" className="flex items-center gap-2">
                I Agree & Accept <ChevronRight size={16} />
              </Link>
            </Button>
          </div>
        </motion.div>
      </motion.main>
    </div>
  );
}