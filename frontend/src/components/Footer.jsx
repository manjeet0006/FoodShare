import { Link } from "react-router-dom";
import { Heart, Github, Twitter, Mail, Instagram, ArrowRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative mt-auto border-t pt-10 pb-10 border-border/40 bg-background/60 backdrop-blur-md overflow-hidden">
      {/* Subtle Background Glow to match the Index page */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-[80px]" />
      
      <div className="container mx-auto px-4 py-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* 1. BRAND SECTION */}
          <div className="col-span-1 md:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-primary rounded-lg shadow-lg shadow-primary/20">
                <Heart className="h-5 w-5 text-white fill-white" />
              </div>
              <span className="font-bold text-xl tracking-tighter uppercase">Foodshare</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-[200px] font-medium">
              Revolutionizing food rescue by connecting abundance with local need in real-time.
            </p>
            <div className="flex gap-3 text-muted-foreground/50">
              <Twitter className="h-4 w-4 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-4 w-4 hover:text-rose-500 cursor-pointer transition-colors" />
              <Github className="h-4 w-4 hover:text-foreground cursor-pointer transition-colors" />
            </div>
          </div>

          {/* 2. PERSONA: DONORS */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">For Donors</h4>
            <ul className="space-y-2 text-sm font-bold text-muted-foreground">
              <li><Link to="/signup" className="hover:text-foreground transition-colors">Register Business</Link></li>
              <li><Link to="/donations/new" className="hover:text-foreground transition-colors">Post Surplus</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Tax Benefits</Link></li>
            </ul>
          </div>

          {/* 3. PERSONA: RECEIVERS */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">For NGOs</h4>
            <ul className="space-y-2 text-sm font-bold text-muted-foreground">
              <li><Link to="/signup" className="hover:text-foreground transition-colors">Register NGO</Link></li>
              <li><Link to="/donations" className="hover:text-foreground transition-colors">Browse Feed</Link></li>
              <li><Link to="#" className="hover:text-foreground transition-colors">Partner Directory</Link></li>
            </ul>
          </div>

          {/* 4. NEWSLETTER / CONTACT */}
          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Stay Updated</h4>
            <div className="flex items-center bg-secondary/50 rounded-full border border-border/50 p-1 pl-4">
              <input 
                type="email" 
                placeholder="Email address" 
                className="bg-transparent border-none text-[10px] focus:ring-0 w-full font-bold outline-none"
              />
              <button className="p-2 bg-primary rounded-full hover:scale-105 transition-transform">
                <ArrowRight className="h-3 w-3 text-white" />
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-border/20 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest italic">
            © 2026 FoodShare Inc. <span className="mx-2">|</span> Built for Community Impact
          </p>
          <div className="flex gap-6 text-[10px] font-black text-muted-foreground/60 uppercase tracking-tighter">
            <Link to="#" className="hover:text-primary">Privacy Policy</Link>
            <Link to="/T&Cs" className="hover:text-primary">Terms of Service</Link>
            <Link to="#" className="hover:text-primary">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}