import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
// Added Navigation and ExternalLink icons
import { Package, MapPin, Navigation, ExternalLink } from "lucide-react"; 
import L from "leaflet";
import { renderToStaticMarkup } from "react-dom/server";

// --- 1. DEFINE CUSTOM ICONS (Same as before) ---
const createCustomIcon = (iconComponent, color = "bg-blue-600") => {
  const iconMarkup = renderToStaticMarkup(iconComponent);
  return L.divIcon({
    html: `
      <div class="relative flex items-center justify-center w-10 h-10 transform -translate-x-1/2 -translate-y-1/2">
        <div class="${color} w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white">
          ${iconMarkup}
        </div>
        <div class="absolute -bottom-1 w-2 h-2 bg-black/20 rotate-45 transform skew-x-12 blur-[1px]"></div>
      </div>
    `,
    className: "custom-leaflet-icon",
    iconSize: [40, 40],
    iconAnchor: [20, 35],
    popupAnchor: [0, -30],
  });
};

const donationIcon = createCustomIcon(<Package size={16} />, "bg-emerald-600");
const userIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center w-6 h-6">
      <span class="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-400 opacity-75"></span>
      <span class="relative inline-flex h-4 w-4 rounded-full bg-blue-600 border-2 border-white shadow-sm"></span>
    </div>
  `,
  className: "custom-user-icon",
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5, easeLinearity: 0.25 });
    }
  }, [center, map]);
  return null;
}

export function DonationMap({ donations = [], userLocation }) {
  const defaultCenter = [26.9124, 75.7873];
  const center = userLocation ? [userLocation.lat, userLocation.lng] : defaultCenter;

  return (
    <div className="h-full w-full relative z-0 rounded-xl overflow-hidden shadow-sm border border-slate-200">
      <MapContainer 
        center={center} 
        zoom={13} 
        scrollWheelZoom={false} 
        className="h-full w-full font-sans"
        key={userLocation ? "user-map" : "default-map"} 
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <ChangeView center={center} />

        {/* Your Location Pin */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
             <Tooltip direction="top" offset={[0, -10]} opacity={1} className="font-bold text-xs">
              You
            </Tooltip>
          </Marker>
        )}

        {/* Donation Pins */}
        {donations.map((d) => {
          if (!d.location?.coordinates) return null;
          const [lng, lat] = d.location.coordinates; 

          // --- GOOGLE MAPS URL GENERATORS ---
          
          // 1. View Location on Map
          const googleViewUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
          
          // 2. Get Directions (Uses user location if available, otherwise just sets destination)
          const googleDirectionsUrl = userLocation 
            ? `https://www.google.com/maps/dir/?api=1&origin=${userLocation.lat},${userLocation.lng}&destination=${lat},${lng}&travelmode=driving`
            : `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

          return (
            <Marker key={d._id} position={[lat, lng]} icon={donationIcon}>
              <Tooltip 
                direction="bottom" 
                offset={[0, 10]} 
                opacity={1} 
                className="custom-tooltip font-semibold text-slate-700 text-xs px-2 py-1 shadow-sm"
              >
                {d.title}
              </Tooltip>

              <Popup className="custom-popup">
                {/* Increased width to fit buttons */}
                <div className="min-w-[240px] pt-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-base text-slate-800 leading-tight">{d.title}</h3>
                    <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full border border-slate-200">
                      {d.food_type}
                    </span>
                  </div>
                  
                  <div className="text-sm text-slate-500 mb-3 flex items-center gap-2">
                    <Package size={14} />
                    <span>{d.quantity}</span>
                  </div>

                  {d.distance && (
                     <p className="text-xs font-medium text-emerald-600 mb-3 flex items-center gap-1">
                       <MapPin size={12} />
                       {(d.distance / 1000).toFixed(1)} km away
                     </p>
                  )}
                  
                  {/* --- ACTION BUTTONS --- */}
                  <div className="flex flex-col gap-2 mt-2">
                    {/* Primary Action: View Details in App */}
                    <Button size="sm" className="w-full h-8 text-xs bg-slate-900" asChild>
                      <Link to={`/donations/${d._id}`}>View Details</Link>
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      {/* Secondary Action: Get Directions */}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="h-8 text-[10px] px-1 text-blue-600 border-blue-100 hover:bg-blue-50"
                        onClick={() => window.open(googleDirectionsUrl, '_blank')}
                      >
                        <Navigation size={12} className="mr-1" />
                        Directions
                      </Button>

                      {/* Tertiary Action: View on G-Maps */}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 text-[10px] px-1 text-slate-500 hover:text-slate-900"
                        onClick={() => window.open(googleViewUrl, '_blank')}
                      >
                        <ExternalLink size={12} className="mr-1" />
                        G-Maps
                      </Button>
                    </div>
                  </div>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
      
      {/* Legend */}
      <div className="absolute bottom-5 left-5 z-[1000] bg-white/90 backdrop-blur-sm p-3 rounded-lg shadow-md border border-slate-200 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
          <span className="text-slate-600 font-medium">Available Food</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-slate-600 font-medium">You</span>
        </div>
      </div>
    </div>
  );
}