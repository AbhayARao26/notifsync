import React, { useState, useEffect } from 'react'
import Timeline from './components/Timeline'
import Calendar from './components/Calendar'
import Navbar from './components/Navbar'
import Trash from './components/Trash'
import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

const API_BASE_URL = 'http://localhost:8000/api'

function MainApp({ theme, toggleTheme }) {
  const [eventTypeFilter, setEventTypeFilter] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    document.body.style.background = theme === 'dark' ? '#181a20' : '#f7f8fa';
  }, [theme]);

  // Fetch events from the backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/events`);
        if (!response.ok) throw new Error('Failed to fetch events');
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Error fetching events:', error);
      }
    };
    fetchEvents();
    const interval = setInterval(fetchEvents, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  // Filter events for search
  const filteredEvents = searchQuery.trim() ?
    events.filter(event =>
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.source_app.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location.toLowerCase().includes(searchQuery.toLowerCase())
    ) : events;

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
      width: '100vw', 
      background: theme === 'dark' ? '#181a20' : '#f7f8fa'
    }}>
      <Navbar theme={theme} toggleTheme={toggleTheme} setSearchQuery={setSearchQuery} />
      <div style={{ 
        display: 'flex', 
        width: '100%', 
        marginTop: '100px', // Navbar height
        alignItems: 'flex-start',
        flex: 1,
        minHeight: 0,
      }}>
        <div style={{ width: '3%' }} />
        <Calendar 
          theme={theme} 
          onDateSelect={setSelectedDate}
          selectedDate={selectedDate}
          events={events}
        />
        <div style={{ width: '9%' }} />
        <Timeline 
          eventTypeFilter={eventTypeFilter} 
          setEventTypeFilter={setEventTypeFilter}
          theme={theme}
          selectedDate={selectedDate}
          events={filteredEvents}
          setEvents={setEvents}
        />
        <div style={{ width: '3%' }} />
      </div>
    </div>
  )
}

function App() {
  const [theme, setTheme] = useState('light')
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainApp theme={theme} toggleTheme={toggleTheme} />} />
        <Route path="/trash" element={<Trash theme={theme} toggleTheme={toggleTheme} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
