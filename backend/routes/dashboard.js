const router = require('express').Router();
const DashboardItem = require('../models/DashboardItem');
const Log = require('../models/Log');
const { auth } = require('../middleware/auth');

// Get all dashboard items
router.get('/', async (req, res) => {
  try {
    const items = await DashboardItem.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new dashboard item
router.post('/', auth, async (req, res) => {
  try {
    const { type, title, description, priority } = req.body;
    
    const item = new DashboardItem({
      type,
      title,
      description,
      priority,
      createdBy: req.user.id
    });
    
    await item.save();
    
    // Log the action
    const log = new Log({
      action: 'create',
      itemType: type,
      itemId: item._id,
      performedBy: req.user.id,
      details: `Created new ${type}: ${title}`
    });
    await log.save();
    
    res.status(201).json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update dashboard item
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, description, priority, status } = req.body;
    const item = await DashboardItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    item.title = title || item.title;
    item.description = description || item.description;
    item.priority = priority || item.priority;
    item.status = status || item.status;
    
    await item.save();
    
    // Log the action
    const log = new Log({
      action: 'update',
      itemType: item.type,
      itemId: item._id,
      performedBy: req.user.id,
      details: `Updated ${item.type}: ${item.title}`
    });
    await log.save();
    
    res.json(item);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete dashboard item
router.delete('/:id', auth, async (req, res) => {
  try {
    const item = await DashboardItem.findById(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    await item.deleteOne();
    
    // Log the action
    const log = new Log({
      action: 'delete',
      itemType: item.type,
      itemId: item._id,
      performedBy: req.user.id,
      details: `Deleted ${item.type}: ${item.title}`
    });
    await log.save();
    
    res.json({ message: 'Item deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
