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
    const result = await storage.signIn(email.trim(), pin.trim());
    if (result) {
      signIn({ id: result.userId, email: result.email, role: result.role });
      navigate('/dashboard');
    } else {
      setError('Credenziali non valide');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-sm bg-white dark:bg-gray-800 p-6 rounded shadow">
        <h1 className="text-xl font-semibold mb-4 text-center">ClockIn</h1>
        {error && <p className="text-red-600 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">PIN (4-6 cifre)</label>
            <input
              type="password"
              value={pin}
              onChange={e => setPin(e.target.value)}
              className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
              pattern="\\d{4,6}"
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
