import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Use CDN URLs for marker icons
const DefaultIcon = L.icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

interface MapComponentProps {
  pickupCoords?: [number, number];
  dropCoords?: [number, number];
  routePoints?: [number, number][];
}

const FitBounds: React.FC<{ pickupCoords?: [number, number]; dropCoords?: [number, number]; routePoints?: [number, number][] }> = ({ pickupCoords, dropCoords, routePoints }) => {
  const map = useMap();
  
  React.useEffect(() => {
    if (routePoints && routePoints.length > 0) {
      const bounds = L.latLngBounds(routePoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords && dropCoords) {
      const bounds = L.latLngBounds([pickupCoords, dropCoords]);
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (pickupCoords) {
      map.setView(pickupCoords, 13);
    }
  }, [pickupCoords, dropCoords, routePoints, map]);

  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ pickupCoords, dropCoords, routePoints }) => {
  const center: [number, number] = pickupCoords || [12.9716, 77.5946]; // Default to Bangalore

  return (
    <MapContainer center={center} zoom={13} zoomControl={false} attributionControl={false} style={{ height: '300px', width: '100%', borderRadius: '1rem' }}>
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      />
      <FitBounds pickupCoords={pickupCoords} dropCoords={dropCoords} routePoints={routePoints} />
      {pickupCoords && (
        <Marker position={pickupCoords}>
          <Popup>Pickup Location</Popup>
        </Marker>
      )}
      {dropCoords && (
        <Marker position={dropCoords}>
          <Popup>Drop Location</Popup>
        </Marker>
      )}
      {routePoints && routePoints.length > 0 ? (
        <Polyline 
          positions={routePoints} 
          color="#F27D26" 
          weight={5}
          opacity={0.8}
        />
      ) : pickupCoords && dropCoords && (
        <Polyline 
          positions={[pickupCoords, dropCoords]} 
          color="#F27D26" 
          weight={4}
          opacity={0.7}
          dashArray="10, 10"
        />
      )}
    </MapContainer>
  );
};

export default MapComponent;
