const router = require('express').Router();
const Log = require('../models/Log');
const User = require('../models/User');
const { auth, adminOnly } = require('../middleware/auth');

// Get all logs (admin only)
router.get('/', auth, adminOnly, async (req, res) => {
  try {
    const { type, user, startDate, endDate } = req.query;
    
    let query = {};
    
    // Apply filters
    if (type) query.action = type;
    if (user) query.performedBy = user;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }
    
    const logs = await Log.find(query)
      .sort({ timestamp: -1 })
      .populate('performedBy', 'username')
      .limit(100); // Limit to prevent overwhelming response
    
    res.json(logs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get logs statistics (admin only)
router.get('/stats', auth, adminOnly, async (req, res) => {
  try {
    const [actionStats, userStats, itemTypeStats] = await Promise.all([
      // Count by action type
      Log.aggregate([
        { $group: { _id: '$action', count: { $sum: 1 } } }
      ]),
      // Count by user with username
      Log.aggregate([
        { $group: { _id: '$performedBy', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        {
          $project: {
            _id: 1,
            count: 1,
            username: { $arrayElemAt: ['$user.username', 0] }
          }
        }
      ]),
      // Count by item type
      Log.aggregate([
        { $group: { _id: '$itemType', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      actionStats,
      userStats: userStats.map(stat => ({
        ...stat,
        username: stat.username || 'Unknown User'
      })),
      itemTypeStats
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
