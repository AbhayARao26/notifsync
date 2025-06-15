import React, { useEffect, useState } from 'react';
import '../App.css';

function Calendar({ theme = 'light', onDateSelect, selectedDate, events = [] }) {
  const [displayedDate, setDisplayedDate] = useState(selectedDate || new Date());

  useEffect(() => {
    setDisplayedDate(selectedDate || new Date());
  }, [selectedDate]);

  const daysInMonth = new Date(
    displayedDate.getFullYear(),
    displayedDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    displayedDate.getFullYear(),
    displayedDate.getMonth(),
    1
  ).getDay();

  const today = new Date();

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const hasEvent = (day) => {
    const currentDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
    return events.some(event => {
      const eventDate = new Date(event.date_time);
      return (
        eventDate.getDate() === currentDate.getDate() &&
        eventDate.getMonth() === currentDate.getMonth() &&
        eventDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handleDateClick = (day) => {
    const newSelectedDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
    onDateSelect(newSelectedDate);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(displayedDate);
    newDate.setMonth(displayedDate.getMonth() + offset);
    setDisplayedDate(newDate);
  };

  const changeYear = (offset) => {
    const newDate = new Date(displayedDate);
    newDate.setFullYear(displayedDate.getFullYear() + offset);
    setDisplayedDate(newDate);
  };

  // Render calendar days in a 7-column grid
  const renderCalendarDays = () => {
    const daysArray = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfMonth; i++) {
      daysArray.push(<div key={`empty-${i}`} />);
    }
    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const currentDate = new Date(displayedDate.getFullYear(), displayedDate.getMonth(), day);
      const isToday = isSameDay(currentDate, today);
      const isSelected = selectedDate && isSameDay(currentDate, selectedDate);
      const eventExists = hasEvent(day);
      let backgroundColor = 'transparent';
      if (isSelected) backgroundColor = 'rgba(37, 99, 235, 0.3)';
      else if (isToday) backgroundColor = 'rgba(16, 185, 129, 0.2)';
      daysArray.push(
        <button
          key={day}
          onClick={() => handleDateClick(day)}
          style={{
            width: '48px',
            height: '48px',
            margin: 'auto',
            fontSize: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor,
            borderRadius: '50%',
            cursor: 'pointer',
            fontWeight: isToday || isSelected ? 'bold' : 'normal',
            color: theme === 'dark' ? '#fff' : '#222',
            border: 'none',
            outline: 'none',
            position: 'relative',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          {day}
          {eventExists && (
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: '50%',
                backgroundColor: 'rgba(37, 99, 235, 0.8)',
                marginTop: 6,
              }}
            />
          )}
        </button>
      );
    }
    // Fill the last row with empty cells if needed
    const totalCells = firstDayOfMonth + daysInMonth;
    const remainder = totalCells % 7;
    if (remainder !== 0) {
      for (let i = 0; i < 7 - remainder; i++) {
        daysArray.push(<div key={`post-empty-${i}`} />);
      }
    }
    return daysArray;
  };

  return (
    <div style={{ width: '35%', padding: 0, margin: 0, height: 'auto' }}>
      <div
        style={{
          width: '100%',
          background: theme === 'dark' ? '#181a20' : '#fff',
          border: theme === 'dark' ? '2px solid #fff' : '2px solid #000',
          borderRadius: 20,
          boxShadow: '0 4px 24px 0 rgba(37,99,235,0.10)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          padding: 32,
          transition: 'background 0.2s, box-shadow 0.2s, border 0.2s, backdrop-filter 0.2s',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          height: 'auto',
        }}
      >
        <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0, marginBottom: 18, color: theme === 'dark' ? '#fff' : '#222', letterSpacing: 1 }}>Calendar</h1>
        <div style={{
          width: '100%',
          height: 4,
          background: theme === 'dark' ? '#fff' : '#000',
          borderRadius: 2,
          marginBottom: 24,
        }} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            marginBottom: 28,
          }}
        >
          {/* Year row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', marginBottom: 2 }}>
            <button onClick={() => changeYear(-1)} style={navBtnStyle}>⏮</button>
            <span style={{ fontSize: 32, fontWeight: 700, color: theme === 'dark' ? '#fff' : '#222', lineHeight: 1, margin: '0 12px' }}>{displayedDate.getFullYear()}</span>
            <button onClick={() => changeYear(1)} style={navBtnStyle}>⏭</button>
          </div>
          <div style={{ width: '80%', height: 1, background: theme === 'dark' ? '#fff' : '#000', opacity: 1, margin: '8px 0 16px 0', borderRadius: 1 }} />
          {/* Month row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            <button onClick={() => changeMonth(-1)} style={navBtnStyle}>◀</button>
            <span style={{ fontSize: 28, fontWeight: 600, color: theme === 'dark' ? '#fff' : '#222', lineHeight: 1, margin: '0 12px' }}>{monthNames[displayedDate.getMonth()]}</span>
            <button onClick={() => changeMonth(1)} style={navBtnStyle}>▶</button>
          </div>
          <div style={{ width: '40%', height: 1, background: theme === 'dark' ? '#fff' : '#000', opacity: 1, margin: '8px 0 0 0', borderRadius: 1 }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 18, width: '100%' }}>
          {days.map(day => (
            <div
              key={day}
              style={{
                width: '48px',
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 20,
                color: theme === 'dark' ? '#fff' : '#222',
              }}
            >
              {day}
            </div>
          ))}
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          width: '100%',
        }}>
          {renderCalendarDays()}
        </div>
      </div>
    </div>
  );
}

const navBtnStyle = {
  background: 'none',
  border: 'none',
  fontSize: '22px',
  margin: '0 6px',
  cursor: 'pointer',
  color: '#2563eb',
};

export default Calendar;
