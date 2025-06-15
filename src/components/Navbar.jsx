import React from 'react';
import LogoL from '../assets/LogoL.png';
import LogoD from '../assets/LogoD.png';
import TrashL from '../assets/TrashL.png';
import TrashD from '../assets/TrashD.png';
import { useNavigate } from 'react-router-dom';

function Navbar({ theme, toggleTheme, setSearchQuery }) {
  const logoSrc = theme === 'dark' ? LogoD : LogoL;
  const trashIcon = theme === 'dark' ? TrashD : TrashL;
  const navigate = useNavigate();
  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 2rem',
      background: theme === 'dark' ? '#000' : '#fff',
      backdropFilter: 'blur(8px)',
      WebkitBackdropFilter: 'blur(8px)',
      borderBottom: theme === 'dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
      zIndex: 1000,
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
      }}>
        <img src={logoSrc} alt="NotifSync Logo" style={{ height: 36 * 1.75, marginRight: 12 }} />
        <span style={{
          fontSize: `${1.5 * 1.75}rem`,
          fontWeight: 'bold',
          color: theme === 'dark' ? '#fff' : '#0f172a',
        }}>
          NotifSync
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <input
          type="text"
          placeholder="Search..."
          onChange={e => setSearchQuery(e.target.value)}
          style={{
            padding: '7px 16px',
            borderRadius: 20,
            border: '1px solid #ccc',
            fontSize: 16,
            outline: 'none',
            background: theme === 'dark' ? '#222' : '#f7f8fa',
            color: theme === 'dark' ? '#fff' : '#222',
            transition: 'background 0.2s, color 0.2s',
            width: 180,
          }}
        />
        <button
          onClick={() => navigate('/trash')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}
          title="View Trash"
        >
          <img src={trashIcon} alt="Trashbin" style={{ height: 32, width: 32 }} />
        </button>
        <button
          onClick={toggleTheme}
          style={{
            background: theme === 'dark' ? '#fff' : '#181a20',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: theme === 'dark' ? '#facc15' : '#fff',
            fontSize: 22,
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
            transition: 'all 0.2s',
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </nav>
  );
}

export default Navbar; 