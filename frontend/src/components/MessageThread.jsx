import { useEffect, useRef, useState } from "react";
import API from "@/services/api"; 
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Loader2 } from "lucide-react";
import { format, isValid } from "date-fns";
import { cn } from "@/lib/utils";

export function MessageThread({ donationId, otherPartyId, otherPartyName }) {
  const { user } = useAuth(); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!user || !donationId) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [donationId, user]);

  useEffect(() => {
    if (scrollRef.current) {
      const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const { data } = await API.get(`/messages/${donationId}`);
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // --- THE SEND LOGIC ---
  const handleSendMessage = async (e) => {
    // 1. Prevent page refresh (Crucial for React)
    if (e) e.preventDefault();
    
    // 2. Validation
    if (!newMessage.trim() || !user || !otherPartyId || sending) return;

    setSending(true);
    try {
      // 3. Payload with snake_case keys for MERN backend
      const { data } = await API.post("/messages", {
        donation_id: donationId,   
        receiver_id: otherPartyId, 
        content: newMessage.trim(),
      });

      // 4. Update UI instantly
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    } catch (error) {
      console.error("Message send failed:", error.response?.data || error.message);
    } finally {
      setSending(false);
    }
  };

  const getInitials = (name) => name?.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "??";

  return (
    <div className="flex flex-col h-full border rounded-4xl bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-slate-200">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
              {getInitials(otherPartyName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <span className="font-bold text-sm text-slate-900 block leading-none">{otherPartyName}</span>
            <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider">Online Chat</span>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4 bg-white" ref={scrollRef}>
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 opacity-30 italic text-sm">
                No messages yet. Say hello!
            </div>
          ) : (
            messages.map((message) => {
              const isOwn = message.sender_id === user?._id;
              const isSystem = message.content.includes("⚠️ ORDER CANCELLED");

              return (
                <div key={message._id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-2.5 shadow-sm",
                    isOwn ? "bg-primary text-white rounded-br-none" : "bg-slate-100 text-slate-800 rounded-bl-none",
                    isSystem && "bg-rose-50 border border-rose-100 text-rose-700 italic text-center w-full max-w-full rounded-xl"
                  )}>
                    <p className="text-sm leading-relaxed">{message.content}</p>
                    <p className="text-[9px] mt-1 font-black uppercase opacity-60">
                      {(() => {
                        const d = new Date(message.created_at || message.createdAt);
                        return isValid(d) ? format(d, "h:mm a") : "";
                      })()}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Input Field: onSubmit handles the button click! */}
      <form onSubmit={handleSendMessage} className="p-4 border-t bg-slate-50/30 flex gap-2">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={sending}
          className="flex-1 rounded-xl border-slate-200 focus-visible:ring-primary h-11 bg-white"
        />
        <Button 
          type="submit" // Triggers handleSendMessage via form onSubmit
          size="icon" 
          disabled={sending || !newMessage.trim()}
          className="h-11 w-11 rounded-xl shadow-lg transition-all active:scale-95"
        >
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </form>
    </div>
  );
}