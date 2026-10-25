// Wraps async route handlers so rejected promises reach the error middleware.
export const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export function notFound(req, res) {
  res.status(404).json({ message: `Route ${req.originalUrl} not found` });
}

export function errorHandler(err, req, res, _next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.code === 11000) {
    status = 409;
    message = 'That email is already registered';
  } else if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier';
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}

export const httpError = (status, message) => Object.assign(new Error(message), { status });
