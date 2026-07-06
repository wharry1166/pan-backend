const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');
const { authMiddleware } = require('../middleware/auth');

router.use(authMiddleware);

// --- Multer ---
const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^(image|video)\//.test(file.mimetype));
  }
});

// --- Event CRUD ---

router.post('/events', async (req, res) => {
  const { year, number, name, description, content, author } = req.body;
  if (!year || !number || !name) {
    return res.status(400).json({ error: 'year, number, name required' });
  }

  const db = await getDb();
  const existing = db.prepare(
    'SELECT id FROM events WHERE year = ? AND number = ?'
  ).get([Number(year), Number(number)]);

  if (existing) {
    return res.status(409).json({ error: 'Event with this year+number already exists' });
  }

  const info = db.prepare(`
    INSERT INTO events (year, number, name, description, content, author)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run([Number(year), Number(number), name, description || '', content || '', author || '']);

  res.status(201).json({ id: info.lastInsertRowid });
});

router.put('/events/:id', async (req, res) => {
  const db = await getDb();
  const { year, number, name, description, content, author } = req.body;

  db.prepare(`
    UPDATE events SET year=?, number=?, name=?, description=?, content=?, author=?, updated_at=datetime('now')
    WHERE id=?
  `).run([Number(year), Number(number), name, description || '', content || '', author || '', Number(req.params.id)]);

  res.json({ ok: true });
});

router.delete('/events/:id', async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);

  // Delete uploaded files from disk
  const mediaItems = db.prepare('SELECT file_path FROM media WHERE event_id = ? AND is_default = 0').all([id]);
  for (const item of mediaItems) {
    const fullPath = path.join(__dirname, '..', item.file_path);
    try { fs.unlinkSync(fullPath); } catch {}
  }

  // FK cascade deletes media records
  db.run('DELETE FROM events WHERE id = ?', [id]);
  res.json({ ok: true });
});

// --- Media ---

router.post('/media/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const { eventId } = req.body;
  if (!eventId) {
    try { fs.unlinkSync(req.file.path); } catch {}
    return res.status(400).json({ error: 'eventId required' });
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

router.delete('/media/:id', async (req, res) => {
  const db = await getDb();
  const id = Number(req.params.id);

  const item = db.prepare('SELECT * FROM media WHERE id = ?').get([id]);
  if (!item) return res.status(404).json({ error: 'Media not found' });

  // Delete file from disk if user-uploaded
  if (!item.file_path.startsWith('assets')) {
    const fullPath = path.join(__dirname, '..', item.file_path);
    try { fs.unlinkSync(fullPath); } catch {}
  }

  db.run('DELETE FROM media WHERE id = ?', [id]);
  res.json({ ok: true });
});

module.exports = router;
