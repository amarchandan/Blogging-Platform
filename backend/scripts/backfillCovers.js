#!/usr/bin/env node
require('dotenv').config();
const connectDB = require('../src/config/db');
const Blog = require('../src/models/Blog');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/blog-app';

async function run() {
  const fallback = process.argv[2] || null; // optional URL to set
  await connectDB(MONGO_URI);
  try {
    const filter = {
      $or: [
        { coverImage: { $exists: false } },
        { coverImage: null },
        { coverImage: '' },
        { coverImage: 'cover' },
      ],
    };
    const update = { $set: { coverImage: fallback } };
    const res = await Blog.updateMany(filter, update);
    console.log('Matched:', res.matchedCount || res.n || 0);
    console.log('Modified:', res.modifiedCount || res.nModified || 0);
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
