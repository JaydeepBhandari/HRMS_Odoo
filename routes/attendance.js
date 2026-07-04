const express = require('express');
const router = express.Router();
const Attendance = require('../models/Attendance');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @desc    Check in
// @route   POST /api/attendance/check-in
// @access  Private
router.post('/check-in', async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    let record = await Attendance.findOne({ employee: req.user.id, date: today });
    if (record && record.checkIn) {
      return res.status(400).json({ success: false, error: 'Already checked in today' });
    }

    if (!record) {
      record = await Attendance.create({
        employee: req.user.id,
        date: today,
        checkIn: new Date(),
        status: 'Present',
      });
    } else {
      record.checkIn = new Date();
      record.status = 'Present';
      await record.save();
    }

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Check out
// @route   POST /api/attendance/check-out
// @access  Private
router.post('/check-out', async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const record = await Attendance.findOne({ employee: req.user.id, date: today });
    if (!record || !record.checkIn) {
      return res.status(400).json({ success: false, error: 'Must check in before checking out' });
    }
    if (record.checkOut) {
      return res.status(400).json({ success: false, error: 'Already checked out today' });
    }

    record.checkOut = new Date();
    await record.save();

    res.status(200).json({ success: true, data: record });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get attendance records (by employee, date range)
// @route   GET /api/attendance
// @access  Private
router.get('/', async (req, res) => {
  try {
    const { employeeId, date, month, year } = req.query;
    let query = {};

    if (req.user.role === 'Employee') {
      query.employee = req.user.id;
    } else if (employeeId) {
      query.employee = employeeId;
    }

    if (date) {
      const d = new Date(date);
      d.setUTCHours(0, 0, 0, 0);
      query.date = d;
    } else if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }

    const records = await Attendance.find(query)
      .populate('employee', 'name email department designation role')
      .sort({ date: -1 });

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get today's attendance for all employees (admin view)
// @route   GET /api/attendance/today
// @access  Private (Admin/Manager only)
router.get('/today', authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const records = await Attendance.find({ date: today })
      .populate('employee', 'name email department designation role');

    res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get attendance stats for an employee for a given month
// @route   GET /api/attendance/stats/:employeeId
// @access  Private
router.get('/stats/:employeeId', async (req, res) => {
  try {
    if (req.user.role === 'Employee' && req.user.id !== req.params.employeeId) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    const { month, year } = req.query;
    const m = parseInt(month) || (new Date().getMonth() + 1);
    const y = parseInt(year) || new Date().getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const records = await Attendance.find({
      employee: req.params.employeeId,
      date: { $gte: startDate, $lte: endDate },
    });

    const present = records.filter(r => r.status === 'Present').length;
    const absent = records.filter(r => r.status === 'Absent').length;
    const late = records.filter(r => r.status === 'Late').length;

    let totalHours = 0;
    records.forEach(r => {
      if (r.checkIn && r.checkOut) {
        totalHours += (r.checkOut - r.checkIn) / (1000 * 60 * 60);
      }
    });

    res.status(200).json({
      success: true,
      data: { present, absent, late, totalHours: Math.round(totalHours * 100) / 100, totalDays: records.length },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
