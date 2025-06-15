import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = 'http://localhost:8000/api';

function Trash({ theme = 'light', toggleTheme }) {
  const [deletedEvents, setDeletedEvents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setDeletedEvents(data.filter(event => event.deleted));
      } catch (error) {
        setDeletedEvents([]);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const handleClearBin = async () => {
    await fetch(`${API_BASE_URL}/events/trash`, { method: 'DELETE' });
    setDeletedEvents([]);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', overflowY: 'auto', background: theme === 'dark' ? '#181a20' : '#fff', color: theme === 'dark' ? '#fff' : '#222', padding: 0, margin: 0 }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: 24,
          left: 24,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: 8,
          padding: '8px 18px',
          fontWeight: 700,
          fontSize: 18,
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        ← Back
      </button>
      <div style={{ marginTop: 100, textAlign: 'center' }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, marginBottom: 24 }}>Trash Bin</h1>
        {deletedEvents.length > 0 && (
          <button
            onClick={handleClearBin}
            style={{
              background: '#ff1744',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '8px 18px',
              fontWeight: 700,
              fontSize: 18,
              cursor: 'pointer',
              marginBottom: 24,
            }}
          >
            Clear Bin
          </button>
        )}
        {deletedEvents.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: 24 }}>No deleted notifications.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, maxWidth: 700, margin: '0 auto' }}>
            {deletedEvents.map(event => (
              <li key={event.id} style={{
                background: theme === 'dark' ? '#23272f' : '#f7f8fa',
                borderRadius: 12,
                margin: '18px 0',
                padding: 24,
                boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
                textAlign: 'left',
              }}>
                <div style={{ fontWeight: 700, fontSize: 24 }}>{event.title}</div>
                <div style={{ fontSize: 16, margin: '8px 0' }}>{event.description}</div>
                <div style={{ fontSize: 15, color: '#aaa' }}>Type: {event.commitment_type} | Date: {new Date(event.date_time).toLocaleString()}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default Trash; 