import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUsers, FiMaximize, FiStar } from 'react-icons/fi';
import { money } from '../api';
import Img from './Img.jsx';

export default function RoomCard({ room, index = 0, query = '' }) {
  const unavailable = room.available === false;
  return (
    <motion.div
      className="h-100"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.7, delay: (index % 3) * 0.12, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link to={`/rooms/${room._id}${query}`} className={`room-card ${unavailable ? 'is-unavailable' : ''}`}>
        <div className="room-img">
          <Img src={room.images?.[0]} alt={room.name} />
          <span className="room-badge">{room.type}</span>
          {unavailable && <span className="room-sold">Booked for these dates</span>}
          <span className="room-rating"><FiStar /> {room.rating?.toFixed(1)}</span>
        </div>
        <div className="room-body">
          <h3>{room.name}</h3>
          <div className="room-meta">
            <span><FiUsers /> {room.capacity} guests</span>
            <span><FiMaximize /> {room.size} m²</span>
            <span>{room.view} view</span>
          </div>
          <div className="room-foot">
            <div className="price">
              {money(room.price)} <small>/ night</small>
            </div>
            <span className="room-cta">View <i>→</i></span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
