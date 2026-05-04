// server.js — ExamSecure Backend Entry Point
// Node.js + Express + MongoDB

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// ── MIDDLEWARE ──
app.use(helmet());   // Security headers
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500'],
  credentials: true,
}));
app.use(morgan('dev'));                        // Request logging
app.use(express.json({ limit: '10mb' }));      // JSON body parser

// ── RATE LIMITING ──
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                   // Max 100 requests per window
  message: { message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ── ROUTES ──
const authRoutes    = require('./routes/auth');
const examRoutes    = require('./routes/exams');
const resultRoutes  = require('./routes/results');
const contactRoutes = require('./routes/contact');
const userRoutes    = require('./routes/users');

app.use('/api/auth',    authRoutes);
app.use('/api/exams',   examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users',   userRoutes);

app.get("/",(req,res)=>{
  res.send("API is running");
});

// ── HEALTH CHECK ──
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString(), db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// ── 404 HANDLER ──
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// ── GLOBAL ERROR HANDLER ──
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

// ── DATABASE + START ──
const PORT   = process.env.PORT || 5000;
const MONGO  = process.env.MONGO_URI || 'mongodb://localhost:27017/examsecure';

mongoose.connect(MONGO)
  .then(() => {
    console.log('✅ MongoDB connected:', MONGO);
    app.listen(PORT, () => {
      console.log(`🚀 ExamSecure server running at http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message);
    console.log('ℹ️  Tip: Make sure MongoDB is running (mongod) and your MONGO_URI in .env is correct');
    process.exit(1);
  });

module.exports = app;
