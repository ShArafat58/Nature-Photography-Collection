// Admin Authentication Middleware
const bcrypt = require('bcrypt');
const { queries } = require('./db');

// Check if user is authenticated
function isAuthenticated(req, res, next) {
    if (req.session && req.session.adminId) {
        return next();
    }
    res.status(401).json({ error: 'Unauthorized. Please log in.' });
}

// Verify admin credentials
function verifyAdmin(username, password) {
    try {
        const admin = queries.getAdminByUsername.get(username);

        if (!admin) {
            return { success: false, message: 'Invalid username or password' };
        }

        const passwordMatch = bcrypt.compareSync(password, admin.password_hash);

        if (!passwordMatch) {
            return { success: false, message: 'Invalid username or password' };
        }

        return { success: true, admin: { id: admin.id, username: admin.username } };
    } catch (error) {
        console.error('Error verifying admin:', error);
        return { success: false, message: 'Authentication error' };
    }
}

module.exports = {
    isAuthenticated,
    verifyAdmin
};
