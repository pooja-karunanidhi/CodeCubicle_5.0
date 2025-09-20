import json
import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Initialize OpenAI client (you'll need to set your API key)
client = OpenAI(api_key=os.getenv('OPENAI_API_KEY', 'your-openai-api-key-here'))

class MentalHealthRAG:
    def __init__(self, knowledge_file_path):
        self.knowledge_file_path = knowledge_file_path
        self.knowledge_base = []
        self.load_knowledge_base()
        
    def load_knowledge_base(self):
        """Load mental health knowledge from JSON file"""
        try:
            with open(self.knowledge_file_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                # Handle both array and object formats
                if isinstance(data, list):
                    self.knowledge_base = data
                elif isinstance(data, dict) and 'knowledge' in data:
                    self.knowledge_base = data['knowledge']
                else:
                    logger.error("Invalid knowledge base format")
                    self.knowledge_base = []
            logger.info(f"Loaded {len(self.knowledge_base)} knowledge entries")
        except Exception as e:
            logger.error(f"Error loading knowledge base: {e}")
            self.knowledge_base = []
    
    def search_relevant_context(self, query):
        """Simple keyword-based search for relevant context"""
        query_lower = query.lower()
        relevant_contexts = []
        
        for item in self.knowledge_base:
            # Check if query keywords match topic, content, or keywords
            topic_match = any(word in item['topic'].lower() for word in query_lower.split())
            content_match = any(word in item['content'].lower() for word in query_lower.split())
            keyword_match = any(keyword.lower() in query_lower for keyword in item.get('keywords', []))
            
            if topic_match or content_match or keyword_match:
                relevant_contexts.append({
                    'topic': item['topic'],
                    'content': item['content'],
                    'relevance_score': self.calculate_relevance(query_lower, item)
                })
        
        # Sort by relevance score and return top 3
        relevant_contexts.sort(key=lambda x: x['relevance_score'], reverse=True)
        return relevant_contexts[:3]
    
    def calculate_relevance(self, query, item):
        """Calculate simple relevance score based on keyword matches"""
        score = 0
        query_words = query.split()
        
        for word in query_words:
            if word in item['topic'].lower():
                score += 3
            if word in item['content'].lower():
                score += 2
            if any(word in keyword.lower() for keyword in item.get('keywords', [])):
                score += 4
        
        return score
    
    def generate_response(self, user_message, context):
        """Generate response using OpenAI with retrieved context"""
        try:
            # Prepare context string
            context_str = "\n\n".join([f"Topic: {ctx['topic']}\nContent: {ctx['content']}" for ctx in context])
            
            # Create prompt with context
            prompt = f"""You are a compassionate mental health support assistant. Use the following knowledge to help answer the user's question. 
            
Context from knowledge base:
{context_str}

User question: {user_message}

Please provide a helpful, empathetic response based on the context provided. If the context doesn't contain relevant information, provide general supportive guidance while encouraging professional help when appropriate."""

            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a compassionate mental health support assistant."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=500,
                temperature=0.7
            )
            
            return response.choices[0].message.content
            
        except Exception as e:
            logger.error(f"Error generating response: {e}")
            return "I'm here to help, but I'm having trouble processing your request right now. Please consider reaching out to a mental health professional for support."
    
    def detect_distress(self, message):
        """Simple distress detection based on keywords"""
        distress_keywords = [
            'suicide', 'kill myself', 'end it all', 'hurt myself', 'self harm',
            'hopeless', 'worthless', 'can\'t go on', 'want to die', 'emergency'
        ]
        
        message_lower = message.lower()
        return any(keyword in message_lower for keyword in distress_keywords)

# Initialize RAG system
rag_system = MentalHealthRAG('data/mental_health_knowledge.json')

@app.route('/rag/query', methods=['POST'])
def query_rag():
    """Handle RAG queries from the Node.js backend"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Search for relevant context
        context = rag_system.search_relevant_context(user_message)
        
        # Generate response with context
        response = rag_system.generate_response(user_message, context)
        
        # Detect distress
        distress_detected = rag_system.detect_distress(user_message)
        
        return jsonify({
            'response': response,
            'distress_detected': distress_detected,
            'context_used': len(context) > 0,
            'relevant_topics': [ctx['topic'] for ctx in context]
        })
        
    except Exception as e:
        logger.error(f"Error processing query: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy', 'service': 'Mental Health RAG'})

if __name__ == '__main__':
    logger.info("Starting Mental Health RAG Service...")
    app.run(host='0.0.0.0', port=5001, debug=True)