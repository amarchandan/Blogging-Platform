const mongoose = require('mongoose');

const connectDB = async (mongoUri) => {
  while (mongoose.connection.readyState !== 1) {
    try {
      await mongoose.connect(mongoUri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000,
        family: 4,
      });
      console.log('MongoDB connected');
      return;
    } catch (err) {
      console.error(`MongoDB connection error: ${err.message}. Retrying in 5s...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
};

module.exports = connectDB;
