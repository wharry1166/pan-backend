const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { getDb } = require('../db');

const storage = multer.diskStorage({
  destination: path.join(__dirname, '..', 'uploads'),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, 'sleep_' + uuidv4() + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    cb(null, /^image\//.test(file.mimetype));
  }
});

// GET /api/sleep — list all photos
router.get('/', async (req, res) => {
  const db = await getDb();
  const photos = db.prepare(
    'SELECT id, file_path, uploaded_by, created_at FROM sleep_photos ORDER BY created_at DESC'
  ).all();
  res.json(photos);
});

// POST /api/sleep — upload a photo
router.post('/', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: '请选择图片' });
  }

  const uploadedBy = (req.body.uploaded_by || '').trim() || '匿名';
  const filePath = 'uploads/' + req.file.filename;

  const db = await getDb();
  const info = db.prepare(
    'INSERT INTO sleep_photos (file_path, uploaded_by) VALUES (?, ?)'
  ).run([filePath, uploadedBy]);

  res.status(201).json({ id: info.lastInsertRowid, url: '/' + filePath, uploaded_by: uploadedBy });
});

module.exports = router;
