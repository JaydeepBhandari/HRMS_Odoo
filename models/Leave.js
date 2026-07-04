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
