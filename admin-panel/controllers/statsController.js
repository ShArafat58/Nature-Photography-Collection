// Statistics Controller
const { queries } = require('../config/db');

// Get statistics
exports.getStatistics = (req, res) => {
    try {
        const stats = queries.getStatistics.get();
        res.json({ success: true, stats });
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
