// 1. Imports
const express = require('express');
const http = require('http');
const path = require('path');
const mysql = require('mysql2/promise');
const { Server } = require('socket.io');
const multer = require('multer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// 2. Initializations
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "https://mela.com.et",
    methods: ["GET", "POST"]
  }
});

// 3. Configuration
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-fallback-secret-key';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '30d';

// MySQL Configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost', 
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '', 
  database: process.env.DB_NAME || 'habeshahub',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000
};

// Create MySQL connection pool (with error handling)
let pool;
try {
  pool = mysql.createPool(dbConfig);
} catch (error) {
  console.warn('MySQL not configured, running in demo mode');
}

// Email Configuration (optional)
let transporter;
if (process.env.SMTP_HOST) {
  transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
}

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5
  },
  fileFilter: function (req, file, cb) {
    // Accept only images and documents
    if (file.mimetype.startsWith('image/') || 
        file.mimetype === 'application/pdf' ||
        file.mimetype.startsWith('text/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// 4. Security & Performance Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      connectSrc: ["'self'", "wss:", "ws:"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Compression middleware
app.use(compression({
  filter: (req, res) => {
    if (req.headers['x-no-compression']) {
      return false;
    }
    return compression.filter(req, res);
  },
  level: 6,
  threshold: 1024
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  skipSuccessfulRequests: true
});
app.use('/api/auth/', authLimiter);

// CORS with performance optimizations
app.use(cors({
  origin: process.env.CLIENT_URL || "https://mela.com.et",
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Enhanced static file serving with caching
app.use(express.static(path.join(__dirname, '../..'), {
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: true,
  lastModified: true,
  setHeaders: function (res, path, stat) {
    // Set cache headers based on file type
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutes for HTML
    } else if (path.match(/\.(css|js)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for CSS/JS
    } else if (path.match(/\.(jpg|jpeg|png|gif|ico|svg|webp)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for images
    } else if (path.match(/\.(woff|woff2|ttf|eot)$/)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year for fonts
    }
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '30d'
}));

// JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// 5. Database Connection and Table Creation
async function initializeDatabase() {
  if (!pool) {
    console.log('Running without database - using demo mode');
    return;
  }

  try {
    const connection = await pool.getConnection();
    console.log('Connected successfully to MySQL');
    
    // Create tables if they don't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('user', 'admin', 'seller') DEFAULT 'user',
        location VARCHAR(255),
        avatar_url VARCHAR(500),
        email_verified BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_location (location)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10, 2),
        category VARCHAR(100),
        image_url VARCHAR(500),
        user_id INT,
        location VARCHAR(255),
        status ENUM('active', 'inactive', 'sold') DEFAULT 'active',
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_category (category),
        INDEX idx_location (location),
        INDEX idx_status (status),
        INDEX idx_user_id (user_id),
        FULLTEXT INDEX ft_name_description (name, description)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS jobs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        company VARCHAR(255),
        location VARCHAR(255),
        salary VARCHAR(100),
        job_type ENUM('full-time', 'part-time', 'contract', 'freelance'),
        user_id INT,
        status ENUM('active', 'inactive', 'filled') DEFAULT 'active',
        views INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_job_type (job_type),
        INDEX idx_location (location),
        INDEX idx_status (status),
        INDEX idx_user_id (user_id),
        FULLTEXT INDEX ft_title_description (title, description)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS events (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        event_date DATETIME,
        location VARCHAR(255),
        organizer VARCHAR(255),
        user_id INT,
        status ENUM('upcoming', 'ongoing', 'completed', 'cancelled') DEFAULT 'upcoming',
        max_attendees INT,
        current_attendees INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_event_date (event_date),
        INDEX idx_location (location),
        INDEX idx_status (status),
        INDEX idx_user_id (user_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS password_resets (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        token VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_token (token),
        INDEX idx_email (email)
      )
    `);

    // Create chat messages table
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        user_name VARCHAR(255),
        content TEXT NOT NULL,
        location VARCHAR(255),
        message_type ENUM('text', 'image', 'file') DEFAULT 'text',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at),
        INDEX idx_location (location)
      )
    `);

    // Create analytics table for tracking
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        event_type VARCHAR(50),
        entity_type VARCHAR(50),
        entity_id INT,
        user_id INT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        metadata JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_event_type (event_type),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_user_id (user_id),
        INDEX idx_created_at (created_at)
      )
    `);

    connection.release();
    console.log('Database tables initialized');
  } catch (error) {
    console.error('Could not connect to MySQL:', error);
    console.log('Continuing without database...');
  }
}

initializeDatabase();

// 6. Chat System - Store connected users and messages
const connectedUsers = new Map();
const userSockets = new Map();

// Socket.IO connection handling for chat
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user authentication for chat
  socket.on('authenticate', (data) => {
    const { userId, u
