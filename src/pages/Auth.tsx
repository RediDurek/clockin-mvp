import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';
import { useStorage } from '../contexts/StorageContext';

const Auth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { signIn } = useUser();
  const storage = useStorage();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim();
    const cleanPin = pin.trim();

    if (!/^\d{4,6}$/.test(cleanPin)) {
      setError('Il PIN deve avere 4–6 cifre');
      return;
    }

    try {
      const result = await storage.signIn(cleanEmail, cleanPin);
      if (result) {
        signIn({ id: result.userId, email: result.email, role: result.role });
        navigate('/dashboard');
      } else {
        setError('Credenziali non valide');
      }
    } catch (err: any) {
      setError(err?.message || 'Errore di accesso');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4 text-center">ClockIn</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}

        {/* noValidate per disattivare la validazione HTML che bloccava il PIN */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              placeholder="worker@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">PIN (4–6 cifre)</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))} // solo numeri
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Accedi
          </button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
