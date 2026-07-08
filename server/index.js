require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
app.use(cors());
app.use(express.json());

// This "pool" is like a phone line open to Postgres, ready whenever we need it
const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
});

// DOOR 1: Get all favorites for a user
// Example: GET /favorites/someone@gmail.com
app.get('/favorites/:userEmail', async (req, res) => {
  try {
    const { userEmail } = req.params;
    const result = await pool.query(
      'SELECT * FROM favorites WHERE user_email = $1 ORDER BY created_at DESC',
      [userEmail]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not fetch favorites' });
  }
});

// DOOR 2: Add a favorite
// Example: POST /favorites with body { userEmail, skinId, skinName, skinImage }
app.post('/favorites', async (req, res) => {
  try {
    const { userEmail, skinId, skinName, skinImage } = req.body;
    const result = await pool.query(
      `INSERT INTO favorites (user_email, skin_id, skin_name, skin_image)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_email, skin_id) DO NOTHING
       RETURNING *`,
      [userEmail, skinId, skinName, skinImage]
    );
    res.json(result.rows[0] || { message: 'Already favorited' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not add favorite' });
  }
});

// DOOR 3: Remove a favorite
// Example: DELETE /favorites with body { userEmail, skinId }
app.delete('/favorites', async (req, res) => {
  try {
    const { userEmail, skinId } = req.body;
    await pool.query(
      'DELETE FROM favorites WHERE user_email = $1 AND skin_id = $2',
      [userEmail, skinId]
    );
    res.json({ message: 'Removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Could not remove favorite' });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});