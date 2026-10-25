import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { FiWifi, FiCoffee, FiShield, FiClock, FiMapPin, FiAward, FiChevronDown } from 'react-icons/fi';
import { MdOutlinePool, MdOutlineSpa, MdOutlineRestaurant, MdOutlineFitnessCenter } from 'react-icons/md';
import api from '../api';
import Reveal, { SectionTitle } from '../components/Reveal.jsx';
import CountUp from '../components/CountUp.jsx';
import RoomCard from '../components/RoomCard.jsx';
import SearchBar from '../components/SearchBar.jsx';
import Img from '../components/Img.jsx';

const HERO = 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2000&q=80';
const BANNER = 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=80';

const amenities = [
  { icon: <MdOutlinePool />, title: 'Infinity Pool', text: 'Heated rooftop pool with skyline views and cabanas.' },
  { icon: <MdOutlineSpa />, title: 'Signature Spa', text: 'Ayurvedic and modern treatments by master therapists.' },
  { icon: <MdOutlineRestaurant />, title: 'Fine Dining', text: 'Three restaurants led by award-winning chefs.' },
  { icon: <MdOutlineFitnessCenter />, title: 'Fitness Studio', text: 'Open 24 hours with personal trainers on request.' },
  { icon: <FiWifi />, title: 'Fast WiFi', text: 'Complimentary fibre-speed internet across the property.' },
  { icon: <FiCoffee />, title: 'Breakfast', text: 'A seasonal, locally sourced spread served until noon.' },
];

const features = [
  { icon: <FiShield />, title: 'Secure by design', text: 'Encrypted accounts and token-based sessions protect every guest.' },
  { icon: <FiClock />, title: 'Real-time availability', text: 'Live inventory means no double bookings, ever.' },
  { icon: <FiAward />, title: 'Effortless stays', text: 'Book, manage and cancel in a few taps, from any device.' },
];

const reviews = [
  { name: 'Ananya Rao', role: 'Travel blogger', text: 'The booking took thirty seconds and the room was better than the photos. The ocean view suite is unforgettable.' },
  { name: 'Mark Ellison', role: 'Business traveller', text: 'Fast, polished and reliable. Check-in was instant and the work desk setup was perfect for long stays.' },
  { name: 'Priya & Kabir', role: 'Honeymooners', text: 'Every little detail felt considered. The penthouse terrace at sunset is something we will talk about for years.' },
];

const heroLine = ['Where', 'every', 'stay', 'feels', 'like', 'an', 'occasion.'];

