// Authentication Controller
const { verifyAdmin } = require('../config/auth');

// Admin login
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const result = verifyAdmin(username, password);

    if (!result.success) {
        return res.status(401).json({ error: result.message });
    }

    // Set session
    req.session.adminId = result.admin.id;
    req.session.username = result.admin.username;

    res.json({
        success: true,
        message: 'Login successful',
        admin: { username: result.admin.username }
    });
};

// Admin logout
exports.logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        res.json({ success: true, message: 'Logged out successfully' });
    });
};

// Check authentication status
exports.checkAuth = (req, res) => {
    if (req.session && req.session.adminId) {
        res.json({
            authenticated: true,
            username: req.session.username
        });
    } else {
        res.json({ authenticated: false });
    }
};
