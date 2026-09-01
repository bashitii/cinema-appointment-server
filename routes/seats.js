import express from "express";
import db from "../db.js";
import adminAuth from "../middleware/adminAuth.js";

const router = express.Router();


// GET /api/seats/:screenId
// Public - get seats for a screen

router.get("/:screenId", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM seats WHERE screen_id = $1 ORDER BY seat_row, seat_number",
      [req.params.screenId]
    );

    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// POST /api/seats
// Admin - add seat

router.post("/", adminAuth, async (req, res) => {
  const { screen_id, seat_number, seat_row } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO seats (screen_id, seat_number, seat_row)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [screen_id, seat_number, seat_row]
    );

    res.status(201).json({
      message: "Seat added successfully",
      seat: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// PUT /api/seats/:id
// Admin - update seat

router.put("/:id", adminAuth, async (req, res) => {
  const { screen_id, seat_number, seat_row } = req.body;

  try {
    const result = await db.query(
      `UPDATE seats
       SET screen_id = $1,
           seat_number = $2,
           seat_row = $3
       WHERE seat_id = $4
       RETURNING *`,
      [screen_id, seat_number, seat_row, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Seat not found"
      });
    }

    res.json({
      message: "Seat updated successfully",
      seat: result.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// DELETE /api/seats/:id
// Admin - delete seat

router.delete("/:id", adminAuth, async (req, res) => {
  try {
    const result = await db.query(
      "DELETE FROM seats WHERE seat_id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Seat not found"
      });
    }

    res.json({
      message: "Seat deleted successfully"
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;