const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

// Protect all routes under employees
router.use(protect);

// @desc    Get all employees
// @route   GET /api/employees
// @access  Private (Admin & Manager only)
router.get('/', authorize('Admin', 'Manager'), async (req, res) => {
  try {
    const employees = await User.find({ role: 'Employee' });
    res.status(200).json({
      success: true,
      count: employees.length,
      data: employees,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get single employee
// @route   GET /api/employees/:id
// @access  Private
router.get('/:id', async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Check if requester is Admin, Manager, or the employee themselves
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && req.user.id !== employee.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to view this profile' });
    }

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Add new employee
// @route   POST /api/employees
// @access  Private (Admin only)
router.post('/', authorize('Admin'), async (req, res) => {
  try {
    const { name, email, password, department, designation, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists with this email' });
    }

    const employee = await User.create({
      name,
      email,
      password,
      role: role || 'Employee',
      department,
      designation,
    });

    res.status(201).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Update employee
// @route   PUT /api/employees/:id
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    let employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // Restrict update to Admin, Manager, or self
    if (req.user.role !== 'Admin' && req.user.role !== 'Manager' && req.user.id !== employee.id) {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }

    // Prevent non-admins from changing role
    if (req.body.role && req.user.role !== 'Admin') {
      delete req.body.role;
    }

    employee = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: employee,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Delete employee
// @route   DELETE /api/employees/:id
// @access  Private (Admin only)
router.delete('/:id', authorize('Admin'), async (req, res) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    await employee.deleteOne();

    res.status(200).json({
      success: true,
      data: {},
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
