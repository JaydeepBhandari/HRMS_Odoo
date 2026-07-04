const express = require('express');
const router = express.Router();
const Leave = require('../models/Leave');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @desc    Get leaves (Employees get their own, Admin/Manager get all)
// @route   GET /api/leaves
// @access  Private
router.get('/', async (req, res) => {
  try {
    let query = {};
    if (req.user.role === 'Employee') {
      query = { employee: req.user.id };
    }

    const leaves = await Leave.find(query)
      .populate('employee', 'name email department designation')
      .populate('approvedBy', 'name');

    res.status(200).json({
      success: true,
      count: leaves.length,
      data: leaves,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { type, startDate, endDate, reason } = req.body;

    const leave = await Leave.create({
      employee: req.user.id,
      type,
      startDate,
      endDate,
      reason,
    });

    res.status(201).json({
      success: true,
      data: leave,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Approve or reject leave request
// @route   PUT /api/leaves/:id/status
// @access  Private (Admin & Manager only)
router.put('/:id/status', authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Please provide valid status (Approved or Rejected)' });
    }

    let leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, error: 'Leave request not found' });
    }

    leave.status = status;
    leave.approvedBy = req.user.id;
    await leave.save();

    res.status(200).json({
      success: true,
      data: leave,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