function Particles() {
  // Deterministic spread so the layout is stable between renders.
  const dots = Array.from({ length: 22 }, (_, i) => ({
    left: (i * 37) % 100,
    size: 2 + (i % 4),
    delay: (i % 9) * 0.9,
    dur: 9 + (i % 7) * 2,
  }));
  return (
    <div className="particles" aria-hidden>
      {dots.map((d, i) => (
        <span key={i} style={{ left: `${d.left}%`, width: d.size, height: d.size, animationDelay: `${d.delay}s`, animationDuration: `${d.dur}s` }} />
      ))}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [review, setReview] = useState(0);
  const heroRef = useRef(null);
  const bannerRef = useRef(null);

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] });
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '25%']);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const bannerProgress = useScroll({ target: bannerRef, offset: ['start end', 'end start'] }).scrollYProgress;
  const bannerY = useTransform(bannerProgress, [0, 1], ['-12%', '12%']);

  useEffect(() => {
    api.get('/rooms', { params: { featured: true } }).then((r) => setRooms(r.data)).catch(() => {});
  }, []);

  useEffect(() => {
    const t = setInterval(() => setReview((r) => (r + 1) % reviews.length), 6000);
    return () => clearInterval(t);
  }, []);

  const search = ({ checkIn, checkOut, guests }) =>
    navigate(`/rooms?checkIn=${checkIn}&checkOut=${checkOut}&guests=${guests}`);

  return (
    <>
      {/* HERO */}
      <section className="hero" ref={heroRef}>
        <motion.div className="hero-bg" style={{ y: heroY }}>
          <img src={HERO} alt="" />
        </motion.div>
        <div className="hero-overlay" />
        <Particles />
        <motion.div className="container hero-content" style={{ opacity: heroFade }}>
          <motion.span className="eyebrow" initial={{ opacity: 0, letterSpacing: '0.6em' }} animate={{ opacity: 1, letterSpacing: '0.3em' }} transition={{ duration: 1.4 }}>
            Luxury hotel · Mumbai
          </motion.span>
          <h1>
            {heroLine.map((w, i) => (
              <span className="word-mask" key={i}>
                <motion.span
                  className={w === 'occasion.' ? 'gold-text' : ''}
                  initial={{ y: '110%' }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3 + i * 0.09, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}&nbsp;
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2, duration: 0.8 }} className="hero-sub">
            Discover refined rooms, effortless booking and service that anticipates your every need.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.5, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}>
            <SearchBar onSearch={search} />
          </motion.div>
        </motion.div>
        <a href="#about" className="scroll-cue" aria-label="Scroll down"><FiChevronDown /></a>
      </section>

      {/* MARQUEE */}
      <div className="marquee" aria-hidden>
        <div className="marquee-track">
          {Array.from({ length: 2 }).map((_, k) => (
            <div key={k} className="marquee-set">
              {['Rooftop pool', 'Signature spa', 'Fine dining', 'Butler service', 'Sea-facing suites', 'Concierge 24/7', 'Airport transfers'].map((t) => (
                <span key={t}>{t} <i>✦</i></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ABOUT + STATS */}
      <section className="section" id="about">
        <div className="container">
          <div className="row align-items-center g-5">
            <div className="col-lg-6">
              <Reveal x={-40} y={0}>
                <div className="about-collage">
                  <Img src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=900&q=80" alt="Hotel lobby" />
                  <div className="about-badge">
                    <strong><CountUp to={15} suffix="+" /></strong>
                    <span>Years of hospitality</span>
                  </div>
                </div>
              </Reveal>
            </div>
            <div className="col-lg-6">
              <SectionTitle center={false} eyebrow="Welcome to HotelPro" title="Hospitality, reimagined for the digital age" />
              <Reveal delay={0.1}>
                <p className="muted lead-p">
                  HotelPro blends timeless luxury with a seamless digital experience. Browse live availability,
                  book in moments and manage your stay securely, whether you are travelling alone, with family or on business.
                </p>
              </Reveal>
              <div className="feature-list">
                {features.map((f, i) => (
                  <Reveal key={f.title} delay={0.15 + i * 0.1} className="feature-item">
                    <div className="feature-icon">{f.icon}</div>
                    <div><h5>{f.title}</h5><p className="muted mb-0">{f.text}</p></div>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>

          <div className="row g-4 stats">
            {[
              { n: 120, s: '+', l: 'Luxury rooms' },
              { n: 48000, s: '+', l: 'Happy guests' },
              { n: 4.9, s: '/5', l: 'Average rating', d: 1 },
              { n: 24, s: '/7', l: 'Concierge' },
            ].map((s, i) => (
              <div className="col-6 col-lg-3" key={s.l}>
                <Reveal delay={i * 0.1} className="stat">
                  <h3><CountUp to={s.n} suffix={s.s} decimals={s.d || 0} /></h3>
                  <span>{s.l}</span>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED ROOMS */}
      <section className="section section-alt">
        <div className="container">
          <SectionTitle eyebrow="Accommodation" title="Rooms & suites made to be remembered" sub="Hand-picked favourites loved by our guests." />
          <div className="row g-4">
            {rooms.slice(0, 3).map((r, i) => (
              <div className="col-md-6 col-lg-4" key={r._id}><RoomCard room={r} index={i} /></div>
            ))}
            {!rooms.length && [0, 1, 2].map((i) => (
              <div className="col-md-6 col-lg-4" key={i}><div className="skeleton" /></div>
            ))}
          </div>
          <Reveal className="text-center mt-5">
            <Link to="/rooms" className="btn-ghost">Explore all rooms →</Link>
          </Reveal>
        </div>
      </section>

      {/* PARALLAX BANNER */}
      <section className="banner" ref={bannerRef}>
        <motion.img src={BANNER} alt="" style={{ y: bannerY }} />
        <div className="hero-overlay" />
        <div className="container banner-content">
          <Reveal>
            <span className="eyebrow">The experience</span>
            <h2>Sink into the quiet. <span className="gold-text">Rise above the city.</span></h2>
            <Link to="/rooms" className="btn-gold mt-3">Reserve your escape</Link>
          </Reveal>
        </div>
      </section>

      {/* AMENITIES */}
      <section className="section">
        <div className="container">
          <SectionTitle eyebrow="Amenities" title="Everything, thoughtfully included" />
          <div className="row g-4">
            {amenities.map((a, i) => (
              <div className="col-sm-6 col-lg-4" key={a.title}>
                <Reveal delay={(i % 3) * 0.1} className="amenity">
                  <div className="amenity-icon">{a.icon}</div>
                  <h5>{a.title}</h5>
                  <p className="muted mb-0">{a.text}</p>
                </Reveal>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="section section-alt">
        <div className="container">
          <SectionTitle eyebrow="Guest stories" title="Loved by people who travel well" />
          <div className="testimonial">
            <span className="quote-mark">“</span>
            <AnimatePresence mode="wait">
              <motion.div
                key={review}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <p className="quote">{reviews[review].text}</p>
                <div className="who">
                  <div className="avatar">{reviews[review].name[0]}</div>
                  <div><strong>{reviews[review].name}</strong><span>{reviews[review].role}</span></div>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="dots">
              {reviews.map((_, i) => (
                <button key={i} className={i === review ? 'on' : ''} onClick={() => setReview(i)} aria-label={`Review ${i + 1}`} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section">
        <div className="container">
          <Reveal className="cta">
            <div>
              <h2>Ready for your next escape?</h2>
              <p className="muted mb-0"><FiMapPin /> Create a free account to book faster and manage every stay in one place.</p>
            </div>
            <Link to="/register" className="btn-gold">Create account</Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
