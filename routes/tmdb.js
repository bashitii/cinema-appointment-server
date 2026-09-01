import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// Search movies
router.get("/search", async (req, res) => {
  try {
    const { query } = req.query;

    const response = await fetch(
      `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(query)}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          accept: "application/json"
        }
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "TMDB search failed" });
  }
});

// Get movie details
router.get("/movie/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.TMDB_API_KEY}`,
          accept: "application/json"
        }
      }
    );

    const data = await response.json();

    res.json(data);
  } catch (error) {
    res.status(500).json({ message: "TMDB movie request failed" });
  }
});

export default router;