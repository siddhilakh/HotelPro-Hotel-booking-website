import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiUsers, FiMaximize, FiStar, FiCheck, FiEye, FiMoon } from 'react-icons/fi';
import api, { errMsg, money, toISO, addDays, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext.jsx';
import Img from '../components/Img.jsx';
import Reveal from '../components/Reveal.jsx';

const TAX = 0.12;
const DAY = 86400000;

export default function RoomDetail() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const today = toISO(new Date());
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [booked, setBooked] = useState([]);
  const [active, setActive] = useState(0);
  const [form, setForm] = useState({
    checkIn: params.get('checkIn') || today,
    checkOut: params.get('checkOut') || addDays(today, 2),
    guests: Number(params.get('guests')) || 2,
    paymentMethod: 'card',
    specialRequests: '',
  });
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(null);

  useEffect(() => {
    api.get(`/rooms/${id}`).then((r) => setRoom(r.data)).catch((e) => setError(errMsg(e)));
    api.get(`/rooms/${id}/availability`).then((r) => setBooked(r.data)).catch(() => {});
  }, [id]);

  const nights = Math.max(0, Math.round((new Date(form.checkOut) - new Date(form.checkIn)) / DAY));
  const conflict = useMemo(
    () => booked.some((b) => new Date(b.checkIn) < new Date(form.checkOut) && new Date(b.checkOut) > new Date(form.checkIn)),
    [booked, form.checkIn, form.checkOut]
  );

  if (error) return <div className="container page-pad"><div className="empty">{error} <Link to="/rooms">Back to rooms</Link></div></div>;
  if (!room) return <div className="page-loader"><span className="spinner" /></div>;

  const subtotal = room.price * nights;
  const tax = Math.round(subtotal * TAX);
  const total = subtotal + tax;
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const onCheckIn = (e) => {
    const v = e.target.value;
    setForm((f) => ({ ...f, checkIn: v, checkOut: f.checkOut <= v ? addDays(v, 1) : f.checkOut }));
  };

  const reserve = async (e) => {
    e.preventDefault();
    if (!user) {
      toast('Please sign in to reserve');
      return navigate('/login', { state: { from: `/rooms/${id}?checkIn=${form.checkIn}&checkOut=${form.checkOut}&guests=${form.guests}` } });
    }
    setBusy(true);
    try {
      const { data } = await api.post('/bookings', { ...form, roomId: room._id, guests: Number(form.guests) });
      setDone(data);
      api.get(`/rooms/${id}/availability`).then((r) => setBooked(r.data)).catch(() => {});
      toast.success('Reservation confirmed!');
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container page-pad">
      <Link to="/rooms" className="back-link">← All rooms</Link>
      <div className="row g-5 mt-0">
        <div className="col-lg-7">
          <Reveal y={0}>
            <div className="gallery-main">
              <AnimatePresence mode="wait">
                <motion.div key={active} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
                  <Img src={room.images?.[active]} alt={room.name} />
                </motion.div>
              </AnimatePresence>
            </div>
            {room.images?.length > 1 && (
              <div className="gallery-thumbs">
                {room.images.map((src, i) => (
                  <button key={i} className={i === active ? 'on' : ''} onClick={() => setActive(i)}>
                    <Img src={src} alt="" />
                  </button>
                ))}
              </div>
            )}
          </Reveal>

          <Reveal delay={0.1} className="mt-4">
            <span className="eyebrow">{room.type}</span>
            <h1 className="room-title">{room.name}</h1>
            <div className="room-meta big">
              <span><FiStar /> {room.rating?.toFixed(1)}</span>
              <span><FiUsers /> Up to {room.capacity}</span>
              <span><FiMaximize /> {room.size} m²</span>
              <span><FiEye /> {room.view} view</span>
              <span><FiMoon /> {room.bed}</span>
            </div>
            <p className="muted lead-p">{room.description}</p>

            <h5 className="mt-4 mb-3">What this room offers</h5>
            <div className="amenity-chips">
              {room.amenities?.map((a, i) => (
                <motion.span key={a} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}>
                  <FiCheck /> {a}
                </motion.span>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="col-lg-5">
          <div className="booking-card">
            <AnimatePresence mode="wait">
              {done ? (
                <motion.div key="done" className="success" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
                  <svg viewBox="0 0 52 52" className="tick"><circle cx="26" cy="26" r="24" /><path d="M14 27l8 8 16-17" /></svg>
                  <h3>You’re all set</h3>
                  <p className="muted">Reference <strong className="gold-text">{done.reference}</strong></p>
                  <p className="muted small">{fmtDate(done.checkIn)} → {fmtDate(done.checkOut)} · {done.nights} nights · {money(done.total)}</p>
                  <div className="d-grid gap-2 mt-4">
                    <Link to="/bookings" className="btn-gold">View my stays</Link>
                    <button className="btn-ghost" onClick={() => setDone(null)}>Book another</button>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" onSubmit={reserve} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <div className="price big">{money(room.price)} <small>/ night</small></div>

                  <div className="row g-3 mt-1">
                    <div className="col-6">
                      <label className="fld"><span>Check-in</span>
                        <input type="date" min={today} value={form.checkIn} onChange={onCheckIn} required />
                      </label>
                    </div>
                    <div className="col-6">
                      <label className="fld"><span>Check-out</span>
                        <input type="date" min={addDays(form.checkIn, 1)} value={form.checkOut} onChange={set('checkOut')} required />
                      </label>
                    </div>
                    <div className="col-6">
                      <label className="fld"><span>Guests</span>
                        <select value={form.guests} onChange={set('guests')}>
                          {Array.from({ length: room.capacity }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                      </label>
                    </div>
                    <div className="col-6">
                      <label className="fld"><span>Payment</span>
                        <select value={form.paymentMethod} onChange={set('paymentMethod')}>
                          <option value="card">Card</option>
                          <option value="upi">UPI</option>
                          <option value="pay-at-hotel">Pay at hotel</option>
                        </select>
                      </label>
                    </div>
                    <div className="col-12">
                      <label className="fld"><span>Special requests (optional)</span>
                        <textarea rows="2" maxLength="500" value={form.specialRequests} onChange={set('specialRequests')} placeholder="Late arrival, extra pillows, celebration…" />
                      </label>
                    </div>
                  </div>

                  {conflict && <div className="alert-hp">This room is already booked for part of that period.</div>}

                  <div className="summary">
                    <div><span>{money(room.price)} × {nights} {nights === 1 ? 'night' : 'nights'}</span><span>{money(subtotal)}</span></div>
                    <div><span>Taxes & fees (12%)</span><span>{money(tax)}</span></div>
                    <div className="total"><span>Total</span><motion.span key={total} initial={{ scale: 1.15 }} animate={{ scale: 1 }}>{money(total)}</motion.span></div>
                  </div>

                  <button className="btn-gold w-100 mt-3" disabled={busy || conflict || nights < 1}>
                    {busy ? 'Confirming…' : user ? 'Reserve now' : 'Sign in to reserve'}
                  </button>
                  <p className="fine">Free cancellation before check-in. Payment is simulated in this demo.</p>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
