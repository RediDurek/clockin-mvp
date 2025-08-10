import React, { useRef, useState } from 'react';

interface ChatDockProps {
  endpoint: string;
}

const ChatDock: React.FC<ChatDockProps> = ({ endpoint }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text && !file) {
      setStatus('Inserisci testo o seleziona un’immagine');
      return;
    }
    const formData = new FormData();
    formData.append('text', text);
    if (file) formData.append('image', file);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        setStatus('Inviato!');
        setText('');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        setStatus('Errore invio');
      }
    } catch (err) {
      setStatus('Errore rete');
    }
  };

  return (
    <div className="p-4 border rounded dark:border-gray-600">
      <h3 className="font-semibold mb-2">Coscienza di cantiere</h3>
      <form onSubmit={handleSubmit} className="space-y-2">
        <textarea
          className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Scrivi un messaggio..."
        />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={e => {
            const f = e.target.files?.[0];
            setFile(f ?? null);
          }}
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
        >
          Invia
        </button>
        {status && <p className="text-sm">{status}</p>}
      </form>
    </div>
  );
};

export default ChatDock;
