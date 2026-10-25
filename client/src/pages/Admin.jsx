import { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiHome, FiCalendar, FiDollarSign, FiUsers, FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import api, { errMsg, money, fmtDate } from '../api';
import CountUp from '../components/CountUp.jsx';

const TABS = ['Overview', 'Rooms', 'Bookings'];
const STATUSES = ['confirmed', 'checked-in', 'checked-out', 'cancelled'];
const blankRoom = {
  name: '', type: 'Deluxe', description: '', price: 5000, capacity: 2, size: 30, bed: 'King',
  view: 'City', amenities: '', images: '', featured: false, isActive: true,
};

function Overview({ stats }) {
  if (!stats) return <div className="skeleton wide" />;
  const max = Math.max(...stats.monthly.map((m) => m.revenue), 1);
  const cards = [
    { icon: <FiDollarSign />, label: 'Revenue', value: stats.revenue, prefix: '₹' },
    { icon: <FiCalendar />, label: 'Total bookings', value: stats.bookings },
    { icon: <FiHome />, label: 'Occupancy', value: stats.occupancyRate, suffix: '%' },
    { icon: <FiUsers />, label: 'Registered guests', value: stats.guests },
  ];
  return (
    <>
      <div className="row g-4">
        {cards.map((c, i) => (
          <div className="col-6 col-xl-3" key={c.label}>
            <motion.div className="kpi" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <div className="kpi-icon">{c.icon}</div>
              <span>{c.label}</span>
              <h3>{c.prefix}<CountUp to={c.value} suffix={c.suffix} /></h3>
            </motion.div>
          </div>
        ))}
      </div>

      <div className="row g-4 mt-1">
        <div className="col-lg-8">
          <div className="panel">
            <h5>Revenue · last 6 months</h5>
            <div className="bars">
              {stats.monthly.map((m, i) => (
                <div className="bar-col" key={m.label}>
                  <small>{m.revenue ? money(m.revenue) : ''}</small>
                  <motion.div className="bar" initial={{ height: 0 }} animate={{ height: `${(m.revenue / max) * 100}%` }} transition={{ duration: 0.9, delay: 0.2 + i * 0.08, ease: [0.22, 1, 0.36, 1] }} />
                  <span>{m.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="col-lg-4">
          <div className="panel">
            <h5>Bookings by status</h5>
            <ul className="list-unstyled status-list">
              {STATUSES.map((s) => (
                <li key={s}><span className={`status ${s}`}>{s}</span><strong>{stats.byStatus[s] || 0}</strong></li>
              ))}
            </ul>
            <div className="today">
              <div><strong>{stats.arrivals}</strong><span>Arrivals today</span></div>
              <div><strong>{stats.occupied}/{stats.totalRooms}</strong><span>Rooms occupied</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function RoomModal({ room, onClose, onSaved }) {
  const [form, setForm] = useState(
    room ? { ...room, amenities: room.amenities.join(', '), images: room.images.join('\n') } : blankRoom
  );
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    const body = {
      ...form,
      price: Number(form.price), capacity: Number(form.capacity), size: Number(form.size),
      amenities: form.amenities.split(',').map((s) => s.trim()).filter(Boolean),
      images: form.images.split('\n').map((s) => s.trim()).filter(Boolean),
    };
    try {
      if (room) await api.put(`/rooms/${room._id}`, body);
      else await api.post('/rooms', body);
      toast.success(room ? 'Room updated' : 'Room created');
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.form
        className="modal-card" onSubmit={save} onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0, scale: 0.97 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 30, opacity: 0 }}
      >
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h4 className="mb-0">{room ? 'Edit room' : 'Add room'}</h4>
          <button type="button" className="icon-btn" onClick={onClose}><FiX /></button>
        </div>
        <div className="row g-3">
          <div className="col-md-8"><label className="fld"><span>Name</span><input value={form.name} onChange={set('name')} required /></label></div>
          <div className="col-md-4"><label className="fld"><span>Type</span>
            <select value={form.type} onChange={set('type')}>{['Standard', 'Deluxe', 'Suite', 'Presidential'].map((t) => <option key={t}>{t}</option>)}</select></label></div>
          <div className="col-4"><label className="fld"><span>Price / night</span><input type="number" min="0" value={form.price} onChange={set('price')} required /></label></div>
          <div className="col-4"><label className="fld"><span>Capacity</span><input type="number" min="1" value={form.capacity} onChange={set('capacity')} required /></label></div>
          <div className="col-4"><label className="fld"><span>Size (m²)</span><input type="number" min="1" value={form.size} onChange={set('size')} /></label></div>
          <div className="col-6"><label className="fld"><span>Bed</span><input value={form.bed} onChange={set('bed')} /></label></div>
          <div className="col-6"><label className="fld"><span>View</span><input value={form.view} onChange={set('view')} /></label></div>
          <div className="col-12"><label className="fld"><span>Description</span><textarea rows="3" value={form.description} onChange={set('description')} required /></label></div>
          <div className="col-12"><label className="fld"><span>Amenities (comma separated)</span><input value={form.amenities} onChange={set('amenities')} /></label></div>
          <div className="col-12"><label className="fld"><span>Image URLs (one per line)</span><textarea rows="2" value={form.images} onChange={set('images')} /></label></div>
          <div className="col-6"><label className="check"><input type="checkbox" checked={form.featured} onChange={set('featured')} /> Featured on home</label></div>
          <div className="col-6"><label className="check"><input type="checkbox" checked={form.isActive} onChange={set('isActive')} /> Active (bookable)</label></div>
        </div>
        <button className="btn-gold w-100 mt-4" disabled={busy}>{busy ? 'Saving…' : 'Save room'}</button>
      </motion.form>
    </motion.div>
  );
}

function RoomsAdmin() {
  const [rooms, setRooms] = useState(null);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new

  const load = useCallback(() => {
    api.get('/rooms', { params: { all: true } }).then((r) => setRooms(r.data)).catch((e) => toast.error(errMsg(e)));
  }, []);
  useEffect(load, [load]);

  const remove = async (r) => {
    if (!window.confirm(`Delete "${r.name}"?`)) return;
    try {
      await api.delete(`/rooms/${r._id}`);
      toast.success('Room deleted');
      load();
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">{rooms?.length ?? 0} rooms</h5>
        <button className="btn-gold sm" onClick={() => setEditing(null)}><FiPlus /> Add room</button>
      </div>
      <div className="table-wrap">
        <table className="hp-table">
          <thead><tr><th>Room</th><th>Type</th><th>Price</th><th>Guests</th><th>Status</th><th /></tr></thead>
          <tbody>
            {rooms?.map((r) => (
              <tr key={r._id}>
                <td><strong>{r.name}</strong></td>
                <td>{r.type}</td>
                <td>{money(r.price)}</td>
                <td>{r.capacity}</td>
                <td><span className={`status ${r.isActive ? 'confirmed' : 'cancelled'}`}>{r.isActive ? 'active' : 'hidden'}</span></td>
                <td className="text-end">
                  <button className="icon-btn" onClick={() => setEditing(r)} aria-label="Edit"><FiEdit2 /></button>
                  <button className="icon-btn danger" onClick={() => remove(r)} aria-label="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {editing !== undefined && (
          <RoomModal room={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />
        )}
      </AnimatePresence>
    </>
  );
}

function BookingsAdmin() {
  const [bookings, setBookings] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    api.get('/bookings', { params: { status: filter } }).then((r) => setBookings(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [filter]);

  const setStatus = async (b, status) => {
    try {
      const { data } = await api.patch(`/bookings/${b._id}/status`, { status });
      setBookings((list) => list.map((x) => (x._id === data._id ? data : x)));
      toast.success(`Marked ${status}`);
    } catch (e) {
      toast.error(errMsg(e));
    }
  };

  return (
    <>
      <div className="chips mb-3">
        {['', ...STATUSES].map((s) => (
          <button key={s} className={`chip ${filter === s ? 'on' : ''}`} onClick={() => setFilter(s)}>
            {filter === s && <motion.span layoutId="bchip" className="chip-bg" />}
            <span>{s || 'All'}</span>
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="hp-table">
          <thead><tr><th>Ref</th><th>Guest</th><th>Room</th><th>Stay</th><th>Total</th><th>Status</th></tr></thead>
          <tbody>
            {bookings?.map((b) => (
              <tr key={b._id}>
                <td className="gold-text">{b.reference}</td>
                <td>{b.user?.name}<small className="d-block muted">{b.user?.email}</small></td>
                <td>{b.room?.name}</td>
                <td>{fmtDate(b.checkIn)} → {fmtDate(b.checkOut)}</td>
                <td>{money(b.total)}<small className="d-block muted">{b.payment.status}</small></td>
                <td>
                  <select className={`status-select ${b.status}`} value={b.status} onChange={(e) => setStatus(b, e.target.value)}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
            {bookings?.length === 0 && <tr><td colSpan="6" className="text-center muted py-4">No bookings found.</td></tr>}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('Overview');
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (tab === 'Overview') api.get('/admin/stats').then((r) => setStats(r.data)).catch((e) => toast.error(errMsg(e)));
  }, [tab]);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow">Management</span>
          <h1>Dashboard</h1>
        </div>
      </section>
      <div className="container pb-5">
        <div className="chips mb-4">
          {TABS.map((t) => (
            <button key={t} className={`chip ${tab === t ? 'on' : ''}`} onClick={() => setTab(t)}>
              {tab === t && <motion.span layoutId="tab" className="chip-bg" />}
              <span>{t}</span>
            </button>
          ))}
        </div>
        <motion.div key={tab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {tab === 'Overview' && <Overview stats={stats} />}
          {tab === 'Rooms' && <RoomsAdmin />}
          {tab === 'Bookings' && <BookingsAdmin />}
        </motion.div>
      </div>
    </>
  );
}
