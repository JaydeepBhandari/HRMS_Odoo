const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Salary = require('./models/Salary');
const Leave = require('./models/Leave');
const Attendance = require('./models/Attendance');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hrms';

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Salary.deleteMany({});
    await Leave.deleteMany({});
    await Attendance.deleteMany({});
    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Priya Gupta',
      email: 'admin@novatech.com',
      password: 'admin123',
      role: 'Admin',
      department: 'Human Resources',
      designation: 'HR Director',
    });

    const emp1 = await User.create({
      name: 'Arjun Mehta',
      email: 'employee@novatech.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Software Engineer',
    });

    const emp2 = await User.create({
      name: 'Sneha Reddy',
      email: 'sneha@novatech.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Engineering',
      designation: 'Frontend Developer',
    });

    const emp3 = await User.create({
      name: 'Rahul Sharma',
      email: 'rahul@novatech.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Marketing',
      designation: 'Marketing Manager',
    });

    const emp4 = await User.create({
      name: 'Ananya Singh',
      email: 'ananya@novatech.com',
      password: 'employee123',
      role: 'Employee',
      department: 'Design',
      designation: 'UI/UX Designer',
    });

    const emp5 = await User.create({
      name: 'Vikram Patel',
      email: 'vikram@novatech.com',
      password: 'employee123',
      role: 'Manager',
      department: 'Engineering',
      designation: 'Engineering Manager',
    });

    console.log('Created users:', { admin: admin.name, employees: [emp1.name, emp2.name, emp3.name, emp4.name, emp5.name] });

    await Salary.create([
      { employee: emp1._id, totalWage: 85000, basic: 42500, hra: 17000, components: [{ name: 'Special Allowance', type: 'earning', amount: 10000 }, { name: 'PF', type: 'deduction', amount: 5100 }] },
      { employee: emp2._id, totalWage: 75000, basic: 37500, hra: 15000, components: [{ name: 'Special Allowance', type: 'earning', amount: 8000 }, { name: 'PF', type: 'deduction', amount: 4500 }] },
      { employee: emp3._id, totalWage: 90000, basic: 45000, hra: 18000, components: [{ name: 'Special Allowance', type: 'earning', amount: 12000 }, { name: 'PF', type: 'deduction', amount: 5400 }] },
      { employee: emp4._id, totalWage: 70000, basic: 35000, hra: 14000, components: [{ name: 'Special Allowance', type: 'earning', amount: 7500 }, { name: 'PF', type: 'deduction', amount: 4200 }] },
      { employee: emp5._id, totalWage: 120000, basic: 60000, hra: 24000, components: [{ name: 'Special Allowance', type: 'earning', amount: 15000 }, { name: 'PF', type: 'deduction', amount: 7200 }] },
    ]);
    console.log('Created salary structures');

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    await Attendance.create([
      { employee: emp1._id, date: yesterday, checkIn: new Date(yesterday.getTime() + 9 * 3600000), checkOut: new Date(yesterday.getTime() + 18 * 3600000), status: 'Present' },
      { employee: emp2._id, date: yesterday, checkIn: new Date(yesterday.getTime() + 9.5 * 3600000), checkOut: new Date(yesterday.getTime() + 17.5 * 3600000), status: 'Present' },
      { employee: emp3._id, date: yesterday, checkIn: new Date(yesterday.getTime() + 10 * 3600000), checkOut: new Date(yesterday.getTime() + 18 * 3600000), status: 'Late' },
    ]);
    console.log('Created attendance records');

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekEnd = new Date(nextWeek);
    nextWeekEnd.setDate(nextWeekEnd.getDate() + 2);

    await Leave.create([
      { employee: emp1._id, type: 'Annual', startDate: nextWeek, endDate: nextWeekEnd, reason: 'Family vacation', status: 'Pending' },
      { employee: emp2._id, type: 'Sick', startDate: yesterday, endDate: yesterday, reason: 'Not feeling well', status: 'Approved', approvedBy: admin._id },
      { employee: emp4._id, type: 'Casual', startDate: nextWeek, endDate: nextWeek, reason: 'Personal work', status: 'Pending' },
    ]);
    console.log('Created leave requests');

    console.log('\n=== Seed completed successfully ===');
    console.log('\nDemo accounts:');
    console.log('  Admin:    admin@novatech.com / admin123');
    console.log('  Employee: employee@novatech.com / employee123');

    await mongoose.connection.close();
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err.message);
    process.exit(1);
  }
}

seed();
