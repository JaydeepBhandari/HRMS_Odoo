const fs = require('fs');
const path = require('path');

// Helper to create directories recursively if they don't exist
const createDir = (dirPath) => {
  const absolutePath = path.join(__dirname, dirPath);
  if (!fs.existsSync(absolutePath)) {
    fs.mkdirSync(absolutePath, { recursive: true });
    console.log(`[DIR] Created directory: ${dirPath}`);
  } else {
    console.log(`[DIR] Already exists: ${dirPath}`);
  }
};

// Helper to write files with content
const writeFile = (filePath, content) => {
  const absolutePath = path.join(__dirname, filePath);
  fs.writeFileSync(absolutePath, content.trim() + '\n', 'utf8');
  console.log(`[FILE] Created file: ${filePath}`);
};

console.log('=== HRMS Backend Initialization Started ===\n');

// 1. Create directory structure
createDir('models');
createDir('routes');
createDir('middleware');

// 2. Write Models
// models/User.js
writeFile('models/User.js', `
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\\\\w+([\\\\.-]?\\\\w+)*@\\\\w+([\\\\.-]?\\\\w+)*(\\\\.\\\\w{2,3})+$/,
      'Please add a valid email',
    ],
  },
  password: {
    type: String,
    required: [true, 'Please add a password'],
    minlength: 6,
    select: false, // Don't return password by default
  },
  role: {
    type: String,
    enum: ['Admin', 'Manager', 'Employee'],
    default: 'Employee',
  },
  department: {
    type: String,
    trim: true,
  },
  designation: {
    type: String,
    trim: true,
  },
  joinedDate: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Encrypt password using bcrypt
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
UserSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);
`);

// models/Leave.js
writeFile('models/Leave.js', `
const mongoose = require('mongoose');

const LeaveSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['Casual', 'Sick', 'LOP', 'Annual', 'Maternity', 'Paternity'],
    required: [true, 'Please specify leave type'],
  },
  startDate: {
    type: Date,
    required: [true, 'Please specify start date'],
  },
  endDate: {
    type: Date,
    required: [true, 'Please specify end date'],
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  reason: {
    type: String,
    required: [true, 'Please add a reason for the leave'],
    trim: true,
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Leave', LeaveSchema);
`);

// models/Attendance.js
writeFile('models/Attendance.js', `
const mongoose = require('mongoose');

const AttendanceSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  date: {
    type: Date,
    required: true,
    default: () => {
      const d = new Date();
      d.setUTCHours(0, 0, 0, 0);
      return d;
    },
  },
  checkIn: {
    type: Date,
  },
  checkOut: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Present', 'Absent', 'Late'],
    default: 'Present',
  },
}, {
  timestamps: true,
});

// Compound index to ensure one attendance record per employee per day
AttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', AttendanceSchema);
`);

// 3. Write Middleware
// middleware/auth.js
writeFile('middleware/auth.js', `
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret123');

    req.user = await User.findById(decoded.id);
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User not found with this token' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: \`User role \${req.user.role} is not authorized to access this route\`,
      });
    }
    next();
  };
};
`);

// 4. Write Routes
// routes/auth.js
writeFile('routes/auth.js', `
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// @desc    Register a user / employee
// @route   POST /api/auth/register
// @access  Public (In production, you'd typically restrict registration or require an admin token)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, designation } = req.body;

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, error: 'User already exists' });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      designation,
    });

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'secret123', {
      expiresIn: process.env.JWT_EXPIRE || '30d',
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
`);

// routes/employees.js
writeFile('routes/employees.js', `
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
`);

// routes/leaves.js
writeFile('routes/leaves.js', `
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
`);

// 5. Write Server file
// server.js
writeFile('server.js', `
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running smoothly' });
});

// Database connection & start server
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB Connected Successfully');
    app.listen(PORT, () => {
      console.log(\`Server running on port \${PORT}\`);
    });
  })
  .catch((err) => {
    console.error('Database connection error:', err.message);
    process.exit(1);
  });
`);

// 6. Write Template .env
// .env
writeFile('.env', `
PORT=5000
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=supersecretjwtkeyforhrms123
JWT_EXPIRE=30d
`);

console.log('\n=== HRMS Backend Initialization Completed Successfully ===');
