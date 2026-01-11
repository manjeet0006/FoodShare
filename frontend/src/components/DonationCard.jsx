import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock, MapPin, MessageCircle, Package, User,
  Phone, Building, Utensils
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import API from "@/services/api"; 
import { cn } from "@/lib/utils";

// Added showClaimButton to the props destructuring below
export function DonationCard({ donation, onClaim, showMessageButton = false, showClaimButton = false }) {
  const { user } = useAuth();
  const [receiverInfo, setReceiverInfo] = useState(null);

  const expiresAt = new Date(donation.expires_at);
  const isExpired = expiresAt < new Date();
  const isUrgent = !isExpired && (expiresAt.getTime() - new Date().getTime() < 3600000 * 3);
  const isAvailable = donation.status === "available" && !isExpired;

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
    if (user.role === "receiver" && donation.claimed_by === user._id) {
      return {
        id: donation.donator_id?._id,
        name: donation.donator_id?.organizationName || donation.donator_id?.fullName || "Donator",
      };
    }
    else if (user.role === "donator" && donation.donator_id?._id === user._id && donation.claimed_by) {
      return {
        id: donation.claimed_by,
        name: receiverInfo?.organizationName || receiverInfo?.fullName || "Receiver",
      };
    }
    return null;
  };

  const otherParty = getOtherParty();
  const canMessage = showMessageButton && donation.status === "claimed" && otherParty;

  return (
    <Card className="group h-full flex flex-col overflow-hidden border-muted/60 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-white">
      <div className="relative h-32 bg-linear-to-br from-primary/10 to-accent/10 flex items-center justify-center overflow-hidden">
        <Utensils className="h-12 w-12 text-primary/20 absolute -right-2 -bottom-2 rotate-12" />
        <Badge
          variant={isExpired ? "destructive" : "outline"}
          className={cn(
            "absolute top-3 right-3 backdrop-blur-md font-semibold",
            isAvailable && "bg-primary/90 text-primary-foreground border-none",
            isUrgent && "animate-pulse bg-orange-500 text-white border-none"
          )}
        >
          {isExpired ? "Expired" : isUrgent ? "Expiring Soon" : donation.status.toUpperCase()}
        </Badge>
        <div className="flex flex-col items-center gap-1 z-10">
          <Package className="h-8 w-8 text-primary" />
          <span className="text-xs font-bold uppercase tracking-widest text-primary/70">{donation.food_type}</span>
        </div>
      </div>

      <CardHeader className="p-5 pb-2">
        <div className="space-y-1">
          <h3 className="font-bold text-xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {donation.title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground font-medium">
            <Building className="h-3.5 w-3.5" />
            <span className="truncate">
              {donation.donator_id?.organizationName || donation.donator_id?.fullName || "Anonymous"}
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-5 pt-2 flex-1 space-y-4">
        {donation.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 italic">"{donation.description}"</p>
        )}

        <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-muted/30 border border-muted/20">
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Quantity</p>
            <div className="flex items-center gap-1 text-sm font-semibold">
              <Package className="h-3.5 w-3.5 text-primary" />
              {donation.quantity}
            </div>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-tighter">Location</p>
            <div className="flex items-center gap-1 text-sm font-semibold truncate">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              {donation.city}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Clock className={cn("h-4 w-4", isUrgent && "text-orange-500")} />
          <span>{format(expiresAt, "MMM d, h:mm a")}</span>
        </div>

        {isDonatorViewingClaimedDonation && receiverInfo && (
          <div className="mt-2 rounded-xl border border-primary/20 bg-primary/5 p-4">
            <span className="text-[10px] font-bold uppercase text-primary/70 block mb-1">Claimed By</span>
            <div className="font-bold text-sm flex items-center gap-2">
              <User className="h-3.5 w-3.5 text-primary" />
              {receiverInfo.organizationName || receiverInfo.fullName}
            </div>
          </div>
        )}
      </CardContent>

      <Separator className="opacity-50" />

      

      <CardFooter className="p-1 bg-muted/10">
        <div className="flex w-full gap-1">
          {/* 1. CHAT BUTTON */}
          {canMessage && (
            <Button variant="outline" className="flex-1 bg-background" asChild>
              <Link to={`/messages?donationId=${donation._id}&otherPartyId=${otherParty.id}&otherPartyName=${encodeURIComponent(otherParty.name)}&donationTitle=${encodeURIComponent(donation.title)}`}>
                <MessageCircle className="h-4 w-4 mr-2 text-primary" />
                Chat
              </Link>
            </Button>
          )}

          {/* 2. CLAIM BUTTON (For Receivers in the feed) */}
          {showClaimButton && donation.status === "available" && (
            <Button
              onClick={() => onClaim(donation._id)}
              className="flex-1 bg-primary hover:bg-primary/90 text-white font-bold"
            >
              Claim Order
            </Button>
          )}

          {/* 3. CONFIRM PICKUP BUTTON (For Donators in dashboard) */}
          {donation.status === "claimed" && user?.role === "donator" && (
            <Button
              onClick={onClaim}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              Confirm Pickup
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}