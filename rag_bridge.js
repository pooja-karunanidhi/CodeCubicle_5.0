const axios = require('axios');

class RAGBridge {
    constructor() {
        this.ragServiceUrl = 'http://localhost:5001';
        this.isServiceHealthy = false;
        this.checkServiceHealth();
    }

    async checkServiceHealth() {
        try {
            const response = await axios.get(`${this.ragServiceUrl}/health`, {
                timeout: 5000
            });
            this.isServiceHealthy = response.status === 200;
            console.log('RAG Service health check:', this.isServiceHealthy ? 'Healthy' : 'Unhealthy');
        } catch (error) {
            this.isServiceHealthy = false;
            console.log('RAG Service is not available:', error.message);
        }
    }

    async queryRAG(message) {
        try {
            // Check service health before making request
            if (!this.isServiceHealthy) {
                await this.checkServiceHealth();
                if (!this.isServiceHealthy) {
                    return this.getFallbackResponse(message);
                }
            }

            const response = await axios.post(`${this.ragServiceUrl}/rag/query`, {
                message: message
            }, {
                timeout: 10000,
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            return {
                success: true,
                response: response.data.response,
                distressDetected: response.data.distress_detected,
                contextUsed: response.data.context_used,
                relevantTopics: response.data.relevant_topics || []
            };

        } catch (error) {
            console.error('Error querying RAG service:', error.message);
            this.isServiceHealthy = false;
            
            // Return fallback response if RAG service is unavailable
            return this.getFallbackResponse(message);
        }
    }

    getFallbackResponse(message) {
        // Simple fallback responses when RAG service is unavailable
        const fallbackResponses = {
            anxiety: "I understand you're feeling anxious. Try taking deep breaths and remember that this feeling will pass. If anxiety persists, consider speaking with a mental health professional.",
            depression: "I hear that you're going through a difficult time. You're not alone, and it's okay to ask for help. Consider reaching out to a counselor or therapist.",
            stress: "Stress can be overwhelming. Try to take breaks, practice relaxation techniques, and don't hesitate to seek support from friends, family, or professionals.",
            default: "Thank you for sharing with me. While I'm here to listen, I encourage you to speak with a mental health professional who can provide personalized support and guidance."
        };

        const messageLower = message.toLowerCase();
        let response = fallbackResponses.default;
        let distressDetected = false;

        // Simple keyword matching for fallback
        if (messageLower.includes('anxious') || messageLower.includes('anxiety') || messageLower.includes('worried')) {
            response = fallbackResponses.anxiety;
        } else if (messageLower.includes('depressed') || messageLower.includes('sad') || messageLower.includes('hopeless')) {
            response = fallbackResponses.depression;
            distressDetected = messageLower.includes('hopeless') || messageLower.includes('worthless');
        } else if (messageLower.includes('stress') || messageLower.includes('overwhelmed')) {
            response = fallbackResponses.stress;
        }

        // Check for distress keywords
        const distressKeywords = ['suicide', 'kill myself', 'end it all', 'hurt myself', 'want to die'];
        distressDetected = distressDetected || distressKeywords.some(keyword => messageLower.includes(keyword));

        return {
            success: false,
            response: response,
            distressDetected: distressDetected,
            contextUsed: false,
            relevantTopics: [],
            fallback: true
        };
    }

    async startHealthMonitoring() {
        // Check service health every 30 seconds
        setInterval(() => {
            this.checkServiceHealth();
        }, 30000);
    }
}

module.exports = RAGBridge;