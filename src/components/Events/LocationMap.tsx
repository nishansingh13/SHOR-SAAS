import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Navigation, ExternalLink } from 'lucide-react';

interface LocationMapProps {
  venue: string;
  venueDetails?: {
    name: string;
    address: string;
    city: string;
    coordinates: { lat: number; lng: number };
  };
}

const LocationMap: React.FC<LocationMapProps> = ({ venue, venueDetails }) => {
  const hasCoordinates = venueDetails?.coordinates && 
    venueDetails.coordinates.lat !== 0 && 
    venueDetails.coordinates.lng !== 0;

  const openInMaps = () => {
    if (hasCoordinates) {
      const { lat, lng } = venueDetails!.coordinates;
      // Open in Google Maps
      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
    } else {
      // Fallback to search by venue name
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(venue)}`, '_blank');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden"
    >
      {/* Map Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-blue-700 text-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 mr-2" />
            <h3 className="font-semibold">Event Location</h3>
          </div>
          <motion.button
            onClick={openInMaps}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors flex items-center"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            <span className="text-sm">Open in Maps</span>
          </motion.button>
        </div>
      </div>

      {/* Map Content */}
      <div className="p-6">
        <div className="space-y-4">
          {/* Venue Name */}
          <div>
            <h4 className="font-semibold text-gray-900 text-lg">{venueDetails?.name || venue}</h4>
            {venueDetails?.address && (
              <p className="text-gray-600 mt-1">{venueDetails.address}</p>
            )}
          </div>

          {/* Interactive Map Placeholder */}
          {hasCoordinates ? (
            <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
              {/* Static Map using OpenStreetMap tiles */}
              <img
                src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-marker+f59e0b(${venueDetails!.coordinates.lng},${venueDetails!.coordinates.lat})/${venueDetails!.coordinates.lng},${venueDetails!.coordinates.lat},14/400x200@2x?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`}
                alt={`Map showing ${venue}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  // Fallback to OpenStreetMap if Mapbox fails
                  const target = e.target as HTMLImageElement;
                  target.src = `https://www.openstreetmap.org/export/embed.html?bbox=${venueDetails!.coordinates.lng-0.01},${venueDetails!.coordinates.lat-0.01},${venueDetails!.coordinates.lng+0.01},${venueDetails!.coordinates.lat+0.01}&layer=mapnik&marker=${venueDetails!.coordinates.lat},${venueDetails!.coordinates.lng}`;
                }}
              />
              
              {/* Map Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                <motion.div
                  className="bg-white rounded-lg p-3 shadow-lg"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center text-emerald-600">
                    <Navigation className="h-5 w-5 mr-2" />
                    <span className="font-medium">Click to view on map</span>
                  </div>
                </motion.div>
              </div>
            </div>
          ) : (
            <div className="h-48 bg-gradient-to-br from-emerald-100 to-blue-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
                <p className="text-gray-700 font-medium">{venue}</p>
                <p className="text-gray-500 text-sm mt-1">Click "Open in Maps" to view location</p>
              </div>
            </div>
          )}

          {/* Coordinates Display */}
          {hasCoordinates && (
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 text-gray-600 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Coordinates</span>
                </div>
                <span className="text-sm text-gray-600 font-mono">
                  {venueDetails!.coordinates.lat.toFixed(6)}, {venueDetails!.coordinates.lng.toFixed(6)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default LocationMap;
