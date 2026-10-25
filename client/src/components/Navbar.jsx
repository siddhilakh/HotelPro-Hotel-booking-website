import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMenu, FiX, FiLogOut, FiUser } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { to: '/', label: 'Home', end: true },
    { to: '/rooms', label: 'Rooms & Suites' },
    ...(user ? [{ to: '/bookings', label: 'My Stays' }] : []),
    ...(user?.role === 'admin' ? [{ to: '/admin', label: 'Dashboard' }] : []),
  ];

  const signOut = () => {
    logout();
    setOpen(false);
    navigate('/');
  };

  return (
    <header className={`hp-nav ${scrolled || open ? 'scrolled' : ''}`}>
      <div className="container d-flex align-items-center justify-content-between">
        <Link to="/" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">H</span>
          <span>Hotel<em>Pro</em></span>
        </Link>

        <nav className="d-none d-lg-flex align-items-center gap-4">
          {links.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className="nav-link-hp">
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="d-none d-lg-flex align-items-center gap-3">
          {user ? (
            <>
              <span className="nav-user"><FiUser /> {user.name.split(' ')[0]}</span>
              <button className="btn-ghost sm" onClick={signOut}><FiLogOut /> Sign out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link-hp">Sign in</Link>
              <Link to="/register" className="btn-gold sm">Join now</Link>
            </>
          )}
        </div>

        <button className="burger d-lg-none" onClick={() => setOpen((o) => !o)} aria-label="Menu">
          {open ? <FiX /> : <FiMenu />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="mobile-menu d-lg-none"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="container py-3 d-flex flex-column gap-3">
              {links.map((l) => (
                <NavLink key={l.to} to={l.to} end={l.end} className="nav-link-hp" onClick={() => setOpen(false)}>
                  {l.label}
                </NavLink>
              ))}
              {user ? (
                <button className="btn-ghost" onClick={signOut}>Sign out</button>
              ) : (
                <div className="d-flex gap-2">
                  <Link to="/login" className="btn-ghost flex-fill" onClick={() => setOpen(false)}>Sign in</Link>
                  <Link to="/register" className="btn-gold flex-fill" onClick={() => setOpen(false)}>Join now</Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
