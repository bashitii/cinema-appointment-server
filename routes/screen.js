import express from "express";
import db from "../db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();


// GET /api/screens
// Public - get all screens

router.get("/", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM screens ORDER BY screen_id"
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// POST /api/screens
// Admin - add screen

router.post("/", adminAuth, async (req, res) => {
  const { screen_name, capacity } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO screens (screen_name, capacity)
       VALUES ($1, $2)
       RETURNING *`,
      [screen_name, capacity]
    );

    res.status(201).json({
      message: "Screen added successfully",
      screen: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// PUT /api/screens/:id
// Admin - update screen

router.put("/:id", adminAuth, async (req, res) => {
  const { screen_name, capacity } = req.body;

  try {
    const result = await db.query(
      `UPDATE screens
       SET screen_name = $1,
           capacity = $2
       WHERE screen_id = $3
       RETURNING *`,
      [screen_name, capacity, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Screen not found"
      });
    }

    res.json({
      message: "Screen updated successfully",
      screen: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// DELETE /api/screens/:id
// Admin - delete screen

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM screens WHERE screen_id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Screen not found"
      });
    }

    res.json({
      message: "Screen deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;