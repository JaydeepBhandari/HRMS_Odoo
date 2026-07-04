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

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/salary', salaryRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'Server is running smoothly' });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri || mongoUri.includes('localhost') || mongoUri === 'memory') {
      console.log('Starting In-Memory MongoDB Server...');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-Memory MongoDB started at ${mongoUri}`);
    }

    await mongoose.connect(mongoUri);
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

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection error:', err.message);
    process.exit(1);
  }
}

startServer();
