/**
 * HRMS Mock Data
 * 
 * Seeds 10 employees, 30 days of attendance, salary structures,
 * leave requests, and leave allocations.
 */

import type {
  Company, Employee, AttendanceRecord, SalaryStructure,
  LeaveRequest, LeaveAllocation, ActivityItem
} from '../types';


export const companies: Company[] = [
  {
    id: 'company-1',
    code: '0E',
    name: 'NovaTech Solutions',
    logoUrl: undefined,
  },
];


export const employees: Employee[] = [
  {
    id: 'emp-001',
    loginId: '0EANSH20230001',
    role: 'admin',
    companyId: 'company-1',
    firstName: 'Ananya',
    lastName: 'Sharma',
    email: 'ananya.sharma@novatech.com',
    phone: '+91 98765 43210',
    profilePictureUrl: undefined,
    aboutMe: 'HR Director with 12+ years of experience in talent management, employee engagement, and organizational development.',
    skills: ['HR Management', 'Talent Acquisition', 'Employee Relations', 'Compliance', 'HRIS'],
    certifications: ['SHRM-SCP', 'PHR Certified'],
    interests: ['Reading', 'Yoga', 'Travel'],
    department: 'Human Resources',
    title: 'HR Director',
    managerId: undefined,
    dateOfBirth: '1988-03-15',
    currentAddress: '42, MG Road, Bengaluru, Karnataka 560001',
    permanentAddress: '42, MG Road, Bengaluru, Karnataka 560001',
    personalEmail: 'ananya.personal@gmail.com',
    gender: 'female',
    maritalStatus: 'married',
    panNumber: 'ABCPS1234A',
    aadharNumber: '1234 5678 9012',
    bloodGroup: 'B+',
    dateOfJoining: '2023-01-15',
    password: 'admin123',
  },
  {
    id: 'emp-002',
    loginId: '0ERAKU20230002',
    role: 'admin',
    companyId: 'company-1',
    firstName: 'Rajesh',
    lastName: 'Kumar',
    email: 'rajesh.kumar@novatech.com',
    phone: '+91 98765 43211',
    profilePictureUrl: undefined,
    aboutMe: 'HR Officer specializing in payroll and compliance management.',
    skills: ['Payroll Management', 'Labor Law', 'Benefits Administration'],
    certifications: ['CPP Certified'],
    interests: ['Cricket', 'Music'],
    department: 'Human Resources',
    title: 'HR Officer',
    managerId: 'emp-001',
    dateOfBirth: '1990-07-22',
    currentAddress: '18, Indiranagar, Bengaluru, Karnataka 560038',
    permanentAddress: '56, Sector 22, Noida, UP 201301',
    personalEmail: 'rajesh.k@gmail.com',
    gender: 'male',
    maritalStatus: 'single',
    panNumber: 'DEFPK5678B',
    aadharNumber: '2345 6789 0123',
    bloodGroup: 'O+',
    dateOfJoining: '2023-03-01',
    password: 'admin123',
  },
  {
    id: 'emp-003',
    loginId: '0EPRGU20240001',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Priya',
    lastName: 'Gupta',
    email: 'priya.gupta@novatech.com',
    phone: '+91 99887 76655',
    profilePictureUrl: undefined,
    aboutMe: 'Full-stack developer passionate about building scalable web applications.',
    skills: ['React', 'TypeScript', 'Node.js', 'PostgreSQL', 'Docker'],
    certifications: ['AWS Solutions Architect'],
    interests: ['Gaming', 'Photography', 'Hiking'],
    department: 'Engineering',
    title: 'Senior Software Engineer',
    managerId: 'emp-006',
    dateOfBirth: '1995-11-08',
    currentAddress: '204, HSR Layout, Bengaluru, Karnataka 560102',
    permanentAddress: '12, Civil Lines, Jaipur, Rajasthan 302006',
    personalEmail: 'priya.g95@gmail.com',
    gender: 'female',
    maritalStatus: 'single',
    panNumber: 'GHIPM9012C',
    aadharNumber: '3456 7890 1234',
    bloodGroup: 'A+',
    dateOfJoining: '2024-01-10',
    password: 'employee123',
  },
  {
    id: 'emp-004',
    loginId: '0EVISR20240002',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Vikram',
    lastName: 'Srinivasan',
    email: 'vikram.s@novatech.com',
    phone: '+91 88776 65544',
    profilePictureUrl: undefined,
    aboutMe: 'Backend engineer focused on microservices and distributed systems.',
    skills: ['Java', 'Spring Boot', 'Kubernetes', 'Redis', 'Kafka'],
    certifications: ['GCP Professional Cloud Architect'],
    interests: ['Chess', 'Running', 'Cooking'],
    department: 'Engineering',
    title: 'Software Engineer',
    managerId: 'emp-006',
    dateOfBirth: '1997-02-14',
    currentAddress: '56, Koramangala, Bengaluru, Karnataka 560034',
    permanentAddress: '78, T Nagar, Chennai, TN 600017',
    personalEmail: 'vikram.srini@gmail.com',
    gender: 'male',
    maritalStatus: 'single',
    panNumber: 'JKLPS3456D',
    aadharNumber: '4567 8901 2345',
    bloodGroup: 'AB+',
    dateOfJoining: '2024-02-15',
    password: 'employee123',
  },
  {
    id: 'emp-005',
    loginId: '0ENEDE20240003',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Neha',
    lastName: 'Desai',
    email: 'neha.desai@novatech.com',
    phone: '+91 77665 54433',
    profilePictureUrl: undefined,
    aboutMe: 'UX/UI designer creating delightful user experiences with a focus on accessibility.',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'CSS'],
    certifications: ['Google UX Design Certificate'],
    interests: ['Painting', 'Dance', 'Travel'],
    department: 'Design',
    title: 'Lead UX Designer',
    managerId: 'emp-006',
    dateOfBirth: '1993-06-30',
    currentAddress: '12, Whitefield, Bengaluru, Karnataka 560066',
    permanentAddress: '34, Andheri West, Mumbai, MH 400053',
    personalEmail: 'neha.d93@gmail.com',
    gender: 'female',
    maritalStatus: 'married',
    panNumber: 'MNOPD7890E',
    aadharNumber: '5678 9012 3456',
    bloodGroup: 'B-',
    dateOfJoining: '2024-03-20',
    password: 'employee123',
  },
  {
    id: 'emp-006',
    loginId: '0EARJA20230003',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Arjun',
    lastName: 'Jayaprakash',
    email: 'arjun.j@novatech.com',
    phone: '+91 66554 43322',
    profilePictureUrl: undefined,
    aboutMe: 'Engineering manager leading a team of 15 engineers. Passionate about mentoring and building high-performing teams.',
    skills: ['Team Leadership', 'Agile', 'System Design', 'Python', 'Go'],
    certifications: ['PMP Certified', 'CSM'],
    interests: ['Badminton', 'Reading', 'Podcasts'],
    department: 'Engineering',
    title: 'Engineering Manager',
    managerId: undefined,
    dateOfBirth: '1987-09-12',
    currentAddress: '88, Jayanagar, Bengaluru, Karnataka 560041',
    permanentAddress: '88, Jayanagar, Bengaluru, Karnataka 560041',
    personalEmail: 'arjun.jp@gmail.com',
    gender: 'male',
    maritalStatus: 'married',
    panNumber: 'QRSPJ1234F',
    aadharNumber: '6789 0123 4567',
    bloodGroup: 'O-',
    dateOfJoining: '2023-06-01',
    password: 'employee123',
  },
  {
    id: 'emp-007',
    loginId: '0EMECH20240004',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Meera',
    lastName: 'Choudhury',
    email: 'meera.c@novatech.com',
    phone: '+91 55443 32211',
    profilePictureUrl: undefined,
    aboutMe: 'Product manager bridging business and technology to deliver user-centric solutions.',
    skills: ['Product Strategy', 'Analytics', 'Jira', 'SQL', 'Stakeholder Management'],
    certifications: [],
    interests: ['Writing', 'Swimming', 'Board Games'],
    department: 'Product',
    title: 'Product Manager',
    managerId: 'emp-006',
    dateOfBirth: '1994-12-05',
    currentAddress: '23, Electronic City, Bengaluru, Karnataka 560100',
    permanentAddress: '67, Salt Lake, Kolkata, WB 700091',
    personalEmail: 'meera.ch@gmail.com',
    gender: 'female',
    maritalStatus: 'single',
    panNumber: 'TUVWC5678G',
    aadharNumber: '7890 1234 5678',
    bloodGroup: 'A-',
    dateOfJoining: '2024-05-01',
    password: 'employee123',
  },
  {
    id: 'emp-008',
    loginId: '0ESAPA20250001',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Sanjay',
    lastName: 'Patel',
    email: 'sanjay.p@novatech.com',
    phone: '+91 44332 21100',
    profilePictureUrl: undefined,
    aboutMe: 'DevOps engineer automating infrastructure and CI/CD pipelines.',
    skills: ['AWS', 'Terraform', 'Docker', 'Kubernetes', 'Jenkins'],
    certifications: ['AWS DevOps Engineer Professional'],
    interests: ['Cycling', 'Electronics', 'Open Source'],
    department: 'Engineering',
    title: 'DevOps Engineer',
    managerId: 'emp-006',
    dateOfBirth: '1996-04-18',
    currentAddress: '9, BTM Layout, Bengaluru, Karnataka 560076',
    permanentAddress: '45, Satellite, Ahmedabad, Gujarat 380015',
    personalEmail: 'sanjay.p96@gmail.com',
    gender: 'male',
    maritalStatus: 'single',
    panNumber: 'XYZAP9012H',
    aadharNumber: '8901 2345 6789',
    bloodGroup: 'B+',
    dateOfJoining: '2025-01-08',
    password: 'employee123',
  },
  {
    id: 'emp-009',
    loginId: '0EDIRA20250002',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Divya',
    lastName: 'Rajan',
    email: 'divya.r@novatech.com',
    phone: '+91 33221 10099',
    profilePictureUrl: undefined,
    aboutMe: 'QA engineer ensuring quality through automated and manual testing strategies.',
    skills: ['Selenium', 'Cypress', 'API Testing', 'Performance Testing', 'Python'],
    certifications: ['ISTQB Foundation'],
    interests: ['Gardening', 'Baking', 'Movies'],
    department: 'Quality Assurance',
    title: 'QA Engineer',
    managerId: 'emp-006',
    dateOfBirth: '1998-08-25',
    currentAddress: '15, Marathahalli, Bengaluru, Karnataka 560037',
    permanentAddress: '28, Thiruvananthapuram, Kerala 695001',
    personalEmail: 'divya.r98@gmail.com',
    gender: 'female',
    maritalStatus: 'single',
    panNumber: 'ABCDR3456I',
    aadharNumber: '9012 3456 7890',
    bloodGroup: 'O+',
    dateOfJoining: '2025-03-15',
    password: 'employee123',
  },
  {
    id: 'emp-010',
    loginId: '0EKASI20250003',
    role: 'employee',
    companyId: 'company-1',
    firstName: 'Karthik',
    lastName: 'Singh',
    email: 'karthik.s@novatech.com',
    phone: '+91 22110 09988',
    profilePictureUrl: undefined,
    aboutMe: 'Data analyst transforming raw data into actionable business insights.',
    skills: ['Python', 'SQL', 'Tableau', 'Excel', 'Machine Learning'],
    certifications: ['Google Data Analytics Certificate'],
    interests: ['Football', 'Astronomy', 'Volunteering'],
    department: 'Analytics',
    title: 'Data Analyst',
    managerId: 'emp-007',
    dateOfBirth: '1999-01-10',
    currentAddress: '31, Yelahanka, Bengaluru, Karnataka 560064',
    permanentAddress: '14, Gomti Nagar, Lucknow, UP 226010',
    personalEmail: 'karthik.s99@gmail.com',
    gender: 'male',
    maritalStatus: 'single',
    panNumber: 'DEFGS7890J',
    aadharNumber: '0123 4567 8901',
    bloodGroup: 'AB-',
    dateOfJoining: '2025-06-01',
    password: 'employee123',
  },
];


