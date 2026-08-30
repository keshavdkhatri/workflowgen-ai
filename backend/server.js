require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const workflowRoutes = require('./routes/workflowRoutes');
const executionRoutes = require('./routes/executionRoutes');


const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database connection state
let dbConnected = false;
let dbError = null;

// Connect to MongoDB
connectDB()
  .then(() => {
    dbConnected = true;
    dbError = null;
  })
  .catch((err) => {
    dbConnected = false;
    dbError = err.message;
    console.error('Server proceeding with disconnected MongoDB status.');
  });

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: dbConnected ? 'CONNECTED' : 'DISCONNECTED',
    error: dbError,
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/workflows', workflowRoutes);
app.use('/api/executions', executionRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error Stack:', err.stack);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`WorkflowGen AI server listening on port ${PORT}`);
});
