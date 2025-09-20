const express = require('express');
const router = express.Router();
const RAGBridge = require('../rag_bridge');

// Initialize RAG bridge
const ragBridge = new RAGBridge();
ragBridge.startHealthMonitoring();

// Mental health knowledge base for RAG
const mentalHealthKnowledge = [
  {
    id: 1,
    topic: "anxiety",
    content: "Anxiety is a normal and often healthy emotion. However, when a person regularly feels disproportionate levels of anxiety, it might become a medical disorder. Techniques like deep breathing, mindfulness, and cognitive behavioral therapy can help manage anxiety."
  },
  {
    id: 2,
    topic: "depression",
    content: "Depression is a common and serious medical illness that negatively affects how you feel, the way you think, and how you act. It's characterized by persistent feelings of sadness and loss of interest in activities once enjoyed. It's important to seek professional help if experiencing symptoms of depression."
  },
  {
    id: 3,
    topic: "stress",
    content: "Stress is your body's reaction to pressure from a certain situation or event. It can be positive as a short-term motivator but can negatively impact health when chronic. Stress management techniques include regular exercise, adequate sleep, and relaxation practices."
  },
  {
    id: 4,
    topic: "mindfulness",
    content: "Mindfulness is the practice of purposely focusing your attention on the present moment and accepting it without judgment. Regular mindfulness practice can reduce stress, improve focus, and increase emotional regulation."
  },
  {
    id: 5,
    topic: "self_care",
    content: "Self-care means taking the time to do things that help you live well and improve both your physical health and mental health. Self-care can include maintaining a regular sleep routine, eating healthy, spending time in nature, or engaging in hobbies."
  }
];

// Distress signals detection
const distressKeywords = [
  "suicide", "kill myself", "end my life", "don't want to live", 
  "self-harm", "hurt myself", "cutting myself", 
  "hopeless", "worthless", "no reason to live"
];

// Helper function to detect distress signals
function detectDistress(message) {
  const lowercaseMessage = message.toLowerCase();
  return distressKeywords.some(keyword => lowercaseMessage.includes(keyword));
}

// Helper function for RAG - retrieve relevant knowledge
function retrieveKnowledge(message) {
  const lowercaseMessage = message.toLowerCase();
  
  // Simple keyword matching for retrieval
  for (const knowledge of mentalHealthKnowledge) {
    if (lowercaseMessage.includes(knowledge.topic)) {
      return knowledge.content;
    }
  }
  
  return null;
}

// Generate response using RAG approach
async function generateResponse(message, username) {
  try {
    // Use RAG bridge to query the Python service
    const ragResult = await ragBridge.queryRAG(message);
    
    if (ragResult.success) {
      return {
        text: ragResult.response,
        distressDetected: ragResult.distressDetected,
        contextUsed: ragResult.contextUsed,
        relevantTopics: ragResult.relevantTopics
      };
    } else {
      // Fallback response is already handled in RAG bridge
      return {
        text: ragResult.response,
        distressDetected: ragResult.distressDetected,
        contextUsed: false,
        fallback: true
      };
    }
  } catch (error) {
    console.error('Error in generateResponse:', error);
    
    // Final fallback if everything fails
    return {
      text: `I'm here to support you, ${username}. While I'm having some technical difficulties right now, please know that your feelings are valid and it's always okay to reach out for help from a mental health professional.`,
      distressDetected: false,
      contextUsed: false,
      error: true
    };
  }
}

// Chat history endpoint
router.get('/history', (req, res) => {
  // In a real app, this would fetch from a database
  // For now, we'll return an empty array
  res.json({ history: [] });
});

// Send message endpoint
router.post('/message', async (req, res) => {
  const { message, username = 'User' } = req.body;
  
  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }
  
  try {
    // Generate response using RAG
    const response = await generateResponse(message, username);
    
    // In a real app, we would save the message and response to a database
    
    res.json({
      message: {
        text: message,
        sender: 'user',
        timestamp: new Date()
      },
      response: {
        text: response.text,
        sender: 'bot',
        timestamp: new Date(),
        distressDetected: response.distressDetected,
        contextUsed: response.contextUsed,
        relevantTopics: response.relevantTopics,
        fallback: response.fallback,
        error: response.error
      }
    });
  } catch (error) {
    console.error('Error in message endpoint:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Unable to process your message at this time'
    });
  }
});

module.exports = { chatRouter: router };