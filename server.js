import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import authRoutes from "./routes/auth.js";
import movieRoutes from "./routes/movies.js";
import screenRoutes from "./routes/screen.js";
import seatRoutes from "./routes/seats.js";
import showtimeRoutes from "./routes/showtimes.js";
import appointmentRoutes from "./routes/appointments.js";
import userRoutes from "./routes/users.js";
import db from "./db.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/screens", screenRoutes);
app.use("/api/seats", seatRoutes);
app.use("/api/showtimes", showtimeRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
    res.send("Cinema Appointment API is running");
});

app.get("/api/health", (req, res) => {
    res.json({
        message: "Cinema Appointment API is running"
    });
});

db.connect().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});