import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { Header } from "@/components/Header";
import { ConversationList } from "@/components/ConversationList";
import { MessageThread } from "@/components/MessageThread";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext"; // MERN: Custom hook
import { MessageCircle, User, ChevronLeft, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Messages() {
  const { user, loading } = useAuth(); // MERN: 'user' contains MongoDB user data
  const [searchParams] = useSearchParams();
  
  // Initialize selected conversation from URL params if available
  const [selected, setSelected] = useState(() => {
    const donationId = searchParams.get("donationId");
    const otherPartyId = searchParams.get("otherPartyId");
    const otherPartyName = searchParams.get("otherPartyName");
    const donationTitle = searchParams.get("donationTitle");
    
    if (donationId && otherPartyId && otherPartyName) {
      return { 
        donationId, 
        otherPartyId, 
        otherPartyName, 
        donationTitle: donationTitle || "Donation" 
      };
    }
    return null;
  });

  if (loading) return <div className="min-h-screen bg-slate-50" />;
  if (!user) return <Navigate to="/login" />;

  return (
    // MERN FIX: Added 'w-full' and 'overflow-x-hidden' to resolve the right-side gap
    <div className="min-h-screen pb-15 bg-[#FDFDFF] relative w-full overflow-x-hidden flex flex-col">
      
      {/* BACKGROUND MESH GRADIENT */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] left-[-5%] w-[35%] h-[35%] bg-blue-400/5 rounded-full blur-[100px]" />
      </div>

      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-6xl flex flex-col h-[calc(100vh-80px)]">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-4xl font-black tracking-tighter text-slate-900 flex items-center gap-3 mt-8">
            Messages
            <span className="text-xs font-black uppercase tracking-[0.2em] bg-primary/10 text-primary px-3 py-1 rounded-full">
              Live Chat
            </span>
          </h1>
        </motion.div>

        {/* UNIFIED MESSAGING HUB */}
        <div className="flex-1 bg-white/70 backdrop-blur-xl border border-white/50 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row mb-6">
          
          {/* SIDEBAR: Conversation List */}
          <aside className={cn(
            "w-full md:w-80 border-r border-slate-100 flex flex-col bg-white/40",
            selected ? "hidden md:flex" : "flex"
          )}>
            <div className="p-6 border-b border-slate-100 bg-white/20">
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Conversations</h2>
            </div>
            <div className="flex-1 overflow-y-auto no-scrollbar">
              <ConversationList
                onSelectConversation={(conv) => setSelected(conv)}
                selectedDonationId={selected?.donationId}
              />
            </div>
          </aside>

          {/* MAIN: Message Thread */}
          <section className={cn(
            "flex-1 flex flex-col min-h-0",
            !selected ? "hidden md:flex" : "flex"
          )}>
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div 
                  key={selected.donationId}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex flex-col h-full"
                >
                  {/* Thread Header */}
                  <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-white/30">
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => setSelected(null)}
                        className="md:hidden p-2 hover:bg-slate-100 rounded-full transition-colors"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                        <User className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-black text-slate-900 leading-none mb-1">{selected.otherPartyName}</h3>
                        <p className="text-sm text-slate-400 font-bold tracking-tight">Discussion: {selected.donationTitle}</p>
                      </div>
                    </div>
                  </div>

                  {/* Message Area */}
                  <div className="flex-1 overflow-hidden">
                    <MessageThread
                      donationId={selected.donationId}
                      otherPartyId={selected.otherPartyId}
                      otherPartyName={selected.otherPartyName}
                    />
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex-1 flex flex-col items-center justify-center text-center p-12"
                >
                  <div className="h-24 w-24 rounded-4xl bg-slate-50 flex items-center justify-center mb-6 shadow-inner">
                    <MessageCircle className="h-10 w-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your Inbox</h3>
                  <p className="text-slate-400 font-medium max-w-60 mt-2">
                    Select a conversation from the sidebar to coordinate your food rescue.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>
    </div>
  );
}