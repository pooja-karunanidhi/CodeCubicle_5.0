const express = require('express');
const router = express.Router();

// Mock database of mental health resources
const resources = [
  {
    id: 1,
    title: "Crisis Text Line",
    description: "Text HOME to 741741 to connect with a Crisis Counselor",
    category: "crisis",
    url: "https://www.crisistextline.org/"
  },
  {
    id: 2,
    title: "National Suicide Prevention Lifeline",
    description: "Call 988 or 1-800-273-8255 for 24/7 support",
    category: "crisis",
    url: "https://suicidepreventionlifeline.org/"
  },
  {
    id: 3,
    title: "7 Cups",
    description: "Free emotional support through online chat",
    category: "support",
    url: "https://www.7cups.com/"
  },
  {
    id: 4,
    title: "Headspace",
    description: "Meditation and mindfulness app",
    category: "self-help",
    url: "https://www.headspace.com/"
  },
  {
    id: 5,
    title: "Calm",
    description: "App for sleep, meditation and relaxation",
    category: "self-help",
    url: "https://www.calm.com/"
  },
  {
    id: 6,
    title: "MoodGYM",
    description: "Interactive self-help program for cognitive behavioral therapy",
    category: "self-help",
    url: "https://moodgym.com.au/"
  },
  {
    id: 7,
    title: "Psychology Today",
    description: "Find a therapist in your area",
    category: "professional",
    url: "https://www.psychologytoday.com/us/therapists"
  },
  {
    id: 8,
    title: "Mental Health America",
    description: "Resources and tools for mental health",
    category: "education",
    url: "https://www.mhanational.org/"
  }
];

// Get all resources
router.get('/', (req, res) => {
  res.json({ resources });
});

// Get resources by category
router.get('/category/:category', (req, res) => {
  const { category } = req.params;
  const filteredResources = resources.filter(resource => resource.category === category);
  res.json({ resources: filteredResources });
});

// Get resource by id
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const resource = resources.find(resource => resource.id === parseInt(id));
  
  if (!resource) {
    return res.status(404).json({ error: 'Resource not found' });
  }
  
  res.json({ resource });
});

// Search resources
router.get('/search/:query', (req, res) => {
  const { query } = req.params;
  const lowercaseQuery = query.toLowerCase();
  
  const filteredResources = resources.filter(resource => 
    resource.title.toLowerCase().includes(lowercaseQuery) || 
    resource.description.toLowerCase().includes(lowercaseQuery)
  );
  
  res.json({ resources: filteredResources });
});

module.exports = { resourcesRouter: router };