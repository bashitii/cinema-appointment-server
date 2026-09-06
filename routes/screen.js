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

    const screen = result.rows[0];
    const seatsCreated = await generateSeats(screen.screen_id, screen.capacity);

    res.status(201).json({
      message: "Screen added successfully",
      screen,
      seats_created: seatsCreated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});


// POST /api/screens/:id/generate-seats
// Admin - (re)generate all seats for an existing screen based on its capacity

router.post("/:id/generate-seats", adminAuth, async (req, res) => {
  try {
    const screenResult = await db.query(
      "SELECT * FROM screens WHERE screen_id = $1",
      [req.params.id]
    );

    if (screenResult.rows.length === 0) {
      return res.status(404).json({ message: "Screen not found" });
    }

    const screen = screenResult.rows[0];

    // Remove old seats first
    await db.query("DELETE FROM seats WHERE screen_id = $1", [screen.screen_id]);

    const seatsCreated = await generateSeats(screen.screen_id, screen.capacity);

    res.json({
      message: `${seatsCreated} seats generated for ${screen.screen_name}`,
      seats_created: seatsCreated
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
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


// ── Helper: generate cinema-layout seats for a screen ─────────────────────────
async function generateSeats(screenId, capacity) {
  const ROWS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const seatsPerRow = capacity <= 50 ? 8 : capacity <= 100 ? 10 : 12;
  const numRows = Math.ceil(capacity / seatsPerRow);

  let count = 0;
  for (let r = 0; r < numRows && count < capacity; r++) {
    const rowLetter = ROWS[r];
    for (let n = 1; n <= seatsPerRow && count < capacity; n++) {
      await db.query(
        "INSERT INTO seats (screen_id, seat_row, seat_number) VALUES ($1, $2, $3)",
        [screenId, rowLetter, n]
      );
      count++;
    }
  }
  return count;
}

export default router;