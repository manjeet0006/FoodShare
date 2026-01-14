import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock, MapPin, MessageCircle, Package, User,
  Building, CheckCircle2, ChevronDown
} from "lucide-react";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/services/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import heroImage from "@/assets/hero-food-sharing.jpg";

// --- FALLBACK IMAGES BY CATEGORY ---
const CATEGORY_IMAGES = {
  "Cooked Meals": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
  "Fresh Produce": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800",
  "Bakery Items": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
  "default": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800"
};

export function DonationCard({ donation, onClaim, showMessageButton = false, showClaimButton = false }) {
  const { user } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [receiverInfo, setReceiverInfo] = useState(null);

  const expiresAt = new Date(donation.expires_at);
  const isExpired = expiresAt < new Date();
  const isUrgent = !isExpired && (expiresAt.getTime() - new Date().getTime() < 3600000 * 3);
  
  const isDonatorViewingClaimedDonation =
    user?.role === "donator" &&
    donation.donator_id?._id === user._id &&
    donation.claimed_by &&
    (donation.status === "claimed" || donation.status === "completed");

  useEffect(() => {
    if (isDonatorViewingClaimedDonation && donation.claimed_by) {
      fetchReceiverInfo(donation.claimed_by);
    }
  }, [isDonatorViewingClaimedDonation, donation.claimed_by]);

  const fetchReceiverInfo = async (receiverId) => {
    try {
      const { data } = await API.get(`/auth/users/${receiverId}`);
      setReceiverInfo(data);
    } catch (error) {
      console.error("Error fetching receiver info:", error);
    }
  };

  const getOtherParty = () => {
    if (!user) return null;
    const isReceiver = user.role === "receiver" && donation.claimed_by === user._id;
    const isDonor = user.role === "donator" && donation.donator_id?._id === user._id && donation.claimed_by;

    if (isReceiver) return { id: donation.donator_id?._id, name: donation.donator_id?.organizationName || "Donator" };
    if (isDonor) return { id: donation.claimed_by, name: receiverInfo?.organizationName || "Receiver" };
    return null;
  };

  const otherParty = getOtherParty();
  const canMessage = showMessageButton && donation.status === "claimed" && otherParty;

  return (
    <motion.div layout transition={{ duration: 0.3, ease: "easeInOut" }}>
      <Card 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "group overflow-hidden border-border/40 transition-all cursor-pointer bg-background/60 backdrop-blur-sm p-0", // p-0 removes the top white space
          isExpanded ? "shadow-2xl ring-1 ring-primary/20" : "hover:shadow-md"
        )}
      >
        {/* 1. COMPACT HEADER (Always Visible) */}
        <div className="relative h-48 w-full overflow-hidden shrink-0">
          <img
            src={donation?.image || CATEGORY_IMAGES[donation.food_type] || CATEGORY_IMAGES["default"] || heroImage}
            alt="food"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 block"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />
          
          <Badge className={cn(
            "absolute top-2 right-2 text-[9px] font-black uppercase tracking-tighter border-none",
            isExpired ? "bg-destructive" : isUrgent ? "bg-orange-500 animate-pulse" : "bg-primary"
          )}>
            {isExpired ? "Expired" : isUrgent ? "Urgent" : donation.status}
          </Badge>

          <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-white">
            <div className="flex items-center gap-1.5 bg-black/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/10">
              <MapPin className="h-3 w-3 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest">{donation.city}</span>
              {donation.distance != null && (
                <>
                  <Separator orientation="vertical" className="h-3 bg-white/20 mx-1" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    {(donation.distance / 1000).toFixed(1)} km
                  </span>
                </>
              )}
            </div>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="h-4 w-4 opacity-70" />
            </motion.div>
          </div>
        </div>

        {/* 2. TEXT CONTENT (Wrapped in padding to compensate for p-0 on Card) */}
        <div className="p-3">
          <CardHeader className="p-0 pb-2 space-y-0">
            <h3 className="font-bold text-base leading-tight uppercase tracking-tight line-clamp-1">
              {donation.title || donation.food_type}
            </h3>
          </CardHeader>

          {/* 3. EXPANDABLE CONTENT */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardContent className="p-0 space-y-3 pt-2">
                  <Separator className="opacity-30" />
                  
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground font-bold uppercase">
                    <Building className="h-3 w-3" />
                    {donation.donator_id?.organizationName || "Private Donor"}
                  </div>

                  {donation.description && (
                    <p className="text-xs text-muted-foreground leading-relaxed italic border-l-2 border-primary/20 pl-2">
                      {donation.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-secondary/50 p-2 rounded-lg border border-border/40">
                      <p className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter mb-0.5">Quantity</p>
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Package className="h-3 w-3 text-primary" />
                        {donation.quantity}
                      </div>
                    </div>
                    <div className="bg-secondary/50 p-2 rounded-lg border border-border/40">
                      <p className="text-[8px] uppercase font-black text-muted-foreground tracking-tighter mb-0.5">Expires At</p>
                      <div className="flex items-center gap-1 text-xs font-bold">
                        <Clock className="h-3 w-3 text-primary" />
                        {format(expiresAt, "h:mm a")}
                      </div>
                    </div>
                  </div>

                  {isDonatorViewingClaimedDonation && receiverInfo && (
                    <div className="rounded-lg bg-primary/5 p-2 border border-primary/10">
                      <p className="text-[8px] font-black uppercase text-primary mb-1">Secured By</p>
                      <div className="font-bold text-[11px] flex items-center gap-2 italic">
                        <User className="h-3 w-3" />
                        {receiverInfo.organizationName || receiverInfo.fullName}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                    {canMessage && (
                      <Button variant="outline" size="sm" className="flex-1 h-8 rounded-lg text-[10px] font-bold uppercase tracking-tighter" asChild>
                        <Link to={`/messages?donationId=${donation._id}&otherPartyId=${otherParty.id}&otherPartyName=${encodeURIComponent(otherParty.name)}&donationTitle=${encodeURIComponent(donation.title)}`}>
                          <MessageCircle className="h-3 w-3 mr-1" />
                          Chat
                        </Link>
                      </Button>
                    )}

                    {showClaimButton && donation.status === "available" && (
                      <Button
                        size="sm"
                        onClick={() => onClaim(donation._id)}
                        className="flex-1 h-8 rounded-lg bg-primary text-white font-black text-[10px] uppercase tracking-tighter"
                      >
                        Claim Now
                      </Button>
                    )}

                    {donation.status === "claimed" && user?.role === "donator" && (
                      <Button
                        size="sm"
                        onClick={onClaim}
                        className="flex-1 h-8 rounded-lg bg-emerald-600 text-white font-black text-[10px] uppercase tracking-tighter"
                      >
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Delivered
                      </Button>
                    )}
                  </div>
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </motion.div>
  );
}