function generateAttendanceRecords(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const today = new Date();
  
  for (const emp of employees) {
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      const dayOfWeek = date.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) continue;

      const dateStr = date.toISOString().split('T')[0];
      
      // Randomize some entries
      const rand = Math.random();
      let status: AttendanceRecord['status'] = 'present';
      let checkIn: string | undefined;
      let checkOut: string | undefined;
      let workHours: number | undefined;
      let extraHours: number | undefined;

      if (i === 0) {
        // Today — vary based on employee index
        const empIdx = employees.indexOf(emp);
        if (empIdx % 5 === 3) {
          status = 'leave'; // On leave today
        } else if (empIdx % 7 === 4) {
          status = 'absent'; // Absent today
        } else {
          status = 'present';
          const checkInHour = 9 + Math.floor(Math.random() * 1);
          const checkInMin = Math.floor(Math.random() * 30);
          checkIn = `${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`;
          // Some haven't checked out yet today
          if (Math.random() > 0.5) {
            const checkOutHour = 17 + Math.floor(Math.random() * 2);
            const checkOutMin = Math.floor(Math.random() * 60);
            checkOut = `${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00`;
            workHours = checkOutHour - checkInHour + (checkOutMin - checkInMin) / 60;
            extraHours = Math.max(0, workHours - 8);
          }
        }
      } else if (rand < 0.05) {
        status = 'absent';
      } else if (rand < 0.08) {
        status = 'half-day';
        checkIn = `${dateStr}T09:15:00`;
        checkOut = `${dateStr}T13:30:00`;
        workHours = 4.25;
        extraHours = 0;
      } else if (rand < 0.12) {
        status = 'leave';
      } else {
        status = 'present';
        const checkInHour = 8 + Math.floor(Math.random() * 2);
        const checkInMin = Math.floor(Math.random() * 45);
        const checkOutHour = 17 + Math.floor(Math.random() * 3);
        const checkOutMin = Math.floor(Math.random() * 60);
        checkIn = `${dateStr}T${String(checkInHour).padStart(2, '0')}:${String(checkInMin).padStart(2, '0')}:00`;
        checkOut = `${dateStr}T${String(checkOutHour).padStart(2, '0')}:${String(checkOutMin).padStart(2, '0')}:00`;
        workHours = Math.round((checkOutHour - checkInHour + (checkOutMin - checkInMin) / 60) * 100) / 100;
        extraHours = Math.round(Math.max(0, workHours - 8) * 100) / 100;
      }

      records.push({
        id: `att-${emp.id}-${dateStr}`,
        employeeId: emp.id,
        date: dateStr,
        checkIn,
        checkOut,
        status,
        workHours: workHours ? Math.round(workHours * 100) / 100 : undefined,
        extraHours,
      });
    }
  }

  return records;
}

