const express = require('express');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,                  // Max 100 requests per IP per 15 mins
  message: { success: false, message: 'Too many requests, please try again later.' }
});

app.use('/api', limiter);
app.use(express.json());
// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/machines', require('./routes/machineRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));
app.use('/api/rentals', require('./routes/rentalRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));

app.get('/', (req, res) => res.send('Rental Breaker API is Running...'));

// Global error handler — must be LAST middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
