// Main Server - Public Website and API
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const { initializeDatabase } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const statsController = require('./controllers/statsController');
const { isAuthenticated } = require('./config/auth');

const app = express();
const PORT = process.env.PUBLIC_PORT || 3000;
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

// Initialize database
initializeDatabase();

// Middleware
app.use(cors({
    origin: [`http://localhost:${PORT}`, `http://localhost:${ADMIN_PORT}`],
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Set to true if using HTTPS
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files
app.use(express.static(path.join(__dirname, '../')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.get('/api/stats', isAuthenticated, statsController.getStatistics);

// Serve public pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/gallery', (req, res) => {
    res.sendFile(path.join(__dirname, '../gallery.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🌅 ========================================');
    console.log('   Sky Photography Gallery - Public Server');
    console.log('   ========================================');
    console.log('');
    console.log(`   ✅ Server running on http://localhost:${PORT}`);
    console.log(`   📸 Upload page: http://localhost:${PORT}`);
    console.log(`   🖼️  Gallery page: http://localhost:${PORT}/gallery`);
    console.log('');
    console.log('   💡 Admin panel runs on separate server');
    console.log(`      Start with: node admin-panel/admin-server.js`);
    console.log('');
    console.log('========================================');
    console.log('');
});

module.exports = app;
