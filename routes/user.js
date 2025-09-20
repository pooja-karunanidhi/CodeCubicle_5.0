const express = require('express');
const router = express.Router();

// Mock user database
let users = [];

// Get user by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const user = users.find(user => user.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  // Don't send the password in the response
  const { password, ...userWithoutPassword } = user;
  res.json({ user: userWithoutPassword });
});

// Create anonymous user
router.post('/anonymous', (req, res) => {
  const { language = 'en' } = req.body;
  
  // Generate a random ID for anonymous user
  const id = 'anon_' + Math.random().toString(36).substring(2, 15);
  
  const newUser = {
    id,
    isAnonymous: true,
    language,
    preferences: {
      theme: 'light',
      notifications: false
    },
    moodEntries: [],
    achievements: {},
    createdAt: new Date()
  };
  
  users.push(newUser);
  
  res.status(201).json({ user: newUser });
});

// Update user preferences
router.put('/:id/preferences', (req, res) => {
  const { id } = req.params;
  const { preferences } = req.body;
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  users[userIndex].preferences = {
    ...users[userIndex].preferences,
    ...preferences
  };
  
  const { password, ...userWithoutPassword } = users[userIndex];
  res.json({ user: userWithoutPassword });
});

// Add mood entry
router.post('/:id/mood', (req, res) => {
  const { id } = req.params;
  const { mood, note } = req.body;
  
  if (!mood) {
    return res.status(400).json({ error: 'Mood is required' });
  }
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const moodEntry = {
    mood,
    note: note || '',
    timestamp: new Date()
  };
  
  users[userIndex].moodEntries.push(moodEntry);
  
  res.status(201).json({ moodEntry });
});

// Get user mood history
router.get('/:id/mood', (req, res) => {
  const { id } = req.params;
  const user = users.find(user => user.id === id);
  
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  res.json({ moodEntries: user.moodEntries });
});

// Add achievement
router.post('/:id/achievement', (req, res) => {
  const { id } = req.params;
  const { type } = req.body;
  
  if (!type) {
    return res.status(400).json({ error: 'Achievement type is required' });
  }
  
  const userIndex = users.findIndex(user => user.id === id);
  
  if (userIndex === -1) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  if (!users[userIndex].achievements[type]) {
    users[userIndex].achievements[type] = 1;
  } else {
    users[userIndex].achievements[type]++;
  }
  
  res.json({ achievements: users[userIndex].achievements });
});

module.exports = { userRouter: router };