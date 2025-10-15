const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('✅ MongoDB Replica Set Connected');

    // Optional: check connection info
    const conn = mongoose.connection;
    conn.on('error', (err) => console.error('MongoDB Error:', err));
    conn.once('open', () => console.log(`Connected to DB: ${conn.name}`));
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
