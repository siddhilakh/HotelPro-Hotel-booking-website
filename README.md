# HotelPro

A modern hotel management platform: browse rooms, check live availability, book securely, and manage the property from an admin dashboard.

**Stack:** React (Vite) · Bootstrap 5 · Framer Motion · Node.js · Express · MongoDB (Mongoose) · JWT

## Quick start

```bash
npm run install:all   # installs root, server and client dependencies
npm run dev           # API on :5000, web app on :5173
```

Open http://localhost:5173.

No MongoDB install is needed for development. If `server/.env` has no `MONGO_URI`, the API starts an embedded MongoDB
(data is stored in `server/.data`; the binary is downloaded on first run). To use your own database, copy
`server/.env.example` to `server/.env` and set `MONGO_URI` and a strong `JWT_SECRET`.

The database is seeded on first run with 6 rooms and two demo accounts:

| Role  | Email                | Password   |
| ----- | -------------------- | ---------- |
| Admin | admin@hotelpro.com   | Admin@123  |
| Guest | guest@hotelpro.com   | Guest@123  |

`npm run seed --prefix server` wipes and reseeds. For production, `npm run build` then `npm start` serves the built app from Express.

## Features

- Animated landing page: parallax hero, scroll reveals, count-up stats, marquee, testimonial carousel
- Room catalogue with type filter, sorting and date-based availability
- Booking flow with live price/tax summary, double-booking protection and confirmation animation
- JWT authentication (bcrypt-hashed passwords, role-based access, rate-limited auth routes)
- Guest area: view and cancel bookings
- Admin dashboard: revenue chart, occupancy, room CRUD, booking status management (check-in / check-out / cancel)

## API

| Method | Route | Access |
| ------ | ----- | ------ |
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/auth/me` | user |
| GET | `/api/rooms`, `/api/rooms/:id`, `/api/rooms/:id/availability` | public |
| POST/PUT/DELETE | `/api/rooms`, `/api/rooms/:id` | admin |
| POST | `/api/bookings` | user |
| GET | `/api/bookings/mine` | user |
| PATCH | `/api/bookings/:id/cancel` | owner or admin |
| GET | `/api/bookings` | admin |
| PATCH | `/api/bookings/:id/status` | admin |
| GET | `/api/admin/stats` | admin |

Payments are simulated; no real payment provider is integrated.
