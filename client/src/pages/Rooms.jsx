import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import api from '../api';
import RoomCard from '../components/RoomCard.jsx';
import SearchBar from '../components/SearchBar.jsx';

const TYPES = ['All', 'Standard', 'Deluxe', 'Suite', 'Presidential'];

export default function Rooms() {
  const [params, setParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const type = params.get('type') || 'All';
  const sort = params.get('sort') || 'price-asc';
  const checkIn = params.get('checkIn') || '';
  const checkOut = params.get('checkOut') || '';
  const guests = params.get('guests') || '';

  useEffect(() => {
    setLoading(true);
    api
      .get('/rooms', { params: { type, sort, checkIn, checkOut, guests } })
      .then((r) => setRooms(r.data))
      .catch(() => setRooms([]))
      .finally(() => setLoading(false));
  }, [type, sort, checkIn, checkOut, guests]);

  const update = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    setParams(next, { replace: true });
  };

  const dateQuery = checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests || 2}` : '';
  const free = rooms.filter((r) => r.available !== false).length;

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Accommodation</span>
          <h1>Rooms & Suites</h1>
          <p className="muted">Find the space that suits your stay.</p>
        </div>
      </section>

      <div className="container pb-5">
        <div className="search-wrap">
          <SearchBar
            compact
            key={`${checkIn}${checkOut}${guests}`}
            initial={{ checkIn, checkOut, guests: Number(guests) || 2 }}
            onSearch={(s) => update(s)}
          />
        </div>

        <div className="toolbar">
          <div className="chips">
            {TYPES.map((t) => (
              <button key={t} className={`chip ${type === t ? 'on' : ''}`} onClick={() => update({ type: t === 'All' ? '' : t })}>
                {type === t && <motion.span layoutId="chip" className="chip-bg" />}
                <span>{t}</span>
              </button>
            ))}
          </div>
          <select className="sort" value={sort} onChange={(e) => update({ sort: e.target.value })}>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
            <option value="rating">Top rated</option>
          </select>
        </div>

        {checkIn && checkOut && !loading && (
          <p className="muted result-note">
            {free} of {rooms.length} rooms available for your dates.
          </p>
        )}

        {loading ? (
          <div className="row g-4">
            {[0, 1, 2].map((i) => <div className="col-md-6 col-lg-4" key={i}><div className="skeleton" /></div>)}
          </div>
        ) : rooms.length ? (
          <motion.div layout className="row g-4">
            <AnimatePresence>
              {rooms.map((r, i) => (
                <div className="col-md-6 col-lg-4" key={r._id}>
                  <RoomCard room={r} index={i} query={dateQuery} />
                </div>
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          <div className="empty">No rooms match your filters. Try widening your search.</div>
        )}
      </div>
    </>
  );
}