export let attendanceRecords: AttendanceRecord[] = generateAttendanceRecords();


export const salaryStructures: SalaryStructure[] = [
  {
    employeeId: 'emp-001',
    wageType: 'monthly',
    totalWage: 120000,
    components: [
      { id: 'comp-basic-001', name: 'Basic Salary', computationType: 'percentage', percentageBase: 'wage', percentageValue: 50, order: 1 },
      { id: 'comp-hra-001', name: 'House Rent Allowance', computationType: 'percentage', percentageBase: 'comp-basic-001', percentageValue: 50, order: 2 },
      { id: 'comp-sa-001', name: 'Standard Allowance', computationType: 'fixed', fixedAmount: 6000, order: 3 },
      { id: 'comp-perf-001', name: 'Performance Bonus', computationType: 'fixed', fixedAmount: 6000, order: 4 },
      { id: 'comp-lta-001', name: 'Leave Travel Allowance', computationType: 'fixed', fixedAmount: 3600, order: 5 },
      { id: 'comp-fa-001', name: 'Fixed Allowance', computationType: 'fixed', fixedAmount: 0, isFixedAllowance: true, order: 99 },
    ],
    pfContributionRate: 12,
    professionalTax: 200,
    workingDaysPerWeek: 5,
    standardWorkHoursPerDay: 8,
  },
  {
    employeeId: 'emp-002',
    wageType: 'monthly',
    totalWage: 80000,
    components: [
      { id: 'comp-basic-002', name: 'Basic Salary', computationType: 'percentage', percentageBase: 'wage', percentageValue: 50, order: 1 },
      { id: 'comp-hra-002', name: 'House Rent Allowance', computationType: 'percentage', percentageBase: 'comp-basic-002', percentageValue: 50, order: 2 },
      { id: 'comp-sa-002', name: 'Standard Allowance', computationType: 'fixed', fixedAmount: 4000, order: 3 },
      { id: 'comp-perf-002', name: 'Performance Bonus', computationType: 'fixed', fixedAmount: 4000, order: 4 },
      { id: 'comp-lta-002', name: 'Leave Travel Allowance', computationType: 'fixed', fixedAmount: 2400, order: 5 },
      { id: 'comp-fa-002', name: 'Fixed Allowance', computationType: 'fixed', fixedAmount: 0, isFixedAllowance: true, order: 99 },
    ],
    pfContributionRate: 12,
    professionalTax: 200,
    workingDaysPerWeek: 5,
    standardWorkHoursPerDay: 8,
  },
  // Employees 3-10 all get 50k/month salary for simplicity (matching the spec's worked example)
  ...(['emp-003', 'emp-004', 'emp-005', 'emp-006', 'emp-007', 'emp-008', 'emp-009', 'emp-010'] as const).map((empId, idx) => ({
    employeeId: empId,
    wageType: 'monthly' as const,
    totalWage: 50000 + idx * 5000,
    components: [
      { id: `comp-basic-${empId}`, name: 'Basic Salary', computationType: 'percentage' as const, percentageBase: 'wage', percentageValue: 50, order: 1 },
      { id: `comp-hra-${empId}`, name: 'House Rent Allowance', computationType: 'percentage' as const, percentageBase: `comp-basic-${empId}`, percentageValue: 50, order: 2 },
      { id: `comp-sa-${empId}`, name: 'Standard Allowance', computationType: 'fixed' as const, fixedAmount: Math.round((50000 + idx * 5000) * 0.05), order: 3 },
      { id: `comp-perf-${empId}`, name: 'Performance Bonus', computationType: 'fixed' as const, fixedAmount: Math.round((50000 + idx * 5000) * 0.05), order: 4 },
      { id: `comp-lta-${empId}`, name: 'Leave Travel Allowance', computationType: 'fixed' as const, fixedAmount: Math.round((50000 + idx * 5000) * 0.03), order: 5 },
      { id: `comp-fa-${empId}`, name: 'Fixed Allowance', computationType: 'fixed' as const, fixedAmount: 0, isFixedAllowance: true, order: 99 },
    ],
    pfContributionRate: 12,
    professionalTax: 200,
    workingDaysPerWeek: 5,
    standardWorkHoursPerDay: 8,
  })),
];


