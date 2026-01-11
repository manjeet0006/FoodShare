import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  Heart,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  X,
  LayoutDashboard,
  Gift,
  User as UserIcon
} from "lucide-react";
import { useState, useMemo } from "react";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
} from "framer-motion";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function Header() {
  const { user, profile, signOut } = useAuth(); // profile comes from your MongoDB 'profiles' or 'users' collection
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const { scrollY } = useScroll();

  // Logic to hide header on scroll down and show on scroll up
  useMotionValueEvent(scrollY, "change", (latest) => {
    const previous = scrollY.getPrevious() || 0;
    if (latest > previous && latest > 150) {
      setHidden(true);
      setMobileMenuOpen(false);
    } else {
      setHidden(false);
    }
    setScrolled(latest > 20);
  });

  const handleSignOut = async () => {
    await signOut(); // Clears localStorage and state
    navigate("/");
    setMobileMenuOpen(false);
  };

  // MERN Role-based navigation items
  const navItems = useMemo(() => {
    return [
      { to: "/donations", label: "Browse Donations", icon: <Gift className="w-4 h-4" /> },
      user && profile?.role === "donator"
        ? { to: "/donate", label: "Donate Food", icon: <Heart className="w-4 h-4" /> }
        : null,
      user ? { to: "/messages", label: "Messages", icon: <MessageCircle className="w-4 h-4" /> } : null,
      user ? { to: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> } : null,
      user ? { to: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> } : null,
    ].filter(Boolean);
  }, [user, profile]);

  return (
    <motion.header
      variants={{ visible: { y: 0 }, hidden: { y: "-100%" } }}
      animate={hidden ? "hidden" : "visible"}
      transition={{ duration: 0.35, ease: "easeInOut" }}
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-500",
        scrolled
          ? "bg-background/70 backdrop-blur-xl backdrop-saturate-150 border-b border-border/40 shadow-sm"
          : "bg-transparent border-transparent py-2"
      )}
    >
      <nav className="container mx-auto px-4 md:px-6 h-16 flex items-center justify-between">

        {/* ================= BRANDING ================= */}
        <Link to="/" className="flex items-center gap-2 group z-50">
          <motion.div
            whileHover={{ scale: 1.1, rotate: -10 }}
            whileTap={{ scale: 0.95 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-rose-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative bg-linear-to-br from-rose-500 to-pink-600 text-white p-2 rounded-xl shadow-lg shadow-rose-500/20">
              <Heart className="h-5 w-5 fill-white" />
            </div>
          </motion.div>
          <span className="text-xl font-bold tracking-tight bg-linear-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
            FoodShare
          </span>
        </Link>

        {/* ================= DESKTOP NAV ================= */}
        <div className="hidden md:flex items-center bg-background/50 border border-border/40 rounded-full px-2 py-1.5 backdrop-blur-md shadow-sm">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "relative px-4 py-1.5 text-sm font-medium transition-all duration-300 flex items-center gap-2 rounded-full",
                  isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbar-pill"
                    className="absolute inset-0 bg-primary rounded-full shadow-md shadow-primary/25"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* ================= USER ACTIONS ================= */}
        <TooltipProvider delayDuration={0}> {/* Set delay to 0 for instant hover response */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3 pl-4">

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      to="/analytics"
                      className="cursor-pointer"
                    >
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }} // Faster spring for snappy feel
                        className="flex flex-col items-center mr-1 group transition-opacity hover:opacity-90"
                      >
                        <span className="text-sm font-semibold tracking-tight group-hover:text-primary transition-colors">
                          {profile?.organizationName || profile?.fullName?.split(' ')[0] || "User"}
                        </span>

                        <span className="text-[10px] border-2 bg-slate-200 border-slate-300 uppercase tracking-wider text-muted-foreground font-bold px-1.5 py-0.5 rounded-sm group-hover:border-primary/30 group-hover:bg-primary/5 transition-all">
                          {profile?.role}
                        </span>
                      </motion.div>
                    </Link>
                  </TooltipTrigger>

                  <TooltipContent
                    side="bottom"
                    className="bg-slate-900 text-white border-slate-800 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 shadow-xl"
                  >
                    <p>View Analytics</p>
                  </TooltipContent>
                </Tooltip>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleSignOut}
                  className="rounded-full hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
    <Button
      variant="ghost"
      className="py-5 px-8 rounded-4xl text-slate-600 font-bold bg-slate-100 hover:bg-slate-200 transition-all duration-300"
    >
      Sign In
    </Button>
  </motion.div>
</Link>
                <Link to="/signup">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="rounded-full bg-linear-to-r from-rose-600 to-pink-600 text-white border-0 shadow-lg shadow-rose-500/25">
                      Get Started
                    </Button>
                  </motion.div>
                </Link>
              </div>
            )}
          </div>
        </TooltipProvider>

        {/* MOBILE MENU TOGGLE */}
        <div className="md:hidden">
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="relative z-50">
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </nav>

      {/* ================= MOBILE MENU DRAWER ================= */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 w-full bg-background/95 backdrop-blur-2xl border-b border-border/50 pt-20 pb-8 px-6 shadow-2xl md:hidden"
          >
            <div className="flex flex-col space-y-2">
              {navItems.map((item, i) => (
                <motion.div key={item.to} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-4 p-4 rounded-xl transition-all",
                      location.pathname === item.to
                        ? "bg-primary/10 text-primary font-semibold"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {item.icon}
                    <span className="text-lg">{item.label}</span>
                  </Link>
                </motion.div>
              ))}

              <motion.div className="mt-6 pt-6 border-t border-border/50" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                {user ? (
                  <Button variant="destructive" className="w-full justify-center text-lg h-12 rounded-xl shadow-lg" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full h-12 text-lg rounded-xl bg-linear-to-r from-rose-600 to-pink-600">
                        Get Started
                      </Button>
                    </Link>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="secondary" className="w-full h-12 text-lg rounded-xl">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}