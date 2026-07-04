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
