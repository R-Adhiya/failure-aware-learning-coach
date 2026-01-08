const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const authController = require('./controllers/authController');
const studentController = require('./controllers/studentController');
const trainerController = require('./controllers/trainerController');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// API Routes
app.use('/api/auth', authController);
app.use('/api/student', studentController);
app.use('/api/trainer', trainerController);

// Catch all handler for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong. Please try again.' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});