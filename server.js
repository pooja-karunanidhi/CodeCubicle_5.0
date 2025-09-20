const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const { chatRouter } = require('./routes/chat');
const { resourcesRouter } = require('./routes/resources');
const { userRouter } = require('./routes/user');

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '/')));

// Routes
app.use('/api/chat', chatRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/user', userRouter);

// Serve the main HTML file for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} in your browser`);
});