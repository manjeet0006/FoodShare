import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Clock, MapPin, Package, Building, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import API from "@/services/api";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import heroImage from "@/assets/hero-food-sharing.jpg";

const CATEGORY_IMAGES = {
    "Cooked Meals": "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=800",
    "Fresh Produce": "https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&q=80&w=800",
    "Bakery Items": "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800",
    "default": "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800"
};

export default function DonationDetails() {
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [donation, setDonation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDonation = async () => {
      try {
        setLoading(true);
        const { data } = await API.get(`/donations/${id}`);
        setDonation(data);
      } catch (error) {
        console.error("Failed to fetch donation details", error);
        toast({
          title: "Error",
          description: "Failed to load donation details.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchDonation();
  }, [id, toast]);

  const handleClaim = async () => {
    // This function can be implemented later
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Skeleton className="h-12 bg-slate-100/80 w-1/4 mb-4" />
          <Skeleton className="h-96 bg-slate-100/80 w-full rounded-lg mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-8 bg-slate-100/80 w-3/4" />
              <Skeleton className="h-24 bg-slate-100/80 w-full" />
              <Skeleton className="h-8 bg-slate-100/80 w-1/2" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 bg-slate-100/80 w-full" />
              <Skeleton className="h-12 bg-slate-100/80 w-full" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!donation) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Donation Not Found</h2>
          <p className="mt-2 text-lg text-slate-500">The donation you're looking for might have been claimed or no longer exists.</p>
          <Button asChild className="mt-6">
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to All Donations</Link>
          </Button>
        </div>
      </>
    );
  }

  const expiresAt = new Date(donation.expires_at);
  const isExpired = expiresAt < new Date();
  const showClaimButton = profile?.role === "receiver";

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button variant="ghost" className="mb-4" asChild>
            <Link to="/"><ArrowLeft className="h-4 w-4 mr-2" />Back to Listings</Link>
        </Button>
        <Card className="overflow-hidden">
          <div className="relative h-96 w-full">
            <img
              src={donation.image || CATEGORY_IMAGES[donation.food_type] || CATEGORY_IMAGES["default"] || heroImage}
              alt={donation.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 text-white">
              <h1 className="text-4xl font-black tracking-tight">{donation.title}</h1>
              <p className="text-xl font-medium">{donation.donator_id?.organizationName || "Private Donor"}</p>
            </div>
            <Badge className={`absolute top-4 right-4 ${isExpired ? 'bg-red-500' : 'bg-green-500'}`}>
              {donation.status}
            </Badge>
          </div>
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div>
                <h3 className="font-bold text-lg mb-2">Description</h3>
                <p className="text-muted-foreground">{donation.description || "No description provided."}</p>
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-bold text-lg mb-2">Quantity</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Package className="h-5 w-5 mr-2" />
                    <span>{donation.quantity}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Food Type</h3>
                  <div className="flex items-center text-muted-foreground">
                    <Badge>{donation.food_type}</Badge>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="bg-secondary/50 p-4">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-bold">Location</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-2" />
                        <span>{donation.pickup_address}, {donation.city}</span>
                    </div>
                </CardContent>
              </Card>
              <Card className="bg-secondary/50 p-4">
                <CardHeader className="p-0 pb-2">
                    <CardTitle className="text-sm font-bold">Expiration</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Clock className="h-4 w-4 mr-2" />
                        <span>{format(expiresAt, "MMMM d, yyyy 'at' h:mm a")}</span>
                    </div>
                </CardContent>
              </Card>
              {showClaimButton && donation.status === "available" && (
                <Button size="lg" className="w-full font-bold" onClick={handleClaim}>
                  Claim Donation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}