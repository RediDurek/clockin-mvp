import React, { useEffect, useState } from 'react';
import type { Site } from '../adapters/StorageAdapter';
import { isInsideRadius } from '../utils/geo';

// Because Leaflet uses window, we lazy load react-leaflet in the browser only.
const MapView: React.FC<{
  sites: Site[];
  selectedSite: Site | null;
  onSelectSite: (site: Site) => void;
  userPosition: [number, number] | null;
  onWithinRadiusChange?: (within: boolean) => void;
}> = ({ sites, selectedSite, onSelectSite, userPosition, onWithinRadiusChange }) => {
  const [RL, setRL] = useState<any>(null);
  const [L, setL] = useState<any>(null);

  // Load modules client-side
  useEffect(() => {
    let mounted = true;
    (async () => {
      const [reactLeaflet, leaflet] = await Promise.all([
        import('react-leaflet'),
        import('leaflet'),
      ]);
      // Fix default icon paths when using parcel/vite
      // @ts-ignore
      delete leaflet.Icon.Default.prototype._getIconUrl;
      leaflet.Icon.Default.mergeOptions({
        iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png',
      });
      if (mounted) {
        setRL(reactLeaflet);
        setL(leaflet);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Compute geofence check whenever user position or selected site changes
  useEffect(() => {
    if (!selectedSite || !userPosition || !onWithinRadiusChange) return;
    const within = isInsideRadius(
      userPosition[0],
      userPosition[1],
      selectedSite.lat,
      selectedSite.lng,
      selectedSite.radius,
    );
    onWithinRadiusChange(within);
  }, [selectedSite, userPosition, onWithinRadiusChange]);

  if (!RL || !L) return <div className="flex items-center justify-center h-64">Loading map...</div>;

  const { MapContainer, TileLayer, Marker, Circle, Popup } = RL;
  const center =
    userPosition ??
    (selectedSite ? [selectedSite.lat, selectedSite.lng] : [45.4064, 11.8777]) as [number, number];

  return (
    <MapContainer center={center} zoom={16} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />
      {sites.map(site => (
        <Marker
          key={site.id}
          position={[site.lat, site.lng] as [number, number]}
          eventHandlers={{
            click: () => onSelectSite(site),
          }}
        >
          <Popup>
            <div className="text-sm">
              <strong>{site.name}</strong>
            </div>
          </Popup>
        </Marker>
      ))}
      {selectedSite && (
        <Circle
          center={[selectedSite.lat, selectedSite.lng] as [number, number]}
          radius={selectedSite.radius}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
        />
      )}
      {userPosition && (
        <Marker position={userPosition as [number, number]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};

export default MapView;
