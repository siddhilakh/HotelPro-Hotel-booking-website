import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiCalendar, FiUsers } from 'react-icons/fi';
import api, { errMsg, money, fmtDate } from '../api';
import Img from '../components/Img.jsx';

export default function MyBookings() {
  const [bookings, setBookings] = useState(null);

  useEffect(() => {
    api.get('/bookings/mine').then((r) => setBookings(r.data)).catch((e) => { toast.error(errMsg(e)); setBookings([]); });
  }, []);

  const cancel = async (b) => {
    if (!window.confirm(`Cancel booking ${b.reference}?`)) return;
    try {
      const { data } = await api.patch(`/bookings/${b._id}/cancel`);
      setBookings((list) => list.map((x) => (x._id === data._id ? data : x)));
      toast.success('Booking cancelled');
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Your reservations</span>
          <h1>My Stays</h1>
        </div>
      </section>
      <div className="container pb-5">
        {!bookings ? (
          <div className="skeleton wide" />
        ) : !bookings.length ? (
          <div className="empty">
            You have no bookings yet. <Link to="/rooms">Find your perfect room →</Link>
          </div>
        ) : (
          <div className="d-grid gap-4">
            <AnimatePresence>
              {bookings.map((b, i) => (
                <motion.article
                  key={b._id}
                  layout
                  className="booking-row"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                >
                  <div className="b-img"><Img src={b.room?.images?.[0]} alt="" /></div>
                  <div className="b-info">
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      <h4 className="mb-0">{b.room?.name || 'Room removed'}</h4>
                      <span className={`status ${b.status}`}>{b.status}</span>
                    </div>
                    <div className="room-meta">
                      <span><FiCalendar /> {fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</span>
                      <span><FiUsers /> {b.guests} guests</span>
                      <span>{b.nights} nights</span>
                    </div>
                    <small className="muted">Ref {b.reference} · Payment: {b.payment.method} ({b.payment.status})</small>
                  </div>
                  <div className="b-side">
                    <div className="price">{money(b.total)}</div>
                    {b.status === 'confirmed' && <button className="btn-ghost sm danger" onClick={() => cancel(b)}>Cancel</button>}
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </>
  );
}
