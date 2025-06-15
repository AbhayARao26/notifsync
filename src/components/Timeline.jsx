import React, { useState } from 'react'

const API_BASE_URL = 'http://localhost:8000/api'

function Timeline({ eventTypeFilter = 'all', setEventTypeFilter, theme = 'light', selectedDate, events, setEvents }) {
  const [hoveredEvent, setHoveredEvent] = useState(null)

  // Helper to parse duration string to minutes
  const parseDuration = (duration) => {
    if (!duration) return 0;
    if (duration === 'instant') return 0;
    if (duration.includes('hour')) return parseInt(duration) * 60;
    if (duration.includes('hr')) {
      const [h, m] = duration.split('hr');
      return parseInt(h) * 60 + (m.includes('min') ? parseInt(m) : 0);
    }
    if (duration.includes('min')) return parseInt(duration);
    return 0;
  };

  // Parse events to extract start, end, and type
  const parsedEvents = events
    .filter(event => !event.deleted)
    .map(event => {
      const startTime = new Date(event.date_time)
      const durationMin = parseDuration(event.duration)
      const endTime = new Date(startTime.getTime() + durationMin * 60000)
      return {
        ...event,
        hour: startTime.getHours(),
        minute: startTime.getMinutes(),
        duration: event.duration, // string
        type: event.commitment_type,
        date: startTime.toDateString(),
        startTime,
        endTime,
      }
    })

  // Filter events by type and selected date
  const filteredEvents = parsedEvents.filter(event => {
    const matchesType = eventTypeFilter === 'all' || event.type === eventTypeFilter;
    const matchesDate = event.date === selectedDate.toDateString();
    return matchesType && matchesDate;
  });

  // Sort by start time
  filteredEvents.sort((a, b) => a.startTime - b.startTime);

  // Conflict detection: mark events as conflicting if they overlap in time
  const markConflicts = (events) => {
    const result = events.map(e => ({ ...e, hasConflict: false }));
    for (let i = 0; i < result.length; i++) {
      for (let j = i + 1; j < result.length; j++) {
        if (result[i].endTime > result[j].startTime && result[i].startTime < result[j].endTime) {
          result[i].hasConflict = true;
          result[j].hasConflict = true;
        }
      }
    }
    return result;
  };

  const eventsWithConflicts = markConflicts(filteredEvents);

  // Group events by hour for display
  const eventsByHour = eventsWithConflicts.reduce((acc, event) => {
    if (!acc[event.hour]) acc[event.hour] = []
    acc[event.hour].push(event)
    return acc
  }, {})
  const hoursWithEvents = Object.keys(eventsByHour).map(Number).sort((a, b) => a - b)

  // Delete event by id
  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      setEvents(events => events.filter(event => event.id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  }

  // Helper to format time
  const formatTime = (hour, minute = 0) => `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`

  // Frosted container styles
  const frostedBg = theme === 'dark'
    ? 'rgba(30, 34, 44, 0.15)'
    : 'rgba(255, 255, 255, 0.15)'
  const frostedBorder = theme === 'dark' ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(30,34,44,0.08)'

  return (
    <div style={{ 
      display: 'flex', 
      flex: 1,
      justifyContent: 'flex-start', 
      maxWidth: '100%',
      overflowX: 'auto',
      boxSizing: 'border-box',
      padding: 0,
      margin: 0,
      height: 'auto',
      minHeight: '0',
      maxHeight: '100%',
      border: theme === 'dark' ? '2px solid #fff' : '2px solid #000',
      borderRadius: 20,
      boxShadow: '0 2px 12px rgba(37,99,235,0.10)',
      background: frostedBg,
    }}>
      <div
        style={{
          width: '100%',
          maxWidth: '100%',
          boxSizing: 'border-box',
          background: frostedBg,
          border: frostedBorder,
          borderRadius: 20,
          boxShadow: '0 2px 12px rgba(37,99,235,0.10)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: 32,
          transition: 'background 0.2s, box-shadow 0.2s, border 0.2s, backdrop-filter 0.2s',
          height: 'auto',
          minHeight: '0',
          maxHeight: '100%',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 18, justifyContent: 'center' }}>
          <h3 style={{ color: theme === 'dark' ? '#fff' : '#222', transition: 'color 0.2s', margin: 0, fontSize: 44, fontWeight: 900, letterSpacing: 1 }}>Timeline</h3>
          <div style={{
            width: '100%',
            height: 4,
            background: theme === 'dark' ? '#fff' : '#000',
            borderRadius: 2,
            margin: '18px 0 24px 0',
          }} />
          {setEventTypeFilter && (
            <select
              value={eventTypeFilter}
              onChange={e => setEventTypeFilter(e.target.value)}
              style={{
                background: theme === 'dark' ? 'rgba(30,34,44,0.85)' : 'rgba(255,255,255,0.85)',
                color: theme === 'dark' ? '#fff' : '#2563eb',
                border: 'none',
                borderRadius: 20,
                padding: '6px 18px',
                fontWeight: 600,
                fontSize: 18,
                cursor: 'pointer',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                transition: 'background 0.2s, color 0.2s',
                outline: 'none',
                marginBottom: 8,
              }}
              aria-label="Filter event type"
            >
              <option value="all">All</option>
              <option value="meeting">Meeting</option>
              <option value="event">Event</option>
              <option value="party">Party</option>
              <option value="deadline">Deadline</option>
              <option value="reminder">Reminder</option>
              <option value="task">Task</option>
              <option value="update">Update</option>
              <option value="greeting">Greeting</option>
              <option value="education">Education</option>
              <option value="other">Other</option>
            </select>
          )}
        </div>
        <table style={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', borderCollapse: 'collapse', fontSize: '24px' }}>
          <tbody>
            {hoursWithEvents.length === 0 && (
              <tr><td colSpan={2} style={{ color: '#888', padding: 12, fontSize: 22 }}>No events found.</td></tr>
            )}
            {hoursWithEvents.map((hour, hourIdx) => {
              const hourEvents = eventsByHour[hour]
              return (
                <React.Fragment key={hour}>
                  <tr style={{ height: 48 }}>
                    <td style={{ width: 60, color: '#888', fontWeight: 700, fontSize: 18, padding: '2px 8px', userSelect: 'none' }}>
                      {formatTime(hour)}
                    </td>
                    <td
                      style={{
                        background: hourEvents.some(e => e.hasConflict) ? '#ff1744' : 'transparent',
                        color: hourEvents.some(e => e.hasConflict) ? '#fff' : '#222',
                        borderRadius: 6,
                        fontWeight: hourEvents.some(e => e.hasConflict) ? 700 : 500,
                        padding: '8px 12px',
                        transition: 'background 0.2s',
                        display: 'flex',
                        gap: 12,
                      }}
                    >
                      {hourEvents.map((event, idx) => {
                        const start = formatTime(event.hour, event.minute)
                        // If no conflict, stretch button and show details inside
                        if (!event.hasConflict) {
                          return (
                            <span key={event.id} style={{ display: 'block', width: '100%', marginBottom: 8 }}>
                              <button
                                style={{
                                  background: theme === 'dark' ? '#181c24' : '#fff',
                                  color: theme === 'dark' ? '#fff' : '#181c24',
                                  border: 'none',
                                  borderRadius: 6,
                                  padding: '18px 24px',
                                  fontWeight: 700,
                                  fontSize: 22,
                                  cursor: 'pointer',
                                  boxShadow: '0 1px 4px rgba(37,99,235,0.10)',
                                  transition: 'background 0.2s, color 0.2s',
                                  position: 'relative',
                                  width: '100%',
                                  textAlign: 'left',
                                  marginBottom: 4,
                                }}
                                onMouseEnter={() => setHoveredEvent(event.id)}
                                onMouseLeave={() => setHoveredEvent(null)}
                              >
                                <div style={{ fontWeight: 800, fontSize: 24 }}>{event.title} <span style={{ fontSize: 15, opacity: 0.7 }}>({event.type})</span> <span style={{ fontSize: 15, marginLeft: 4 }}>⏱{event.duration}</span> <span style={{ fontSize: 15, marginLeft: 8 }}>{start}</span></div>
                                <div style={{ fontSize: 18, color: '#888', marginTop: 8, whiteSpace: 'normal', wordBreak: 'break-word' }}>{event.description}</div>
                                <div style={{ fontSize: 15, color: '#888', marginTop: 8 }}>
                                  <b>Location:</b> {event.location} &nbsp; <b>Source App:</b> {event.source_app}
                                </div>
                                <div style={{ fontSize: 15, color: '#888', marginTop: 2 }}>
                                  <b>Start:</b> {start} &nbsp; <b>Duration:</b> {event.duration}
                                </div>
                                <span
                                  onClick={e => { e.stopPropagation(); handleDelete(event.id) }}
                                  style={{
                                    marginLeft: 8,
                                    color: '#fff',
                                    background: '#ff1744',
                                    borderRadius: '50%',
                                    width: 22,
                                    height: 22,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    border: '2px solid #fff',
                                    position: 'absolute',
                                    top: 10,
                                    right: 10,
                                    zIndex: 2
                                  }}
                                  title="Delete event"
                                >
                                  ×
                                </span>
                              </button>
                            </span>
                          )
                        }
                        // Conflicting events: keep as before
                        return (
                          <span key={event.id} style={{ position: 'relative', marginRight: 0, display: 'inline-block', verticalAlign: 'top', borderRight: (event.hasConflict && idx !== hourEvents.length - 1) ? '2px solid #fff' : 'none', paddingRight: (event.hasConflict && idx !== hourEvents.length - 1) ? 12 : 0 }}>
                            <button
                              style={{
                                background: theme === 'dark' ? '#181c24' : '#fff',
                                color: theme === 'dark' ? '#fff' : '#181c24',
                                border: 'none',
                                borderRadius: 6,
                                padding: '8px 18px',
                                fontWeight: 700,
                                fontSize: 22,
                                cursor: 'pointer',
                                boxShadow: '0 1px 4px rgba(37,99,235,0.10)',
                                transition: 'background 0.2s, color 0.2s',
                                position: 'relative',
                                marginBottom: 4,
                              }}
                              onMouseEnter={() => setHoveredEvent(event.id)}
                              onMouseLeave={() => setHoveredEvent(null)}
                            >
                              {event.title} <span style={{ fontSize: 15, opacity: 0.7 }}>({event.type})</span> <span style={{ fontSize: 15, marginLeft: 4 }}>⏱{event.duration}</span>
                              <span style={{ fontSize: 15, marginLeft: 8 }}>{start}</span>
                              {hourEvents.some(e => e.hasConflict) && (
                                <span
                                  onClick={e => { e.stopPropagation(); handleDelete(event.id) }}
                                  style={{
                                    marginLeft: 8,
                                    color: '#fff',
                                    background: '#ff1744',
                                    borderRadius: '50%',
                                    width: 22,
                                    height: 22,
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontWeight: 900,
                                    fontSize: 18,
                                    cursor: 'pointer',
                                    border: '2px solid #fff',
                                    position: 'absolute',
                                    top: 2,
                                    right: -14,
                                    zIndex: 2
                                  }}
                                  title="Delete event"
                                >
                                  ×
                                </span>
                              )}
                            </button>
                            {hoveredEvent === event.id && (
                              <div style={{
                                position: 'absolute',
                                top: '110%',
                                left: 0,
                                zIndex: 10,
                                minWidth: 260,
                                background: '#fff',
                                color: '#222',
                                border: '1px solid #2563eb',
                                borderRadius: 8,
                                boxShadow: '0 4px 16px rgba(37,99,235,0.10)',
                                padding: 16,
                                fontSize: 17,
                                fontWeight: 400,
                                whiteSpace: 'normal',
                              }}>
                                <div style={{ fontWeight: 700, marginBottom: 4 }}>{event.title}</div>
                                <div><b>Description:</b> {event.description}</div>
                                <div><b>Start:</b> {start}</div>
                                <div><b>Duration:</b> {event.duration}</div>
                                <div><b>Location:</b> {event.location}</div>
                                <div><b>Source App:</b> {event.source_app}</div>
                                <div><b>Type:</b> {event.type}</div>
                              </div>
                            )}
                          </span>
                        )
                      })}
                    </td>
                  </tr>
                  {/* Add a horizontal line between hour slots except after the last */}
                  {hourIdx !== hoursWithEvents.length - 1 && (
                    <tr><td colSpan={2}><div style={{ height: 2, background: '#e5e7eb', margin: '6px 0', borderRadius: 1 }} /></td></tr>
                  )}
                </React.Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Timeline
