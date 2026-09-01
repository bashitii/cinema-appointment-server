import express from "express";
import db from "../db.js";

const router = express.Router();


// GET /api/appointments
// Logged-in user - get own appointments

router.get("/", async (req, res) => {
  const userId = req.headers["x-user-id"];

  try {
    const result = await db.query(`
      SELECT
        appointments.*,
        movies.title,
        showtimes.start_time,
        showtimes.end_time,
        screens.screen_name
      FROM appointments
      JOIN showtimes
        ON appointments.showtime_id = showtimes.showtime_id
      JOIN movies
        ON showtimes.movie_id = movies.movie_id
      JOIN screens
        ON showtimes.screen_id = screens.screen_id
      WHERE appointments.user_id = $1
      ORDER BY appointments.booking_date DESC
    `, [userId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// POST /api/appointments
// Customer - create booking

router.post("/", async (req, res) => {
  const userId = req.headers["x-user-id"];
  const { showtime_id, seat_ids } = req.body;

  try {

    // Check showtime

    const showtime = await db.query(
      "SELECT * FROM showtimes WHERE showtime_id = $1",
      [showtime_id]
    );

    if (showtime.rows.length === 0) {
      return res.status(404).json({
        message: "Showtime not found"
      });
    }


    // Check seats

    for (const seatId of seat_ids) {
      const seat = await db.query(
        "SELECT * FROM seats WHERE seat_id = $1 AND screen_id = $2",
        [seatId, showtime.rows[0].screen_id]
      );

      if (seat.rows.length === 0) {
        return res.status(400).json({
          message: "Invalid seat"
        });
      }
    }


    // Check if seats are already booked

    const booked = await db.query(`
      SELECT appointment_seats.seat_id
      FROM appointment_seats
      JOIN appointments
        ON appointment_seats.appointment_id = appointments.appointment_id
      WHERE appointments.showtime_id = $1
      AND appointments.status = 'confirmed'
      AND appointment_seats.seat_id = ANY($2)
    `, [showtime_id, seat_ids]);

    if (booked.rows.length > 0) {
      return res.status(400).json({
        message: "One or more seats are already booked"
      });
    }


    // Create appointment

    const appointment = await db.query(
      `INSERT INTO appointments (user_id, showtime_id)
       VALUES ($1, $2)
       RETURNING *`,
      [userId, showtime_id]
    );

    const appointmentId = appointment.rows[0].appointment_id;


    // Add seats

    for (const seatId of seat_ids) {
      await db.query(
        `INSERT INTO appointment_seats
         (appointment_id, seat_id)
         VALUES ($1, $2)`,
        [appointmentId, seatId]
      );
    }


    res.status(201).json({
      message: "Appointment created successfully",
      appointment: appointment.rows[0],
      seats: seat_ids
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// GET /api/appointments/:id
// User - get appointment

router.get("/:id", async (req, res) => {
  const userId = req.headers["x-user-id"];

  try {
    const result = await db.query(`
      SELECT
        appointments.*,
        movies.title,
        showtimes.start_time,
        showtimes.end_time,
        screens.screen_name
      FROM appointments
      JOIN showtimes
        ON appointments.showtime_id = showtimes.showtime_id
      JOIN movies
        ON showtimes.movie_id = movies.movie_id
      JOIN screens
        ON showtimes.screen_id = screens.screen_id
      WHERE appointments.appointment_id = $1
      AND appointments.user_id = $2
    `, [req.params.id, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    res.json(result.rows[0]);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// PUT /api/appointments/:id/cancel
// User - cancel appointment

router.put("/:id/cancel", async (req, res) => {
  const userId = req.headers["x-user-id"];

  try {
    const result = await db.query(
      `UPDATE appointments
       SET status = 'cancelled'
       WHERE appointment_id = $1
       AND user_id = $2
       AND status = 'confirmed'
       RETURNING *`,
      [req.params.id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Appointment not found or already cancelled"
      });
    }

    res.json({
      message: "Appointment cancelled successfully",
      appointment: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// PUT /api/appointments/:id
// Admin - change appointment status

router.put("/:id", async (req, res) => {
  const role = req.headers["x-role"];
  const { status } = req.body;

  if (role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  try {
    const result = await db.query(
      `UPDATE appointments
       SET status = $1
       WHERE appointment_id = $2
       RETURNING *`,
      [status, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Appointment not found"
      });
    }

    res.json({
      message: "Appointment updated successfully",
      appointment: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;