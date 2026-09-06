import express from "express";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

// GET /api/tmdb/popular - Trending / popular movies right now
router.get("/popular", async (req, res) => {
  try {
    const response = await fetch(
      "https://api.themoviedb.org/3/movie/popular?language=en-US&page=1",
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
    res.status(500).json({ message: "TMDB popular request failed" });
  }
});


// GET /api/tmdb/search?query=... - Search movies on TMDB
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