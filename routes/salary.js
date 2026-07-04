const express = require('express');
const router = express.Router();
const Salary = require('../models/Salary');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// @desc    Get salary structure for an employee
// @route   GET /api/salary/:employeeId
// @access  Private (self or Admin/Manager)
router.get('/:employeeId', async (req, res) => {
  try {
    if (req.user.role === 'Employee' && req.user.id !== req.params.employeeId) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this salary' });
    }

    const salary = await Salary.findOne({ employee: req.params.employeeId })
      .populate('employee', 'name email department designation');

    if (!salary) {
      return res.status(404).json({ success: false, error: 'Salary structure not found' });
    }

    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Create or update salary structure
// @route   PUT /api/salary/:employeeId
// @access  Private (Admin only)
router.put('/:employeeId', authorize('Admin'), async (req, res) => {
  try {
    const { totalWage, basic, hra, components } = req.body;

    let salary = await Salary.findOne({ employee: req.params.employeeId });

    if (salary) {
      salary.totalWage = totalWage !== undefined ? totalWage : salary.totalWage;
      salary.basic = basic !== undefined ? basic : salary.basic;
      salary.hra = hra !== undefined ? hra : salary.hra;
      if (components) salary.components = components;
      await salary.save();
    } else {
      salary = await Salary.create({
        employee: req.params.employeeId,
        totalWage: totalWage || 0,
        basic: basic || 0,
        hra: hra || 0,
        components: components || [],
      });
    }

    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
