import express from "express";
import db from "../db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();


// GET /api/showtimes
// Public - get all showtimes

router.get("/", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT showtimes.*, movies.title, screens.screen_name
      FROM showtimes
      JOIN movies ON showtimes.movie_id = movies.movie_id
      JOIN screens ON showtimes.screen_id = screens.screen_id
      ORDER BY showtimes.start_time
    `);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// GET /api/showtimes/:id
// Public - get one showtime

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT showtimes.*, movies.title, screens.screen_name
      FROM showtimes
      JOIN movies ON showtimes.movie_id = movies.movie_id
      JOIN screens ON showtimes.screen_id = screens.screen_id
      WHERE showtimes.showtime_id = $1
    `, [req.params.id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/showtimes
// Admin - add showtime

router.post("/", adminAuth, async (req, res) => {
  const { movie_id, screen_id, start_time, end_time } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO showtimes
       (movie_id, screen_id, start_time, end_time)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [movie_id, screen_id, start_time, end_time]
    );

    res.status(201).json({
      message: "Showtime added successfully",
      showtime: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// PUT /api/showtimes/:id
// Admin - update showtime

router.put("/:id", adminAuth, async (req, res) => {
  const { movie_id, screen_id, start_time, end_time } = req.body;

  try {
    const result = await db.query(
      `UPDATE showtimes
       SET movie_id = $1,
           screen_id = $2,
           start_time = $3,
           end_time = $4
       WHERE showtime_id = $5
       RETURNING *`,
      [movie_id, screen_id, start_time, end_time, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.json({
      message: "Showtime updated successfully",
      showtime: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE /api/showtimes/:id
// Admin - delete showtime

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM showtimes WHERE showtime_id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Showtime not found" });
    }

    res.json({
      message: "Showtime deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// GET /api/showtimes/:showtimeId/seats
// Public - get seats and their booking status

router.get("/:showtimeId/seats", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        seats.seat_id,
        seats.screen_id,
        seats.seat_number,
        seats.seat_row,
        CASE
          WHEN appointment_seats.seat_id IS NULL THEN false
          ELSE true
        END AS booked
      FROM seats
      JOIN showtimes
        ON seats.screen_id = showtimes.screen_id
      LEFT JOIN appointment_seats
        ON seats.seat_id = appointment_seats.seat_id
      LEFT JOIN appointments
        ON appointment_seats.appointment_id = appointments.appointment_id
        AND appointments.showtime_id = $1
        AND appointments.status = 'confirmed'
      WHERE showtimes.showtime_id = $1
      ORDER BY seats.seat_row, seats.seat_number
    `, [req.params.showtimeId]);

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;