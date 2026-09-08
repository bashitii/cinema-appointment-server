import express from "express";
import db from "../db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();


// GET /api/movies
// Public - get all movies

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM movies ORDER BY movie_id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// GET /api/movies/:id
// Public - get one movie

router.get("/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM movies WHERE movie_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found"
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


// POST /api/movies
// Admin - add movie

router.post("/", adminAuth, async (req, res) => {
  const {
    title,
    description,
    genre,
    duration,
    release_date,
    poster_url,
    status
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO movies
      (title, description, genre, duration, release_date, poster_url, status)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        title,
        description,
        genre,
        duration,
        release_date,
        poster_url,
        status
      ]
    );

    res.status(201).json({
      message: "Movie added successfully",
      movie: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// PUT /api/movies/:id
// Admin - update movie

router.put("/:id", adminAuth, async (req, res) => {
  const {
    title,
    description,
    genre,
    duration,
    release_date,
    poster_url,
    status
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE movies
       SET title = $1,
           description = $2,
           genre = $3,
           duration = $4,
           release_date = $5,
           poster_url = $6,
           status = $7
       WHERE movie_id = $8
       RETURNING *`,
      [
        title,
        description,
        genre,
        duration,
        release_date,
        poster_url,
        status,
        req.params.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Movie not found"
      });
    }

    res.json({
      message: "Movie updated successfully",
      movie: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// DELETE /api/movies/:id
// Admin - delete movie

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const mid = req.params.id;
    // Get all showtimes for this movie
    const showtimes = await db.query("SELECT showtime_id FROM showtimes WHERE movie_id = $1", [mid]);
    for (const st of showtimes.rows) {
      // Delete appointment seats, then appointments for each showtime
      const appts = await db.query("SELECT appointment_id FROM appointments WHERE showtime_id = $1", [st.showtime_id]);
      for (const ap of appts.rows) {
        await db.query("DELETE FROM appointment_seats WHERE appointment_id = $1", [ap.appointment_id]);
      }
      await db.query("DELETE FROM appointments WHERE showtime_id = $1", [st.showtime_id]);
    }
    await db.query("DELETE FROM showtimes WHERE movie_id = $1", [mid]);

    const result = await db.query("DELETE FROM movies WHERE movie_id = $1 RETURNING *", [mid]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Movie not found" });
    res.json({ message: "Movie deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


export default router;