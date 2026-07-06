const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

// --- Multer for public uploads ---
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'contrib_' + uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^(image|video)\//.test(file.mimetype));
  }
});

// POST /api/contributions — create a new event (public)
router.post('/', async (req, res) => {
  const { year, name, description, content, author } = req.body;
  if (!year || !name) {
    return res.status(400).json({ error: 'year 和 name 为必填项' });
  }

  const db = await getDb();

  // Auto-assign next number for the given year
  const last = db.prepare(
    'SELECT COALESCE(MAX(number), 0) + 1 AS next FROM events WHERE year = ?'
  ).get([Number(year)]);

  const info = db.prepare(`
    INSERT INTO events (year, number, name, description, content, author)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run([Number(year), last.next, name, description || '', content || '', author || '']);

  res.status(201).json({ id: info.lastInsertRowid, year: Number(year), number: last.next });
});

// POST /api/contributions/media — upload media for an event (public)
router.post('/media', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择文件' });
  }

  const { eventId } = req.body;
  if (!eventId) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: 'eventId 为必填项' });
  }

  const isVideo = /^video\//.test(req.file.mimetype);
  const filePath = 'uploads/' + req.file.filename;

  const db = await getDb();
  const maxOrder = db.prepare(
    "SELECT COALESCE(MAX(sort_order), -1) + 1 AS next FROM media WHERE event_id = ?"
  ).get([Number(eventId)]);

  const info = db.prepare(`
    INSERT INTO media (event_id, file_path, file_type, is_video, is_default, sort_order)
    VALUES (?, ?, ?, ?, 0, ?)
  `).run([Number(eventId), filePath, req.file.mimetype, isVideo ? 1 : 0, maxOrder.next]);

  res.status(201).json({ id: info.lastInsertRowid, url: '/' + filePath });
});

module.exports = router;
