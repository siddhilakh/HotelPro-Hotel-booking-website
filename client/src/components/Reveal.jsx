import { motion } from 'framer-motion';

// Fades and lifts content into view the first time it scrolls on screen.
export default function Reveal({ children, delay = 0, y = 36, x = 0, className = '', as = 'div' }) {
  const Tag = motion[as];
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  );
}

export function SectionTitle({ eyebrow, title, sub, center = true }) {
  return (
    <Reveal className={`section-title ${center ? 'text-center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {sub && <p className="muted">{sub}</p>}
    </Reveal>
  );
}
