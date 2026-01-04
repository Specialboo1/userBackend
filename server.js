import express from "express";
import cors from "cors";
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// Connect to Supabase Postgres
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD,
  host: "db.odzpmzlzguracdsqnkjs.supabase.co",
  port: 5432,
  database: process.env.DB_NAME || "postgres",
  ssl: { rejectUnauthorized: false },
});

// Health check
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "Database connected successfully" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ------------------- USERS CRUD -------------------

// Get all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new user
app.post("/api/users", async (req, res) => {
  const { name, age } = req.body;
  try {
    const result = await pool.query(
      "INSERT INTO users (name, age) VALUES ($1, $2) RETURNING *",
      [name, age]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
app.put("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  const { name, age } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET name=$1, age=$2, updated_at=NOW() WHERE id=$3 RETURNING *",
      [name, age, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
app.delete("/api/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query("DELETE FROM users WHERE id=$1", [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --------------------------------------------------

const port = process.env.PORT || 5000;
app.listen(port, () =>
  console.log(`Backend running on http://localhost:${port}`)
);
