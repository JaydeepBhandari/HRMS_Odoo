const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const { MongoMemoryServer } = require('mongodb-memory-server');

const authRoutes = require('./routes/auth');
const employeeRoutes = require('./routes/employees');
const leaveRoutes = require('./routes/leaves');
const attendanceRoutes = require('./routes/attendance');
const salaryRoutes = require('./routes/salary');

const app = express();

const allowedOrigins = [
  'http://localhost:5173',
  'https://hrms-odoo-ruby.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// Database connection logic for Serverless environments (like Vercel)
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('localhost') || mongoUri === 'memory') {
      console.log('Starting In-Memory MongoDB Server...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-Memory MongoDB started at ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
    isConnected = true;
    console.log('MongoDB Connected Successfully');

    const User = require('./models/User');
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('Database is empty. Running seed...');
      try {
        const seed = require('./seed_func');
        await seed();
      } catch (err) {
        console.error('Seed failed:', err);
      }
    }
  } catch (err) {
    console.error('Database connection error:', err.message);
  }
};

// Middleware to ensure DB connects before handling requests
app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running smoothly' });
});

// Start server normally for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export the app for Vercel Serverless
module.exports = app;
