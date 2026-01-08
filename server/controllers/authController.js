const express = require('express');
const StudentStore = require('../stores/studentStore');

const router = express.Router();

// Login endpoint
router.post('/login', (req, res) => {
  try {
    const { name, id, role } = req.body;

    if (!name || !id || !role) {
      return res.status(400).json({ 
        message: 'Name, ID, and role are required' 
      });
    }

    if (!['student', 'trainer'].includes(role)) {
      return res.status(400).json({ 
        message: 'Role must be either student or trainer' 
      });
    }

    // Check if user already exists
    let user = StudentStore.getStudent(id);
    
    if (!user) {
      // Create new user
      user = StudentStore.addStudent({ name, id, role });
    } else {
      // Update existing user info
      user.name = name;
      user.role = role;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Login failed. Please try again.' 
    });
  }
});

// Get user info
router.get('/user/:id', (req, res) => {
  try {
    const { id } = req.params;
    const user = StudentStore.getStudent(id);

    if (!user) {
      return res.status(404).json({ 
        message: 'User not found' 
      });
    }

    res.json({
      user: {
        id: user.id,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ 
      message: 'Failed to get user information' 
    });
  }
});

module.exports = router;