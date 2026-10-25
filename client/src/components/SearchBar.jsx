import { useState } from 'react';
import { FiCalendar, FiUsers, FiSearch } from 'react-icons/fi';
import { toISO, addDays } from '../api';

// Dates + guests form shared by the home hero and the rooms page.
export default function SearchBar({ initial = {}, onSearch, compact = false }) {
  const today = toISO(new Date());
  const [checkIn, setCheckIn] = useState(initial.checkIn || today);
  const [checkOut, setCheckOut] = useState(initial.checkOut || addDays(today, 2));
  const [guests, setGuests] = useState(initial.guests || 2);

  const changeIn = (v) => {
    setCheckIn(v);
    if (checkOut <= v) setCheckOut(addDays(v, 1));
  };

  return (
    <form
      className={`search-bar ${compact ? 'compact' : ''}`}
      onSubmit={(e) => {
        e.preventDefault();
        onSearch({ checkIn, checkOut, guests });
      }}
    >
      <label>
        <span><FiCalendar /> Check-in</span>
        <input type="date" value={checkIn} min={today} onChange={(e) => changeIn(e.target.value)} required />
      </label>
      <label>
        <span><FiCalendar /> Check-out</span>
        <input type="date" value={checkOut} min={addDays(checkIn, 1)} onChange={(e) => setCheckOut(e.target.value)} required />
      </label>
      <label>
        <span><FiUsers /> Guests</span>
        <select value={guests} onChange={(e) => setGuests(Number(e.target.value))}>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>
          ))}
        </select>
      </label>
      <button type="submit" className="btn-gold"><FiSearch /> Check availability</button>
    </form>
  );
}
