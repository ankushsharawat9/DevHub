const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const passport = require('passport');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// === MIDDLEWARE ===

// CORS setup
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Parse JSON
app.use(express.json());

// Serve uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Express session
app.use(session({
  secret: process.env.SESSION_SECRET || 'devhub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
  }
}));

// Passport setup
require('./config/passport'); // Google OAuth strategy
app.use(passport.initialize());
app.use(passport.session());

// === ROUTES ===
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// === DATABASE ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));

// === FRONTEND (Production) ===
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// === START SERVER ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