export const leaveAllocations: LeaveAllocation[] = employees.flatMap(emp => [
  { id: `la-pto-${emp.id}`, employeeId: emp.id, leaveType: 'paid-time-off' as const, daysAllocated: 24, daysUsed: Math.floor(Math.random() * 8), year: 2026 },
  { id: `la-sick-${emp.id}`, employeeId: emp.id, leaveType: 'sick-leave' as const, daysAllocated: 7, daysUsed: Math.floor(Math.random() * 3), year: 2026 },
  { id: `la-unpaid-${emp.id}`, employeeId: emp.id, leaveType: 'unpaid-leave' as const, daysAllocated: 10, daysUsed: 0, year: 2026 },
]);


export let leaveRequests: LeaveRequest[] = [
  {
    id: 'lr-001',
    employeeId: 'emp-003',
    leaveType: 'paid-time-off',
    startDate: '2026-07-10',
    endDate: '2026-07-12',
    daysRequested: 3,
    status: 'pending',
    remarks: 'Family vacation planned.',
    createdAt: '2026-07-01T10:30:00',
  },
  {
    id: 'lr-002',
    employeeId: 'emp-004',
    leaveType: 'sick-leave',
    startDate: '2026-06-28',
    endDate: '2026-06-30',
    daysRequested: 2,
    status: 'approved',
    remarks: 'Fever and cold.',
    attachmentName: 'medical_certificate.pdf',
    attachmentUrl: '#mock-attachment',
    adminComment: 'Get well soon. Approved.',
    createdAt: '2026-06-27T09:00:00',
  },
  {
    id: 'lr-003',
    employeeId: 'emp-005',
    leaveType: 'paid-time-off',
    startDate: '2026-07-15',
    endDate: '2026-07-18',
    daysRequested: 4,
    status: 'approved',
    remarks: 'Anniversary trip.',
    adminComment: 'Approved. Enjoy!',
    createdAt: '2026-07-02T14:00:00',
  },
  {
    id: 'lr-004',
    employeeId: 'emp-007',
    leaveType: 'unpaid-leave',
    startDate: '2026-07-20',
    endDate: '2026-07-22',
    daysRequested: 3,
    status: 'rejected',
    remarks: 'Personal work.',
    adminComment: 'Project deadline conflicts. Please reschedule.',
    createdAt: '2026-07-01T16:00:00',
  },
  {
    id: 'lr-005',
    employeeId: 'emp-008',
    leaveType: 'sick-leave',
    startDate: '2026-07-05',
    endDate: '2026-07-06',
    daysRequested: 2,
    status: 'pending',
    remarks: 'Dental surgery scheduled.',
    attachmentName: 'dentist_appointment.pdf',
    attachmentUrl: '#mock-attachment',
    createdAt: '2026-07-03T08:00:00',
  },
  {
    id: 'lr-006',
    employeeId: 'emp-003',
    leaveType: 'sick-leave',
    startDate: '2026-06-15',
    endDate: '2026-06-16',
    daysRequested: 2,
    status: 'approved',
    remarks: 'Migraine episode.',
    attachmentName: 'prescription.jpg',
    attachmentUrl: '#mock-attachment',
    adminComment: 'Approved. Take care.',
    createdAt: '2026-06-14T11:00:00',
  },
  {
    id: 'lr-007',
    employeeId: 'emp-006',
    leaveType: 'paid-time-off',
    startDate: '2026-07-25',
    endDate: '2026-07-28',
    daysRequested: 2,
    status: 'pending',
    remarks: 'Kids school event and family time.',
    createdAt: '2026-07-03T12:00:00',
  },
  {
    id: 'lr-008',
    employeeId: 'emp-009',
    leaveType: 'paid-time-off',
    startDate: '2026-08-01',
    endDate: '2026-08-05',
    daysRequested: 5,
    status: 'pending',
    remarks: 'Hometown visit.',
    createdAt: '2026-07-04T07:00:00',
  },
];


export let activities: ActivityItem[] = [
  { id: 'act-1', employeeId: 'emp-003', message: 'Your sick leave request for Jun 15-16 was approved.', timestamp: '2026-06-15T10:00:00', type: 'leave-approved' },
  { id: 'act-2', employeeId: 'emp-004', message: 'Your sick leave request for Jun 28-30 was approved.', timestamp: '2026-06-28T09:30:00', type: 'leave-approved' },
  { id: 'act-3', employeeId: 'emp-005', message: 'Your PTO request for Jul 15-18 was approved.', timestamp: '2026-07-03T11:00:00', type: 'leave-approved' },
  { id: 'act-4', employeeId: 'emp-007', message: 'Your unpaid leave request for Jul 20-22 was rejected.', timestamp: '2026-07-02T17:00:00', type: 'leave-rejected' },
  { id: 'act-5', employeeId: 'emp-003', message: 'You submitted a PTO request for Jul 10-12.', timestamp: '2026-07-01T10:30:00', type: 'leave-submitted' },
  { id: 'act-6', employeeId: 'emp-001', message: 'You checked in at 9:05 AM.', timestamp: '2026-07-04T09:05:00', type: 'check-in' },
];
