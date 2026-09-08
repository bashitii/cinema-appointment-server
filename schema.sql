CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE movies (
  movie_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT NOT NULL,
  genre VARCHAR(80) NOT NULL,
  duration INTEGER NOT NULL CHECK (duration > 0),
  release_date DATE,
  poster_url TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'now_showing' CHECK (status IN ('now_showing', 'coming_soon'))
);

CREATE TABLE screens (
  screen_id SERIAL PRIMARY KEY,
  screen_name VARCHAR(50) UNIQUE NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0)
);

CREATE TABLE seats (
  seat_id SERIAL PRIMARY KEY,
  screen_id INTEGER NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
  seat_number VARCHAR(10) NOT NULL,
  seat_row VARCHAR(10) NOT NULL,
  UNIQUE (screen_id, seat_row, seat_number)
);

CREATE TABLE showtimes (
  showtime_id SERIAL PRIMARY KEY,
  movie_id INTEGER NOT NULL REFERENCES movies(movie_id) ON DELETE CASCADE,
  screen_id INTEGER NOT NULL REFERENCES screens(screen_id) ON DELETE CASCADE,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  CHECK (end_time > start_time)
);

CREATE TABLE appointments (
  appointment_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(user_id),
  showtime_id INTEGER NOT NULL REFERENCES showtimes(showtime_id),
  booking_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled'))
);

CREATE TABLE appointment_seats (
  appointment_id INTEGER REFERENCES appointments(appointment_id) ON DELETE CASCADE,
  seat_id INTEGER REFERENCES seats(seat_id),
  PRIMARY KEY (appointment_id, seat_id)
);

