const mongoose = require('mongoose');

const SalaryComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['earning', 'deduction'], required: true },
  amount: { type: Number, required: true, default: 0 },
  isPercentage: { type: Boolean, default: false },
  percentageOf: { type: String, default: 'basic' },
});

const SalarySchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  totalWage: { type: Number, required: true, default: 0 },
  basic: { type: Number, default: 0 },
  hra: { type: Number, default: 0 },
  components: [SalaryComponentSchema],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Salary', SalarySchema);
