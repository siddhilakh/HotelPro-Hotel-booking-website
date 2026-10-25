import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiFacebook, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="hp-footer">
      <div className="container">
        <div className="row g-5">
          <div className="col-lg-4">
            <Link to="/" className="brand mb-3 d-inline-flex">
              <span className="brand-mark">H</span>
              <span>Hotel<em>Pro</em></span>
            </Link>
            <p className="muted">
              A digital-first hospitality platform. Secure bookings, real-time availability and a
              guest experience that feels effortless.
            </p>
            <div className="d-flex gap-3 social">
              <a href="#!" aria-label="Instagram"><FiInstagram /></a>
              <a href="#!" aria-label="Twitter"><FiTwitter /></a>
              <a href="#!" aria-label="Facebook"><FiFacebook /></a>
            </div>
          </div>
          <div className="col-6 col-lg-2 offset-lg-1">
            <h6>Explore</h6>
            <ul className="list-unstyled foot-links">
              <li><Link to="/rooms">Rooms & Suites</Link></li>
              <li><Link to="/bookings">My Stays</Link></li>
              <li><Link to="/login">Sign in</Link></li>
            </ul>
          </div>
          <div className="col-6 col-lg-2">
            <h6>Stay</h6>
            <ul className="list-unstyled foot-links">
              <li><Link to="/rooms?type=Deluxe">Deluxe</Link></li>
              <li><Link to="/rooms?type=Suite">Suites</Link></li>
              <li><Link to="/rooms?type=Presidential">Presidential</Link></li>
            </ul>
          </div>
          <div className="col-lg-3">
            <h6>Contact</h6>
            <ul className="list-unstyled foot-links">
              <li><FiMapPin /> 1 Marine Drive, Mumbai</li>
              <li><FiPhone /> +91 22 4000 1234</li>
              <li><FiMail /> stay@hotelpro.com</li>
            </ul>
          </div>
        </div>
        <div className="foot-bottom">
          <span>© {new Date().getFullYear()} HotelPro. All rights reserved.</span>
          <span>Crafted for modern hospitality</span>
        </div>
      </div>
    </footer>
  );
}
