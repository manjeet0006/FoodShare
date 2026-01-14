import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  Package, MapPin, Clock, FileText, Sparkles,
  ShieldCheck, ArrowRight, LocateFixed, Loader2,
  Camera, Upload, X // Added Camera, Upload, X for the image UI
} from "lucide-react";

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
  const [landmark, setLandmark] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);
  const [coords, setCoords] = useState(null); // { lat: ..., lng: ... }


  // --- NEW: IMAGE STATE ---
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const { profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // --- NEW: FILE HANDLER ---
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  // --- GPS LOGIC (Unchanged) ---
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Not Supported", description: "GPS not supported.", variant: "destructive" });
      return;
    }

    setGettingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        try {
          // zoom=18 and addressdetails=1 are mandatory for plot-level data
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();

          if (data && data.address) {
            const a = data.address;

            // 1. Detect City
            const cityValue = a.city || a.town || a.city_district || "Jaipur";

            // 2. THE "MINOR-TO-MINOR" BUILDER
            const addressParts = [];

            // Specific Building/Plot Details
            if (a.amenity) addressParts.push(`Near ${a.amenity}`);
            if (a.building) addressParts.push(a.building);
            if (a.house_number) addressParts.push(`Plot/House No. ${a.house_number}`);
            if (a.house_name) addressParts.push(a.house_name);

            // Road and Local Path Details
            if (a.road) addressParts.push(a.road);
            if (a.industrial) addressParts.push(`${a.industrial} Area`);
            if (a.commercial) addressParts.push(`${a.commercial} Complex`);

            // Local Sub-Area (Colony/Sector)
            if (a.neighbourhood) addressParts.push(a.neighbourhood);
            if (a.allotments) addressParts.push(`Allotment ${a.allotments}`);
            if (a.suburb && a.suburb !== a.neighbourhood) addressParts.push(a.suburb);

            // Minor Landmarks
            if (a.landmark) addressParts.push(a.landmark);
            if (a.attraction) addressParts.push(a.attraction);

            // 3. FINAL STRING CLEANUP
            let fullStreetAddress = addressParts.join(", ");

            // Remove the generic administrative noise that makes it unidentifiable
            fullStreetAddress = fullStreetAddress
              .replace(/Tehsil/gi, "")
              .replace(/District/gi, "")
              .replace(/Rajasthan/gi, "")
              .replace(/302025/gi, "")
              .replace(/  +/g, ' ')
              .trim();

            // Fallback if the pinpoint details above are missing in OSM
            if (addressParts.length < 2) {
              // Slicing display_name to remove the State/Country at the end
              fullStreetAddress = data.display_name.split(',').slice(0, 5).join(', ');
            }

            setPickupAddress(fullStreetAddress);
            setCity(cityValue);

            toast({
              title: "Pinpoint Located!",
              description: accuracy > 50
                ? "Low GPS accuracy. Please verify Plot No."
                : "High-accuracy location locked.",
              variant: accuracy > 50 ? "warning" : "default"
            });
          }
        } catch (error) {
          toast({ title: "Error", description: "Failed to fetch details.", variant: "destructive" });
        } finally {
          setGettingLocation(false);
        }
      },
      (error) => {
        setGettingLocation(false);
        toast({ title: "GPS Error", description: "Please enable High Accuracy/Location Services.", variant: "destructive" });
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // Increased timeout to 20s to find more satellites
        maximumAge: 0
      }
    );
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Client-side Validation
    if (!acceptedTerms) {
      toast({
        title: "Action Required",
        description: "Please accept the Terms & Conditions.",
        variant: "destructive"
      });
      return;
    }

    if (!coords) {
      toast({
        title: "Location Missing",
        description: "Please use the 'USE CURRENT GPS' button to pinpoint your location.",
        variant: "destructive"
      });
      return;
    }

    // 2. Prepare Data
    setLoading(true);
    const data = new FormData();

    // Standard Fields
    data.append("title", title);
    data.append("description", description);
    data.append("food_type", foodType);
    data.append("quantity", quantity);
    data.append("pickup_address", pickupAddress);
    data.append("city", city);
    data.append("pickup_instructions", pickupInstructions);
    data.append("expires_at", new Date(expiresAt).toISOString());

    // --- NEW: Geospatial Location Data ---
    // Note: MongoDB/GeoJSON requires Longitude first, then Latitude
    data.append("location[type]", "Point");
    data.append("location[coordinates][0]", coords.lng); // Longitude
    data.append("location[coordinates][1]", coords.lat); // Latitude

    // Image Upload
    if (file) {
      data.append("image", file);
    }

    try {
      // 3. API Request
      // Axios automatically sets 'Content-Type: multipart/form-data' for FormData
      await API.post("/donations", data);

      toast({
        title: "Success! 🎉",
        description: "Your donation is now live and sorted by proximity."
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Submission Error:", err);
      toast({
        title: "Submission Failed",
        description: err.response?.data?.message || "There was an error publishing your listing.",
        variant: "destructive",
      });
      setLoading(false); // Reset loading only on error so the user can try again
    }
  };

  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16);

  return (
    <div className="min-h-screen relative overflow-hidden pb-20 bg-[#FDFDFF] w-full">
      <div className="absolute top-5 left-0 w-full h-full pointer-events-none -z-10 overflow-hidden">
        <motion.div custom={1} variants={blobVariants} animate="animate" className="absolute top-[-10%] right-[-5%] w-[60%] h-[60%] bg-primary/10 rounded-full blur-[140px]" />
        <motion.div custom={2} variants={blobVariants} animate="animate" className="absolute bottom-[-10%] left-[-5%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      </div>

      <Header />

      <main className="container mx-auto px-4 py-12 max-w-5xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8 mt-8">
            <header className="space-y-2">
              <h1 className="text-4xl font-black tracking-tighter text-slate-900 leading-none">
                Publish <span className="text-primary">Donation.</span>
              </h1>
              <p className="text-slate-500 font-medium">Your surplus can change someone's day.</p>
            </header>

            <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-3xl p-8 md:p-12 rounded-[3rem] border border-white/60 shadow-lg space-y-10">

              {/* --- NEW: IMAGE UPLOAD UI --- */}
              <div className="space-y-6">

                {/* 🔹 FOOD DETAILS HEADER (UNCHANGED) */}
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
                    <FileText className="h-5 w-5" />
                  </div>
                  <h2 className="text-xl font-black text-slate-800 tracking-tight">
                    Food Details
                  </h2>
                </div>

                {/* 🔹 CONTENT LAYOUT */}
                <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8 items-start">

                  {/* LEFT → PHOTO UPLOAD */}
                  <div className="space-y-4">
                    <Label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                      Food Photo *
                    </Label>

                    <div className="relative group h-[220px] w-[220px] rounded-[2rem] border-2 border-dashed border-primary/20 bg-slate-100/50 overflow-hidden flex items-center justify-center transition-all hover:border-primary/50 hover:bg-slate-100/80">
                      <AnimatePresence mode="wait">
                        {preview ? (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0"
                          >
                            <img
                              src={preview}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />

                            {/* REMOVE OVERLAY */}
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                  setFile(null);
                                  setPreview(null);
                                }}
                                className="rounded-full shadow-lg"
                              >
                                <X className="w-4 h-4 mr-2" />
                                Remove Photo
                              </Button>
                            </div>
                          </motion.div>
                        ) : (
                          <div className="flex flex-col items-center gap-3 text-slate-400">
                            <div className="p-4 bg-white rounded-full shadow-sm">
                              <Camera size={32} className="text-primary" />
                            </div>

                            <div className="text-center">
                              <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                Click to Upload
                              </p>
                              <p className="text-[10px] font-medium mt-1">
                                JPEG / PNG • Max 5MB
                              </p>
                            </div>

                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* RIGHT → TITLE + DESCRIPTION */}
                  <div className="space-y-6">

                    {/* TITLE */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="title"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2"
                      >
                        Listing Title *
                      </Label>
                      <Input
                        id="title"
                        placeholder="e.g., 20 Trays of Fresh Pasta"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                        className="h-14 bg-slate-100/40 border-none rounded-2xl px-6"
                      />
                    </div>

                    {/* DESCRIPTION */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="description"
                        className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2"
                      >
                        Detailed Description *
                      </Label>
                      <textarea
                        id="description"
                        placeholder="Describe ingredients, storage, quantity, etc."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full min-h-[140px] bg-slate-100/40 border-none rounded-2xl px-6 py-4 resize-none focus:ring-2 focus:ring-primary/20 transition-all"
                      />
                    </div>

                  </div>
                </div>
              </div>



              {/* EXISTING FIELDS */}
              <div className="space-y-6">

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="foodType" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Category *</Label>
                    <Select value={foodType} onValueChange={setFoodType} required>
                      <SelectTrigger className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 text-slate-900 font-bold focus:ring-2 focus:ring-primary/20 transition-all hover:bg-slate-100/60">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl bg-white border border-slate-100 shadow-2xl z-50">
                        {foodTypes.map((type) => (
                          <SelectItem key={type} value={type} className="py-3 px-4 font-bold cursor-pointer">{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Quantity *</Label>
                    <Input id="quantity" placeholder="e.g., 50 servings" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 text-slate-900 font-semibold" />
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
                    className={cn(
                      "text-primary bg-slate-100/80 font-bold rounded-xl gap-2 transition-all",
                      gettingLocation && "animate-pulse" // Subtle visual cue
                    )}
                  >
                    {gettingLocation ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LocateFixed className="h-4 w-4" />
                    )}
                    {gettingLocation ? "LOCATING..." : "USE CURRENT GPS"}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="md:col-span-2 space-y-2">
                    <Label htmlFor="pickupAddress" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">
                      Street Address, Plot & Road No. *
                    </Label>
                    <Input
                      id="pickupAddress"
                      placeholder="e.g. Plot 42, Near Water Tank, Road No. 5, Sanganer"
                      value={pickupAddress}
                      onChange={(e) => setPickupAddress(e.target.value)}
                      required
                      className="h-14 bg-slate-100/40 border-none rounded-2xl px-6 font-bold"
                    />
                    <p className="text-[10px] text-primary/70 ml-4 font-bold italic animate-pulse">
                      Verify your Plot No. and Road No. above for a faster pickup.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">City *</Label>
                    <Input id="city" placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} required className="h-14 bg-slate-100/40 border-none rounded-2xl px-6" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="instructions" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Pickup Instructions *</Label>
                  <textarea id="instructions" placeholder="e.g., Please ring the bell at the back gate." value={pickupInstructions} onChange={(e) => setPickupInstructions(e.target.value)} required className="w-full min-h-[80px] bg-slate-100/40 border-none rounded-2xl px-6 py-4 text-slate-900 font-medium resize-none" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt" className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 ml-2">Available Until *</Label>
                  <div className="relative group">
                    <Clock className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input id="expiresAt" type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} min={minDateTime} required className="h-14 pl-12 pr-6 bg-slate-100/40 border-none rounded-2xl focus:ring-primary/20" />
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-3 p-6 bg-primary/5 rounded-[2rem] border border-primary/10 transition-all hover:bg-primary/10">
                <input type="checkbox" id="terms" checked={acceptedTerms} onChange={(e) => setAcceptedTerms(e.target.checked)} className="h-6 w-6 rounded-lg border-primary/20 bg-white text-primary focus:ring-primary/20 cursor-pointer" />
                <Label htmlFor="terms" className="text-sm font-medium text-slate-600 leading-snug cursor-pointer select-none">
                  I confirm that the food is fit for consumption and I agree to the <Link to="/t&cs" target="_blank" className="text-primary font-black underline underline-offset-4 hover:text-indigo-600">Terms & Conditions</Link>.
                </Label>
              </div>

              <Button type="submit" className={cn("w-full h-16 rounded-3xl bg-linear-to-r from-primary to-indigo-600 text-lg font-black shadow-lg border-none transition-all", !acceptedTerms ? "opacity-50 grayscale cursor-not-allowed" : "hover:shadow-primary/20 active:scale-95")} disabled={loading || !acceptedTerms}>
                {loading ? "PUBLISHING..." : <span className="flex items-center gap-2">PUBLISH LISTING <ArrowRight className="h-5 w-5" /></span>}
              </Button>
            </form>
          </div>

          <aside className="space-y-6 mt-32">
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