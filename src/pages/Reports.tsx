import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStorage } from '../contexts/StorageContext';
import { useUser } from '../contexts/UserContext';
import type { Shift, Site } from '../adapters/StorageAdapter';
import { totalPauseMs, formatDuration } from '../utils/time';

const Reports: React.FC = () => {
  const storage = useStorage();
  const { user } = useUser();
  const navigate = useNavigate();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [sites, setSites] = useState<Site[]>([]);

  useEffect(() => {
    async function load() {
      if (!user) return;
      const [sitesList, shiftsList] = await Promise.all([
        storage.listSites(),
        storage.listShifts(user.id),
      ]);
      setSites(sitesList);
      setShifts(shiftsList);
    }
    load();
  }, [user, storage]);

  const getSiteName = (id: string) => sites.find(s => s.id === id)?.name ?? '??';

  const handleExport = () => {
    const header = ['Date', 'Site', 'Start', 'End', 'Total', 'Pause'];
    const rows = shifts.map(shift => {
      const date = new Date(shift.startedAt).toLocaleDateString();
      const start = new Date(shift.startedAt).toLocaleTimeString();
      const end = shift.endedAt ? new Date(shift.endedAt).toLocaleTimeString() : '';
      const totalMs = shift.endedAt ? shift.endedAt - shift.startedAt : 0;
      const pauseMs = totalPauseMs(shift.pauses);
      const totalFmt = formatDuration(totalMs - pauseMs);
      const pauseFmt = formatDuration(pauseMs);
      return [date, getSiteName(shift.siteId), start, end, totalFmt, pauseFmt];
    });
    const csvContent =
      [header, ...rows]
        .map(row => row.map(field => `"${(field ?? '').toString().replace(/"/g, '""')}"`).join(','))
        .join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'reports.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Rapporti</h2>
        <button
          className="text-sm text-blue-600 hover:underline"
          onClick={() => navigate('/dashboard')}
        >
          Torna
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full table-auto border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-700">
              <th className="px-2 py-1 border">Data</th>
              <th className="px-2 py-1 border">Cantiere</th>
              <th className="px-2 py-1 border">Inizio</th>
              <th className="px-2 py-1 border">Fine</th>
              <th className="px-2 py-1 border">Totale</th>
              <th className="px-2 py-1 border">Pause</th>
            </tr>
          </thead>
          <tbody>
            {shifts.map(shift => {
              const date = new Date(shift.startedAt).toLocaleDateString();
              const start = new Date(shift.startedAt).toLocaleTimeString();
              const end = shift.endedAt ? new Date(shift.endedAt).toLocaleTimeString() : '';
              const totalMs = shift.endedAt ? shift.endedAt - shift.startedAt : 0;
              const pauseMs = totalPauseMs(shift.pauses);
              const totalFmt = formatDuration(totalMs - pauseMs);
              const pauseFmt = formatDuration(pauseMs);
              return (
                <tr key={shift.id} className="border-b dark:border-gray-600">
                  <td className="px-2 py-1 border">{date}</td>
                  <td className="px-2 py-1 border">{getSiteName(shift.siteId)}</td>
                  <td className="px-2 py-1 border">{start}</td>
                  <td className="px-2 py-1 border">{end}</td>
                  <td className="px-2 py-1 border">{totalFmt}</td>
                  <td className="px-2 py-1 border">{pauseFmt}</td>
                </tr>
              );
            })}
            {shifts.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center py-2">
                  Nessun turno
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {shifts.length > 0 && (
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          onClick={handleExport}
        >
          Esporta CSV
        </button>
      )}
    </div>
  );
};

export default Reports;
