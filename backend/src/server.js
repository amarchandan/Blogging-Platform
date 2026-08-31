require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const blogRoutes = require('./routes/blogs');
const categoryRoutes = require('./routes/categories');
const commentRoutes = require('./routes/comments');
const ratingRoutes = require('./routes/ratings');
const interactionRoutes = require('./routes/interaction');
const adminRoutes = require('./routes/admin');
const uploadsRoutes = require('./routes/uploads');
const usersRoutes = require('./routes/users');
const errorHandler = require('./utils/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = (process.env.CLIENT_URL || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

// matches any Vercel deployment of this project, e.g.
// https://bloggingweb-ochre.vercel.app (production)
// https://bloggingweb-ctx6r2mm8-whoyou.vercel.app (preview)
const vercelPreviewPattern = /^https:\/\/bloggingweb(-[a-z0-9]+)*\.vercel\.app$/i;

app.use(cors({
  origin(origin, callback) {
    // allow non-browser requests (curl, server-to-server, health checks) with no origin
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (vercelPreviewPattern.test(origin)) return callback(null, true);
    if (allowedOrigins.length === 0 && !process.env.CLIENT_URL) return callback(null, true); // dev fallback if not configured yet
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan('dev'));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

app.use('/api/auth', authRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api', interactionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/users', usersRoutes);

// serve local uploads in development
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '..', '..', 'uploads')));

app.get("/", (req, res) => {res.json({
    success: true,
    message: "Blog API is running"
  });
});

app.get('/health', (req, res) => res.json({ success: true, message: 'ok' }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog-app';

if (process.env.SKIP_DB === 'true') {
  console.log('SKIP_DB is set; starting server without DB (dev-only)')
  app.listen(PORT, () => console.log(`Server running on port ${PORT} (no DB)`));
} else {
  connectDB(MONGO_URI).then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  });
}