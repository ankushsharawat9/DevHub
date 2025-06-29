// index.js
import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import session from 'express-session';
import passport from 'passport';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load environment variables early
dotenv.config();

// ES Module replacements for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Express app
const app = express();

// === MIDDLEWARE ===

// Enable CORS for frontend origin
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
}));

// Body parser
app.use(express.json());

// Static files for uploaded assets
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Express session (needed for Passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'devhub-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,       // true in production with HTTPS
    httpOnly: true,
  }
}));

// Passport OAuth setup
import './config/passport.js';
app.use(passport.initialize());
app.use(passport.session());

// === ROUTES ===
import authRoutes from './routes/auth.js';
import categoryRoutes from './routes/category.js';
import productRoutes from './routes/product.js';



app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api', productRoutes);

// === MONGODB CONNECTION ===
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB connected successfully.'))
.catch((err) => console.error('❌ MongoDB connection error:', err.message));

// === PRODUCTION FRONTEND SERVING ===
if (process.env.NODE_ENV === 'production') {
  const clientBuildPath = path.join(__dirname, 'client', 'build');
  app.use(express.static(clientBuildPath));

  app.get('*', (req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
  });
}

// === FALLBACK FOR UNKNOWN ROUTES ===
app.use((req, res, next) => {
  res.status(404).json({ message: 'API route not found' });
});

// === START SERVER ===
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
