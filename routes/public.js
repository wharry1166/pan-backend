const express = require('express');
const router = express.Router();
const { getDb } = require('../db');

router.get('/events', async (req, res) => {
  const db = await getDb();
  const rows = db.prepare(`
    SELECT id, year, number, name, description, author
    FROM events
    ORDER BY year DESC, number ASC
  `).all();

  const grouped = {};
  for (const row of rows) {
    const y = String(row.year);
    if (!grouped[y]) grouped[y] = [];
    grouped[y].push(row);
  }

  res.json({ years: grouped });
});

router.get('/events/:year/:number', async (req, res) => {
  const db = await getDb();
  const { year, number } = req.params;

  const event = db.prepare(
    'SELECT * FROM events WHERE year = ? AND number = ?'
  ).get([Number(year), Number(number)]);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const media = db.prepare(`
    SELECT id, file_path, file_type, is_video, is_default, sort_order
    FROM media
    WHERE event_id = ?
    ORDER BY sort_order ASC, id ASC
  `).all([event.id]);

  res.json({ event, media });
});

module.exports = router;
