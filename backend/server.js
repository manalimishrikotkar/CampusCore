const express = require('express');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const postRoutes = require('./routes/postRoutes');
const qnaRoutes = require('./routes/qnaRoutes');
const leaderboardRoutes = require('./routes/leadRoutes');
const quizRoutes = require('./routes/quizRoutes');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { startNotificationWatcher } = require('./listeners/notificationWatcher');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require("./routes/userRoutes");





// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

startNotificationWatcher();

// Initialize Express app
const app = express();
app.use(cors({
  origin: "http://localhost:3000", // Your frontend domain
  credentials: true               // ✅ allow cookies
}));

app.use(express.json());
app.use(cookieParser());


// ✅ Serve static frontend assets
// app.use(express.static(path.join(__dirname, 'frontend-build', 'out')));

// ✅ API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/qna', qnaRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/quiz',quizRoutes);
app.use('/api/admin', adminRoutes);
app.use("/api/user", userRoutes);



// ✅ Fallback: Serve frontend index.html for SPA routing
// app.get('/', (req, res) => {
//   res.sendFile(path.join(__dirname, 'frontend-build', 'out', 'index.html'));
// });

// ✅ Print all registered API routes (safe)
// process.nextTick(() => {
//   if (app._router && app._router.stack) {
//     console.log("\n✅ Registered Routes:");
//     app._router.stack
//       .filter(layer => layer.route && layer.route.path)
//       .forEach(layer => {
//         console.log(`→ ${Object.keys(layer.route.methods).join(',').toUpperCase()} ${layer.route.path}`);
//       });
//   } else {
//     console.warn("⚠️  app._router is not initialized.");
//   }
// });

// ✅ Start server
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, () => {
  console.log(`\n✅ Server running at http://${HOST}:${PORT}`);
});
