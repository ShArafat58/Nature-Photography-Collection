// Admin Server - Separate Admin Panel
require('dotenv').config();
const express = require('express');
const session = require('express-session');
const path = require('path');
const { initializeDatabase } = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const imageRoutes = require('./routes/imageRoutes');
const statsController = require('./controllers/statsController');
const { isAuthenticated } = require('./config/auth');

const app = express();
const ADMIN_PORT = process.env.ADMIN_PORT || 3001;

// Initialize database
initializeDatabase();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Serve static files for admin panel
app.use('/admin-assets', express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);
app.get('/api/stats', isAuthenticated, statsController.getStatistics);

// Admin Panel Routes
app.get('/', (req, res) => {
    if (req.session && req.session.adminId) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

app.get('/login', (req, res) => {
    if (req.session && req.session.adminId) {
        res.redirect('/dashboard');
    } else {
        res.render('login');
    }
});

app.get('/dashboard', isAuthenticated, (req, res) => {
    res.render('dashboard', { username: req.session.username });
});

app.get('/stats', isAuthenticated, (req, res) => {
    res.render('stats', { username: req.session.username });
});

// Logout route
app.get('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/login');
});

// Start admin server
app.listen(ADMIN_PORT, 'localhost', () => {
    console.log('');
    console.log('🔐 ========================================');
    console.log('   Sky Photography Gallery - Admin Panel');
    console.log('   ========================================');
    console.log('');
    console.log(`   ✅ Admin server running on http://localhost:${ADMIN_PORT}`);
    console.log(`   🔑 Login page: http://localhost:${ADMIN_PORT}/login`);
    console.log(`   📊 Dashboard: http://localhost:${ADMIN_PORT}/dashboard`);
    console.log('');
    console.log('   🔒 Localhost-only access (secure)');
    console.log('');
    console.log('   Default credentials:');
    console.log(`   Username: ${process.env.ADMIN_USERNAME || 'admin'}`);
    console.log(`   Password: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    console.log('');
    console.log('========================================');
    console.log('');
});

module.exports = app;
