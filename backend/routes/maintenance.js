const express = require('express');
const router = express.Router();
const Maintenance = require('../models/Maintenance');
const Log = require('../models/Log');
const { auth } = require('../middleware/auth');
const socketService = require('../services/socketService');

// Get all maintenance headings
router.get('/', async (req, res) => {
  try {
    const items = await Maintenance.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'username');
    res.json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create new maintenance heading
router.post('/', auth, async (req, res) => {
  try {
    const { heading } = req.body;
    
    const maintenanceItem = new Maintenance({
      heading,
      createdBy: req.user.id
    });
    
    await maintenanceItem.save();
    
    // Log the action
    const log = new Log({
      action: 'create',
      itemType: 'maintenance',
      itemId: maintenanceItem._id,
      performedBy: req.user.id,
      details: `Created new maintenance heading: ${heading}`
    });
    await log.save();
    
    socketService.emitToAll('maintenance:headingAdded', maintenanceItem);
    
    res.status(201).json(maintenanceItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add issue to maintenance heading
router.post('/:id/issues', auth, async (req, res) => {
  try {
    const { roomNumber, description } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance heading not found' });
    }
    
    maintenance.issues.push({
      roomNumber,
      description,
      status: 'pending'
    });
    
    await maintenance.save();
    
    // Log the action
    const log = new Log({
      action: 'create',
      itemType: 'maintenance',
      itemId: maintenance._id,
      performedBy: req.user.id,
      details: `Added issue for room ${roomNumber} under ${maintenance.heading}`
    });
    await log.save();
    
    socketService.emitToAll('maintenance:issueAdded', {
      headingId: req.params.id,
      updatedHeading: maintenance
    });
    
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update issue status
router.put('/:id/issues/:issueId', auth, async (req, res) => {
  try {
    const { status } = req.body;
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance heading not found' });
    }
    
    const issue = maintenance.issues.id(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    issue.status = status;
    issue.updatedAt = Date.now();
    
    await maintenance.save();
    
    // Log the action
    const log = new Log({
      action: 'update',
      itemType: 'maintenance',
      itemId: maintenance._id,
      performedBy: req.user.id,
      details: `Updated issue status to ${status} for room ${issue.roomNumber}`
    });
    await log.save();
    
    socketService.emitToAll('maintenance:issueUpdated', {
      headingId: req.params.id,
      updatedHeading: maintenance
    });
    
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete issue
router.delete('/:id/issues/:issueId', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance heading not found' });
    }
    
    const issue = maintenance.issues.id(req.params.issueId);
    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
    
    issue.remove();
    await maintenance.save();
    
    // Log the action
    const log = new Log({
      action: 'delete',
      itemType: 'maintenance',
      itemId: maintenance._id,
      performedBy: req.user.id,
      details: `Deleted issue for room ${issue.roomNumber}`
    });
    await log.save();
    
    socketService.emitToAll('maintenance:issueDeleted', {
      headingId: req.params.id,
      updatedHeading: maintenance
    });
    
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete maintenance heading
router.delete('/:id', auth, async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance heading not found' });
    }
    
    await maintenance.deleteOne();
    
    // Log the action
    const log = new Log({
      action: 'delete',
      itemType: 'maintenance',
      itemId: maintenance._id,
      performedBy: req.user.id,
      details: `Deleted maintenance heading: ${maintenance.heading}`
    });
    await log.save();
    
    socketService.emitToAll('maintenance:headingDeleted', req.params.id);
    
    res.json({ message: 'Maintenance heading deleted successfully' });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
