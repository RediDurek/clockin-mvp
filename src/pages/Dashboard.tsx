import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useUser } from '../contexts/UserContext';
import type { Site, Shift } from '../adapters/StorageAdapter';
import MapView from '../components/MapView';
import TimeClock from '../components/TimeClock';
import ChatDock from '../components/ChatDock';

const Dashboard: React.FC = () => {
  const storage = useStorage();
  const { user, signOut } = useUser();
  const navigate = useNavigate();
  const [sites, setSites] = useState<Site[]>([]);
  const [selectedSite, setSelectedSite] = useState<Site | null>(null);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  const [withinRadius, setWithinRadius] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);

  const chatEndpoint = (import.meta as any).env.VITE_CHAT_API_BASE ?? '';

  useEffect(() => {
    // Load sites
    storage.listSites().then(setSites);
  }, [storage]);

  useEffect(() => {
    // Watch user location
    if (!navigator.geolocation) {
      console.warn('Geolocation not supported');
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      pos => {
        setUserPos([pos.coords.latitude, pos.coords.longitude]);
      },
      err => {
        console.warn('Geolocation error', err);
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleStart = async () => {
    if (!user || !selectedSite) return;
    const shift = await storage.startShift(selectedSite.id, user.id);
    setCurrentShift(shift);
  };

  const handlePause = async () => {
    if (!currentShift) return;
    await storage.pauseShift(currentShift.id);
    // update shift object to reflect new pause
    setCurrentShift({ ...currentShift, pauses: [...currentShift.pauses, { start: Date.now() }] });
  };

  const handleResume = async () => {
    if (!currentShift) return;
    await storage.resumeShift(currentShift.id);
    const updatedPauses = currentShift.pauses.slice();
    const last = updatedPauses[updatedPauses.length - 1];
    if (last && !last.end) {
      last.end = Date.now();
    }
    setCurrentShift({ ...currentShift, pauses: updatedPauses });
  };

  const handleEnd = async () => {
    if (!currentShift || !selectedSite) return;
    const finished = await storage.endShift(currentShift.id);
    setCurrentShift({ ...finished });
    // Show summary and optionally share via WhatsApp
    const totalMs = finished.endedAt! - finished.startedAt;
    // Dynamically import the formatting helpers to avoid circular deps
    const { formatDuration, totalPauseMs } = await import('../utils/time');
    const pauseMs = totalPauseMs(finished.pauses);
    const totalFormatted = formatDuration(totalMs - pauseMs);
    const pauseFormatted = formatDuration(pauseMs);
    const message = `Turno del ${new Date(finished.startedAt).toLocaleDateString()}\nCantiere: ${selectedSite.name}\nInizio: ${new Date(
      finished.startedAt,
    ).toLocaleTimeString()}\nFine: ${new Date(finished.endedAt!).toLocaleTimeString()}\nTotale: ${totalFormatted}\nPause: ${pauseFormatted}`;
    // Determine whether to open WhatsApp or fallback to manual share
    const server = (import.meta as any).env.VITE_WHATSAPP_SERVER_BASE;
    if (server) {
      try {
        await fetch(`${server}/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: message }),
        });
      } catch (err) {
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
      }
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    }
  };

  const handleSignOut = () => {
    signOut();
    navigate('/');
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Dashboard</h2>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => navigate('/reports')}
        >
          Rapporti
        </button>
      </div>
      <MapView
        sites={sites}
        selectedSite={selectedSite}
        onSelectSite={site => {
          setSelectedSite(site);
        }}
        userPosition={userPos}
        onWithinRadiusChange={setWithinRadius}
      />
      <TimeClock
        selectedSite={selectedSite}
        withinRadius={withinRadius}
        shift={currentShift}
        onStart={handleStart}
        onPause={handlePause}
        onResume={handleResume}
        onEnd={handleEnd}
      />
      {/* Chat dock for sending messages/photos to the server.
          Images are not persisted; they are sent directly to the endpoint. */}
      <ChatDock endpoint={chatEndpoint} />
      <button
        className="mt-4 text-red-500 hover:underline text-sm"
        onClick={handleSignOut}
      >
        Esci
      </button>
    </div>
  );
};

export default Dashboard;
