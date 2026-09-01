import express from "express";
import db from "../db.js";

const router = express.Router();


// GET /api/users
// Admin - get all users

router.get("/", async (req, res) => {
  const role = req.headers["x-role"];

  if (role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  try {
    const result = await db.query(
      "SELECT user_id, full_name, email, role, created_at FROM users ORDER BY user_id"
    );

    res.json(result.rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


// GET /api/users/:id
// Admin - get one user

router.get("/:id", async (req, res) => {
  const role = req.headers["x-role"];

  if (role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  try {
    const result = await db.query(
      "SELECT user_id, full_name, email, role, created_at FROM users WHERE user_id = $1",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
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


// DELETE /api/users/:id
// Admin - delete user

router.delete("/:id", async (req, res) => {
  const role = req.headers["x-role"];

  if (role !== "admin") {
    return res.status(403).json({
      message: "Admin access only"
    });
  }

  try {
    const result = await db.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING user_id, full_name, email, role",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    res.json({
      message: "User deleted successfully",
      user: result.rows[0]
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
});


export default router;