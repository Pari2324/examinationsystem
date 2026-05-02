// config/seeder.js — Seeds demo data into MongoDB
// Run with: npm run seed

const mongoose = require('mongoose');
require('dotenv').config();

const User    = require('../models/User');
const Exam    = require('../models/Exam');
const Contact = require('../models/Contact');

const MONGO = process.env.MONGO_URI || 'mongodb://localhost:27017/examsecure';

const SAMPLE_QUESTIONS = [
  { text: 'Which protocol is used for secure HTTP?',            options: ['HTTP','HTTPS','FTP','SMTP'],          correct: 1 },
  { text: 'What does CPU stand for?',                          options: ['Central Processing Unit','Computer Personal Unit','Core Processing Unit','Central Program Utility'], correct: 0 },
  { text: 'Which data structure uses LIFO ordering?',          options: ['Queue','Array','Stack','Linked List'],  correct: 2 },
  { text: 'What is the time complexity of binary search?',     options: ['O(n)','O(n²)','O(log n)','O(1)'],      correct: 2 },
  { text: 'Which OSI layer handles routing between networks?', options: ['Physical','Data Link','Network','Transport'], correct: 2 },
  { text: 'What does RAM stand for?',                          options: ['Read Access Memory','Random Access Memory','Rapid Access Module','Read And Modify'], correct: 1 },
  { text: 'Which sorting algorithm is best for nearly sorted arrays?', options: ['Quick Sort','Merge Sort','Insertion Sort','Heap Sort'], correct: 2 },
  { text: 'Default port for HTTPS is:',                        options: ['80','443','8080','21'],                 correct: 1 },
  { text: 'Which JS keyword declares a block-scoped variable?', options: ['var','let','const','function'],        correct: 1 },
  { text: 'SQL stands for:',                                   options: ['Standard Query Language','Structured Query Language','Simple Query Logic','System Query Layer'], correct: 1 },
];

async function seed() {
  await mongoose.connect(MONGO);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await User.deleteMany({});
  await Exam.deleteMany({});
  await Contact.deleteMany({});
  console.log('🗑️  Cleared existing data');

  // Create admin
  const admin = await User.create({
    name: 'Demo Admin',
    email: 'admin@demo.com',
    password: 'admin123',
    role: 'admin',
  });
  console.log('👨‍💼 Admin created:', admin.email);

  // Create student
  const student = await User.create({
    name: 'Demo Student',
    email: 'student@demo.com',
    password: 'student123',
    role: 'student',
    rollNumber: 'CS2024001',
    department: 'Computer Science',
  });
  console.log('👨‍🎓 Student created:', student.email);

  // Create 3 sample exams
  const exam1 = await Exam.create({
    title: 'Computer Networks Mid-Term',
    subject: 'CN',
    instructions: 'Read each question carefully. No backtracking after submission.',
    duration: 60,
    passMark: 40,
    startTime: new Date(),
    endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    questions: SAMPLE_QUESTIONS,
    status: 'active',
    createdBy: admin._id,
  });

  const exam2 = await Exam.create({
    title: 'Data Structures Final',
    subject: 'DS',
    instructions: 'All questions carry equal marks. Time limit is strict.',
    duration: 90,
    passMark: 50,
    startTime: new Date(),
    endTime: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    questions: SAMPLE_QUESTIONS.slice(0, 5),
    status: 'active',
    createdBy: admin._id,
  });

  await Exam.create({
    title: 'Web Technologies Quiz',
    subject: 'WT',
    instructions: 'Open book quiz. No communication allowed.',
    duration: 30,
    passMark: 60,
    startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    endTime: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    questions: SAMPLE_QUESTIONS.slice(5),
    status: 'draft',
    createdBy: admin._id,
  });
  console.log('📋 3 Sample exams created');

  // Create sample contact message
  await Contact.create({
    name: 'Test Student',
    email: 'test@uni.edu',
    phone: '9876543210',
    role: 'Student',
    message: 'How do I access my previous exam results on the portal?',
  });
  console.log('✉️  Sample contact message created');

  console.log('\n🎉 Seeding complete!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin login  → admin@demo.com   / admin123');
  console.log('Student login→ student@demo.com / student123');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err.message);
  process.exit(1);
});
