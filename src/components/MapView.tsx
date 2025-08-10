import React, { useEffect, useRef, useState } from 'react';
import type { Site } from '../types';

const L = () => import('leaflet');

export const MapView: React.FC<{
  sites: Site[];
  selectedId?: string;
  onSelect: (id: string) => void;
  userPos?: { lat: number; lng: number } | null;
}> = ({ sites, selectedId, onSelect, userPos }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [map, setMap] = useState<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circlesRef = useRef<any[]>([]);

  // init
  useEffect(() => {
    let mapInst: any;
    let leaflet: any;

    (async () => {
      leaflet = (await L()).default;
      if (!ref.current) return;

      const startLat = sites[0]?.lat ?? 45;
      const startLng = sites[0]?.lng ?? 11;

      mapInst = leaflet.map(ref.current, { zoomControl: true }).setView([startLat, startLng], 13);
      leaflet
        .tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OSM' })
        .addTo(mapInst);

      // markers + geofence
      sites.forEach((s) => {
        const m = leaflet.marker([s.lat, s.lng]).addTo(mapInst).on('click', () => onSelect(s.id));
        markersRef.current.push(m);
        const c = leaflet.circle([s.lat, s.lng], { radius: s.radius_meters, color: '#38bdf8' }).addTo(mapInst);
        circlesRef.current.push(c);
      });

      setMap(mapInst);

      // importante: sistema le dimensioni dopo il mount
      setTimeout(() => mapInst.invalidateSize(), 0);
    })();

    return () => {
      // cleanup completo
      markersRef.current.forEach((m) => m.remove());
      circlesRef.current.forEach((c) => c.remove());
      markersRef.current = [];
      circlesRef.current = [];
      mapInst?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ridisegna marker utente senza crearne di nuovi ogni volta
  useEffect(() => {
    if (!map || !userPos) return;
    (async () => {
      const leaflet = (await L()).default;
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng([userPos.lat, userPos.lng]);
      } else {
        userMarkerRef.current = leaflet
          .circleMarker([userPos.lat, userPos.lng], { radius: 6, color: '#22d3ee' })
          .addTo(map);
      }
    })();
  }, [map, userPos]);

  // reagisci ai resize (iOS/Android barra indirizzi)
  useEffect(() => {
    if (!map) return;
    const h = () => map.invalidateSize();
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, [map]);

  return (
    <div
      ref={ref}
      className="h-72 w-full rounded-2xl overflow-hidden border border-white/10"
      /* su mobile puoi fare h-64 se vuoi la card più compatta */
    />
  );
};
