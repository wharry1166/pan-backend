require('dotenv').config();
require('express-async-errors');

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const publicRoutes = require('./routes/public');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const contributionRoutes = require('./routes/contributions');
const sleepRoutes = require('./routes/sleep');
const { getDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Auto-seed on first run
(async () => {
  try {
    const db = await getDb();
    const count = db.prepare('SELECT COUNT(*) AS c FROM events').get();
    if (count.c === 0) {
      console.log('Empty database — running seed...');
      await require('./seed')();
      console.log('Seed complete.');
    }
  } catch (err) {
    console.error('Auto-seed check failed:', err.message);
  }
})();

// Middleware
app.use(cors());
app.use(express.json());

// Static files — serve the entire project root
app.use(express.static(__dirname, {
  dotfiles: 'deny',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API routes
app.use('/api', publicRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/sleep', sleepRoutes);

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
