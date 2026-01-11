import { useEffect, useState } from "react";
import API from "@/services/api"; // Your Axios instance
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export function ConversationList({ onSelectConversation, selectedDonationId }) {
  const { user } = useAuth(); // User data from MERN AuthContext
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      // Calls your updated backend route: router.get('/conversations', auth, ...)
      const { data } = await API.get("/messages/conversations");
      setConversations(data);
    } catch (error) {
      console.error("Error fetching conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "??";
  };

  if (loading) {
    return (
      <div className="space-y-2 p-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded-lg" />
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="text-center py-8">
        <MessageCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <p className="text-muted-foreground font-bold">No conversations yet</p>
        <p className="text-sm text-muted-foreground mt-1">
          Messages will appear here once you start a food rescue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2 p-2">
      {conversations.map((conv) => {
        // Mapping MERN Aggregate fields to the UI
        const donationId = conv._id; // _id from $group is the donation_id
        const donationTitle = conv.donationInfo?.title || "Donation";
        const otherPartyId = conv.userInfo?._id;
        const otherPartyName = conv.userInfo?.organizationName || conv.userInfo?.fullName || "Unknown";
        const lastMessage = conv.lastMessage;
        const lastTimestamp = conv.lastTimestamp;

        return (
          <Card
            key={donationId}
            className={`cursor-pointer transition-all hover:bg-slate-50 border-slate-100 ${
              selectedDonationId === donationId ? "border-primary bg-primary/5 shadow-sm" : ""
            }`}
            onClick={() => onSelectConversation({
              donationId,
              donationTitle,
              otherPartyId,
              otherPartyName
            })}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10 border border-slate-200">
                  <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                    {getInitials(otherPartyName)}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-sm text-slate-900 truncate">
                      {otherPartyName}
                    </p>
                  </div>
                  
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70 truncate">
                    {donationTitle}
                  </p>
                  
                  <p className="text-sm text-slate-500 truncate mt-1">
                    {lastMessage}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[10px] font-bold text-slate-400">
                      {lastTimestamp ? formatDistanceToNow(new Date(lastTimestamp), { addSuffix: true }) : ""}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}