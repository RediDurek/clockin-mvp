import React from 'react';
import type { Site, Shift } from '../adapters/StorageAdapter';
import { formatDuration, totalPauseMs } from '../utils/time';

interface TimeClockProps {
  selectedSite: Site | null;
  withinRadius: boolean;
  shift: Shift | null;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onEnd: () => void;
}

const TimeClock: React.FC<TimeClockProps> = ({
  selectedSite,
  withinRadius,
  shift,
  onStart,
  onPause,
  onResume,
  onEnd,
}) => {
  // Determine if currently paused by checking last pause without end
  const isPaused = Boolean(
    shift &&
      shift.pauses.length > 0 &&
      shift.pauses[shift.pauses.length - 1] &&
      shift.pauses[shift.pauses.length - 1].end === undefined,
  );
  const started = Boolean(shift);
  const ended = Boolean(shift && shift.endedAt);

  // Compute durations
  let totalMs = 0;
  let pauseMs = 0;
  if (shift) {
    const end = shift.endedAt ?? Date.now();
    totalMs = end - shift.startedAt;
    pauseMs = totalPauseMs(shift.pauses);
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="font-semibold">
          Sito selezionato: {selectedSite ? selectedSite.name : 'Nessuno'}
        </p>
        {shift && (
          <p className="text-sm">
            Iniziato alle: {new Date(shift.startedAt).toLocaleTimeString()} • Totale:{' '}
            {formatDuration(totalMs - pauseMs)}{' '}
            {pauseMs > 0 && `(Pause: ${formatDuration(pauseMs)})`}
          </p>
        )}
      </div>
      {!started && (
        <button
          className="px-4 py-2 bg-green-600 text-white rounded w-full disabled:bg-green-300"
          onClick={onStart}
          disabled={!withinRadius || !selectedSite}
        >
          Inizia
        </button>
      )}
      {started && !ended && (
        <>
          {!isPaused ? (
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded w-full disabled:bg-yellow-300"
              onClick={onPause}
              disabled={!withinRadius}
            >
              Pausa
            </button>
          ) : (
            <button
              className="px-4 py-2 bg-yellow-500 text-white rounded w-full disabled:bg-yellow-300"
              onClick={onResume}
              disabled={!withinRadius}
            >
              Riprendi
            </button>
          )}
          <button
            className="px-4 py-2 bg-red-600 text-white rounded w-full disabled:bg-red-300 mt-2"
            onClick={onEnd}
            disabled={!withinRadius}
          >
            Termina
          </button>
        </>
      )}
      {!withinRadius && selectedSite && (
        <p className="text-red-500 text-sm">
          Fuori dal raggio (devi essere entro {selectedSite.radius}m).
        </p>
      )}
    </div>
  );
};

export default TimeClock;
