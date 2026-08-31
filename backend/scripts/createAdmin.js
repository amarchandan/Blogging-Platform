require('dotenv').config();
const mongoose = require('mongoose');
const readline = require('readline');
const User = require('../src/models/User');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });

const question = (q) => new Promise((res) => rl.question(q, res));

async function main() {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog-app';
  await mongoose.connect(uri);
  const name = await question('Name: ');
  const email = await question('Email: ');
  const username = await question('Username: ');
  const password = await question('Password: ');
  rl.close();
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    console.log('User with that email or username already exists');
    process.exit(1);
  }
  const admin = new User({ name, email, username, password, role: 'ADMIN' });
  await admin.save();
  console.log('Admin user created:', admin.email);
  process.exit(0);
}

main().catch((err) => { console.error(err); process.exit(1); });
