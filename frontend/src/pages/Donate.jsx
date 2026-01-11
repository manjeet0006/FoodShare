import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Fixed: Added Link
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils"; // Fixed: Added cn utility
import {
  Package, MapPin, Clock, FileText, Sparkles,
  ShieldCheck, ArrowRight, LocateFixed, Loader2
} from "lucide-react";

// ... the rest of your component remains the same
const foodTypes = [
  "Cooked Meals", "Fresh Produce", "Bakery Items", "Dairy Products",
  "Beverages", "Packaged Foods", "Mixed Items", "Other",
];

const blobVariants = {
  animate: (i) => ({
    x: [0, 40, -20, 0],
    y: [0, -50, 30, 0],
    scale: [1, 1.1, 0.95, 1],
    transition: { duration: 12 + i * 2, repeat: Infinity, ease: "easeInOut" },
  }),
};

export default function Donate() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [pickupAddress, setPickupAddress] = useState("");
  const [city, setCity] = useState("");
  const [pickupInstructions, setPickupInstructions] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- UPDATED GPS LOCATION LOGIC ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive"
      });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          // Reverse Geocoding using OpenStreetMap
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();

          if (data && data.address) {
            // 1. Extract the City specifically
            const cityName = data.address.city || data.address.town || data.address.village || data.address.county || "";

            // 2. Format the Full Address (Road, Suburb, City, State, Postcode)
            // Nominatim's display_name is very long (includes country), so we build a cleaner "Full Address"
            const addressParts = [];
            if (data.address.road) addressParts.push(data.address.road);
            if (data.address.suburb) addressParts.push(data.address.suburb);
            if (data.address.neighbourhood) addressParts.push(data.address.neighbourhood);
            if (cityName) addressParts.push(cityName);
            if (data.address.state) addressParts.push(data.address.state);
            if (data.address.postcode) addressParts.push(data.address.postcode);

            const fullFormattedAddress = addressParts.join(", ");

            setPickupAddress(fullFormattedAddress);
            setCity(cityName);

            toast({
              title: "Location detected!",
              description: `Address updated to ${cityName}.`,
            });
          }
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to fetch address details. Please enter manually.",
            variant: "destructive"
          });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast({
          title: "Permission Denied",
          description: "Please allow location access in your browser settings.",
          variant: "destructive"
        });
      },
      { enableHighAccuracy: true }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptedTerms) {
      toast({
        title: "Action Required",
        description: "Please accept the Terms & Conditions before publishing.",
        variant: "destructive"
      });
      return;
    }

    if (!profile || profile.role !== "donator") return;
    setLoading(true);

    try {
      await API.post("/donations", {
        donator_id: profile._id,
        title,
        description,
        food_type: foodType,
        quantity,
        pickup_address: pickupAddress,
        city,
        pickup_instructions: pickupInstructions,
        expires_at: new Date(expiresAt).toISOString(),
      });

      toast({ title: "Donation published!", description: "NGOs can now view your listing." });
      navigate("/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: error.response?.data?.error || "Failed to publish donation",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#FDFDFF] w-full">
      <div className="absolute top-5 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-10"
        >
          <div className="lg:col-span-2 space-y-8">
            <header className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                Publish <span className="text-primary">Donation.</span>
              </h1>
              <p className="text-slate-500 font-medium">Your surplus can change someone's day.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-lg space-y-10">
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary"><FileText className="h-5 w-5" /></div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">Food Details</h2>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Listing Title *</Label>
                  <Input id="title" placeholder="e.g., 20 Trays of Fresh Pasta" value={title} onChange={(e) => setTitle(e.target.value)} required className="h-14 bg-slate-100/40 border-none rounded-2xl px-6" />
                </div>

                {/* Add this block right after the Title Input */}
                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2"
                  >
                    Detailed Description *
                  </Label>
                  <textarea
                    id="description"
                    placeholder="Describe the items (e.g., ingredients, storage info, or specific contents)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="w-full min-h-[120px] bg-slate-100/40 border-none rounded-2xl px-6 py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-slate-100/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4"> {/* Forced side-by-side layout */}
                  {/* CATEGORY FIELD */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="foodType"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2"
                    >
                      Category *
                    </Label>
                    <Select value={foodType} onValueChange={setFoodType} required>
                      <SelectTrigger
                        className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 transition-all hover:bg-slate-100/60"
                      >
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>

                      <SelectContent
                        className="rounded-2xl bg-white border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden z-50"
                      >
                        {foodTypes.map((type) => (
                          <SelectItem
                            key={type}
                            value={type}
                            className="py-3 px-4 focus:bg-primary/5 focus:text-primary font-bold transition-colors cursor-pointer"
                          >
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* QUANTITY FIELD */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="quantity"
                      className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2"
                    >
                      Quantity *
                    </Label>
                    <Input
                      id="quantity"
                      placeholder="e.g., 50 servings"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      required
                      className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 text-slate-900 font-semibold placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-primary/20 transition-all hover:bg-slate-100/60"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-accent/10 rounded-xl text-accent"><MapPin className="h-5 w-5" /></div>
                    <h2 className="text-xl font-black text-slate-800 tracking-tight">Pickup Logistics</h2>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGetLocation}
                    disabled={gettingLocation}
                    className="text-primary font-bold hover:bg-primary/5 rounded-xl gap-2 active:scale-95 transition-all"
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LocateFixed className="h-4 w-4" />
                    )}
                    USE CURRENT GPS
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="pickupAddress" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Street Address *</Label>
                    <Input id="pickupAddress" placeholder="Full street address" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} required className="h-14 bg-slate-100/40 border-none rounded-2xl px-6" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">City *</Label>
                    <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="h-14 bg-slate-100/40 border-none rounded-2xl px-6" />
                  </div>
                </div>
                {/* Place this after the City Input */}
                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                    Pickup Instructions *
                  </Label>
                  <textarea
                    id="instructions"
                    placeholder="e.g., Please ring the bell at the back gate. Ask for Security Guard Rajesh."
                    value={pickupInstructions}
                    onChange={(e) => setPickupInstructions(e.target.value)}
                    required
                    className="w-full min-h-[80px] bg-slate-100/40 border-none rounded-2xl px-6 py-4 text-slate-900 font-medium placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 transition-all hover:bg-slate-100/60 resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Available Until *</Label>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={minDateTime} required className="h-14 pl-12 pr-6 bg-slate-100/40 border-none rounded-2xl focus:ring-primary/20" />
                  </div>
                </div>

              </div>
              {/* TERMS AND CONDITIONS CHECKBOX */}
              <div className="flex items-center space-x-3 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="h-6 w-6 rounded-lg border-primary/20 bg-white text-primary focus:ring-primary/20 cursor-pointer"
                />
                <Label
                  htmlFor="terms"
                  className="text-sm font-medium text-slate-600 leading-snug cursor-pointer select-none"
                >
                  I confirm that the food is fit for consumption and I agree to the{" "}
                  <Link to="/t&cs" target="_blank" className="text-primary font-black underline underline-offset-4 hover:text-indigo-600">
                    Terms & Conditions
                  </Link>
                  .
                </Label>
              </div>

              <Button
                type="submit"
                className={cn(
                  "w-full h-16 rounded-3xl bg-linear-to-r from-primary to-indigo-600 text-lg font-black shadow-lg border-none transition-all",
                  !acceptedTerms ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-primary/20 active:scale-95"
                )}
                disabled={loading || !acceptedTerms} // Disable button until checked
              >
                {loading ? "PUBLISHING..." : <span className="flex items-center gap-2">PUBLISH LISTING <ArrowRight className="h-5 w-5" /></span>}
              </Button>
            </form>
          </div>

          <aside className="space-y-6">
            <div className="p-8 bg-primary rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
              <Package className="absolute -right-4 -bottom-4 h-32 w-32 opacity-10 rotate-12" />
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="h-5 w-5 text-accent" />
                <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Safety First</span>
              </div>
              <h3 className="text-xl font-bold mb-4">Quality Control</h3>
              <ul className="space-y-4 text-sm font-medium opacity-90">
                <li className="flex gap-2"><span>•</span> Keep food at safe temperatures.</li>
                <li className="flex gap-2"><span>•</span> Use clean, leak-proof containers.</li>
                <li className="flex gap-2"><span>•</span> List potential allergens clearly.</li>
              </ul>
            </div>
          </aside>
        </motion.div>
      </main>
    </div>
  );
}