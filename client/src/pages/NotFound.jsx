import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <section className="page-hero text-center" style={{ minHeight: '70vh' }}>
      <div className="container">
        <h1 className="gold-text" style={{ fontSize: '7rem' }}>404</h1>
        <p className="muted">This page checked out early.</p>
        <Link to="/" className="btn-gold mt-3">Back to the lobby</Link>
      </div>
    </section>
  );
}
