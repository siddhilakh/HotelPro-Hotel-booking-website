import { useState } from 'react';

// Image with an elegant gradient placeholder if the source fails to load.
export default function Img({ src, alt, className = '' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`img-fallback ${className}`} role="img" aria-label={alt} />;
  return <img src={src} alt={alt} className={className} loading="lazy" onError={() => setFailed(true)} />;
}
