# 🎬 Cinema Appointment Backend (Express + PostgreSQL)

This is the **backend** for the cinema appointment app. It provides APIs for authentication, movies, screens, showtimes, seat selection, and appointment booking.

## 🏗️ Tech Stack

- Node.js + Express
- PostgreSQL (via `pg`)
- `bcrypt`, `jsonwebtoken`
- `dotenv`, `cors`, `morgan`

## 🚀 Getting Started

```bash
# 1. Install dependencies
cd cinema-appointment-server
npm install

# 2. Create a PostgreSQL database
# e.g. cinema_appointment_db

# 3. Add your .env file (see Configuration below)

# 4. Start the server
npm start
```

## ⚙️ Configuration

Create a `.env` file in the root:

```env
PORT=5050
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/cinema_appointment_db
JWT_SECRET=your-secret-key
TMDB_API_KEY=your-tmdb-bearer-token
```

## 🗂️ Project Structure

```
cinema-appointment-server/
├── routes/
│   ├── auth.js          # register & login
│   ├── movies.js        # movie CRUD
│   ├── screen.js        # screen CRUD + seat generation
│   ├── seats.js         # get seats by screen
│   ├── showtimes.js     # showtime CRUD + seats by showtime
│   ├── appointments.js  # booking, cancel, admin manage
│   ├── users.js         # admin user management
│   └── tmdb.js          # TMDB third-party API proxy
├── middleware/
│   └── adminAuth.js     # role-based guard (admin only)
├── db.js                # pg client
└── server.js            # app entry point
```

## 📡 API Endpoints

The API runs on: `http://localhost:5050`

---

### 🔐 Auth Routes

**Base URL**: `/api/auth`

| Method | Endpoint     | Description           |
|--------|--------------|-----------------------|
| POST   | `/register`  | Register a new user   |
| POST   | `/login`     | Login and get token   |
| PUT    | `/profile`   | Update user profile   |

#### POST `/api/auth/register`
```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "123456"
}
```

#### POST `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "123456"
}
```

🔸 Admin login uses same endpoint — role check happens in the frontend.

---

### 🎬 Movie Routes

**Base URL**: `/api/movies`

| Method | Endpoint  | Description              |
|--------|-----------|--------------------------|
| GET    | `/`       | Get all movies           |
| GET    | `/:id`    | Get movie by ID          |
| POST   | `/`       | Add a new movie (Admin)  |
| PUT    | `/:id`    | Update movie (Admin)     |
| DELETE | `/:id`    | Delete movie (Admin)     |

🔐 Admin routes require headers: `x-user-id` and `x-role: admin`

#### POST `/api/movies`
```json
{
  "title": "Dune: Part Two",
  "description": "Paul Atreides unites with the Fremen...",
  "genre": "Sci-Fi",
  "duration": 166,
  "release_date": "2024-03-01",
  "poster_url": "https://image.tmdb.org/t/p/w500/...",
  "status": "now_showing"
}
```

---

### 🏢 Screen Routes

**Base URL**: `/api/screens`

| Method | Endpoint                  | Description                        |
|--------|---------------------------|------------------------------------|
| GET    | `/`                       | Get all screens                    |
| POST   | `/`                       | Add screen + auto-generate seats   |
| PUT    | `/:id`                    | Update screen (Admin)              |
| DELETE | `/:id`                    | Delete screen (Admin)              |
| POST   | `/:id/generate-seats`     | Regenerate seats for a screen      |

#### POST `/api/screens`
```json
{
  "screen_name": "Screen 3",
  "capacity": 60
}
```
> Seats are automatically generated based on capacity when a screen is created.

---

### 💺 Seat Routes

**Base URL**: `/api/seats`

| Method | Endpoint        | Description                  |
|--------|-----------------|------------------------------|
| GET    | `/:screen_id`   | Get all seats for a screen   |

---

### 📅 Showtime Routes

**Base URL**: `/api/showtimes`

| Method | Endpoint          | Description                         |
|--------|-------------------|-------------------------------------|
| GET    | `/`               | Get all showtimes                   |
| GET    | `/:id`            | Get showtime by ID                  |
| GET    | `/:id/seats`      | Get seats with booked status        |
| POST   | `/`               | Add showtime (Admin)                |
| PUT    | `/:id`            | Update showtime (Admin)             |
| DELETE | `/:id`            | Delete showtime (Admin)             |

#### POST `/api/showtimes`
```json
{
  "movie_id": 1,
  "screen_id": 1,
  "start_time": "2026-09-10T13:00:00",
  "end_time": "2026-09-10T15:46:00"
}
```

---

### 🎫 Appointment Routes

**Base URL**: `/api/appointments`

| Method | Endpoint          | Description                              |
|--------|-------------------|------------------------------------------|
| GET    | `/`               | Get own appointments (or all for admin)  |
| GET    | `/:id`            | Get appointment by ID                    |
| POST   | `/`               | Book an appointment                      |
| PUT    | `/:id/cancel`     | Cancel appointment (user)               |
| PUT    | `/:id`            | Update appointment status (Admin)        |

#### POST `/api/appointments`
```json
{
  "showtime_id": 5,
  "seat_ids": [12, 13, 14]
}
```

🔐 Requires headers: `x-user-id` and `x-role`

---

### 👥 User Routes

**Base URL**: `/api/users`

| Method | Endpoint  | Description              |
|--------|-----------|--------------------------|
| GET    | `/`       | Get all users (Admin)    |
| DELETE | `/:id`    | Delete user (Admin)      |

---

### 🌐 TMDB Routes (Third-Party API)

**Base URL**: `/api/tmdb`

| Method | Endpoint            | Description                          |
|--------|---------------------|--------------------------------------|
| GET    | `/popular`          | Get popular movies from TMDB         |
| GET    | `/search?query=...` | Search movies on TMDB                |
| GET    | `/movie/:id`        | Get full movie details from TMDB     |

Used in the frontend to:
- Show a "Trending Worldwide" section on the homepage
- Auto-fill the Add Movie form in the admin panel
