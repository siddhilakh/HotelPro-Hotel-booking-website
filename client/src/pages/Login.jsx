import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { FiMail, FiLock, FiUser, FiPhone, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext.jsx';
import { errMsg } from '../api';

export default function Login({ register: isRegister = false }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const user = isRegister ? await register(form) : await login(form.email, form.password);
      toast.success(`Welcome${isRegister ? '' : ' back'}, ${user.name.split(' ')[0]}!`);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/rooms'), { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const fill = (email, password) => setForm((f) => ({ ...f, email, password }));

  return (
    <section className="auth">
      <div className="auth-art d-none d-lg-flex">
        <div className="auth-art-inner">
          <span className="eyebrow">HotelPro</span>
          <h2>Your next stay, <span className="gold-text">one sign-in away.</span></h2>
          <p className="muted">Manage reservations, discover exclusive rooms and check in faster.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <motion.div className="auth-card" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <h1>{isRegister ? 'Create your account' : 'Welcome back'}</h1>
          <p className="muted">{isRegister ? 'Join HotelPro in a few seconds.' : 'Sign in to manage your stays.'}</p>

          <form onSubmit={submit} className="d-grid gap-3 mt-4">
            <AnimatePresence initial={false}>
              {isRegister && (
                <motion.div key="reg" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="d-grid gap-3 overflow-hidden">
                  <div className="input-ico"><FiUser /><input placeholder="Full name" value={form.name} onChange={set('name')} required /></div>
                  <div className="input-ico"><FiPhone /><input placeholder="Phone (optional)" value={form.phone} onChange={set('phone')} /></div>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="input-ico"><FiMail /><input type="email" placeholder="Email address" value={form.email} onChange={set('email')} required /></div>
            <div className="input-ico">
              <FiLock />
              <input type={show ? 'text' : 'password'} placeholder="Password" minLength={6} value={form.password} onChange={set('password')} required />
              <button type="button" className="eye" onClick={() => setShow((s) => !s)} aria-label="Toggle password">{show ? <FiEyeOff /> : <FiEye />}</button>
            </div>
            <button className="btn-gold" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}</button>
          </form>

          <p className="switch">
            {isRegister ? 'Already have an account?' : 'New to HotelPro?'}{' '}
            <Link to={isRegister ? '/login' : '/register'} state={location.state}>{isRegister ? 'Sign in' : 'Create one'}</Link>
          </p>

          {!isRegister && (
            <div className="demo">
              <span>Try the demo:</span>
              <button type="button" onClick={() => fill('guest@hotelpro.com', 'Guest@123')}>Guest</button>
              <button type="button" onClick={() => fill('admin@hotelpro.com', 'Admin@123')}>Admin</button>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
