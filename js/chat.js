document.addEventListener('DOMContentLoaded', () => {
    // Initialize chat functionality
    initChat();
});

function initChat() {
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-button');
    const chatMessages = document.getElementById('chat-messages');
    
    // Load chat history if enabled
    if (localStorage.getItem('saveChat') !== 'false') {
        loadChatHistory();
    }
    
    // Create anonymous user if not exists
    createAnonymousUserIfNeeded();
    
    // Set up send button click event
    sendButton.addEventListener('click', () => {
        sendMessage();
    });
    
    // Set up enter key press event
    userInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // Auto-resize textarea as user types
    userInput.addEventListener('input', () => {
        userInput.style.height = 'auto';
        userInput.style.height = (userInput.scrollHeight) + 'px';
    });
}

function sendMessage() {
    const userInput = document.getElementById('user-input');
    const message = userInput.value.trim();
    
    if (message) {
        // Add user message to chat
        addUserMessage(message);
        
        // Clear input
        userInput.value = '';
        userInput.style.height = 'auto';
        
        // Show typing indicator
        showTypingIndicator();
        
        // Send message to API
        sendMessageToAPI(message)
            .then(response => {
                // Remove typing indicator
                removeTypingIndicator();
                
                // Add bot response to chat
                addBotMessage(response.text);
                
                // If distress detected, show resources
                if (response.distressDetected) {
                    showResourcesTab();
                }
            })
            .catch(error => {
                console.error('Error sending message:', error);
                removeTypingIndicator();
                
                // Process message for potential distress signals
                const distressLevel = detectDistress(message);
                
                // Generate bot response based on message and distress level
                generateResponse(message, distressLevel);
            });
    }
}

function addUserMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message user';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    // Encrypt message if anonymous mode is enabled
    const isAnonymousMode = localStorage.getItem('anonymousMode') !== 'false';
    const displayMessage = isAnonymousMode ? message : message;
    const storedMessage = isAnonymousMode ? encryptMessage(message) : message;
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = displayMessage;
    
    messageContent.appendChild(messageParagraph);
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to chat history if enabled
    if (localStorage.getItem('saveChat') !== 'false') {
        saveChatMessage('user', storedMessage);
    }
}

async function sendMessageToAPI(message) {
    try {
        // Get user ID from local storage
        const userId = localStorage.getItem('userId') || 'anonymous';
        
        // Get selected language
        const language = localStorage.getItem('language') || 'en';
        
        // Encrypt message for privacy if anonymous mode is enabled
        const isAnonymousMode = localStorage.getItem('anonymousMode') !== 'false';
        const messageToSend = isAnonymousMode ? encryptMessage(message) : message;
        
        const response = await fetch('/api/chat/message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: messageToSend,
                username: userId,
                language: language
            })
        });
        
        if (!response.ok) {
            throw new Error('API request failed');
        }
        
        const data = await response.json();
        return {
            text: data.response.text,
            distressDetected: data.response.distressDetected
        };
    } catch (error) {
        console.error('Error in API call:', error);
        throw error;
    }
}

function generateResponse(message, distressLevel) {
    // Get selected language
    const language = localStorage.getItem('language') || 'en';
    
    // Simulate AI processing delay
    setTimeout(() => {
        let response;
        
        // Check distress level and provide appropriate response
        if (distressLevel >= 0.8) {
            response = getDistressResponse(language);
        } else if (distressLevel >= 0.5) {
            response = getMildDistressResponse(language, message);
        } else {
            response = getRegularResponse(language, message);
        }
        
        // Add bot response to chat
        addBotMessage(response);
    }, 1000);
}

function detectDistress(message) {
    // Simple keyword-based distress detection
    // In a real implementation, this would use more sophisticated NLP
    const distressKeywords = [
        'suicide', 'kill myself', 'end it all', 'don\'t want to live',
        'want to die', 'hurt myself', 'self harm', 'cut myself',
        'no reason to live', 'better off dead', 'can\'t take it anymore'
    ];
    
    const lowercaseMessage = message.toLowerCase();
    
    // Check for exact matches of distress phrases
    for (const keyword of distressKeywords) {
        if (lowercaseMessage.includes(keyword)) {
            return 0.9; // High distress
        }
    }
    
    // Check for potential distress indicators
    const potentialDistressKeywords = [
        'depressed', 'anxious', 'hopeless', 'worthless', 'empty',
        'alone', 'lonely', 'sad', 'tired of', 'exhausted', 'overwhelmed',
        'can\'t cope', 'struggling', 'no hope', 'give up'
    ];
    
    for (const keyword of potentialDistressKeywords) {
        if (lowercaseMessage.includes(keyword)) {
            return 0.6; // Moderate distress
        }
    }
    
    return 0.1; // Low or no distress
}

function getDistressResponse(language) {
    const responses = {
        en: [
            "I'm concerned about what you're sharing. Remember that you're not alone, and help is available. Would you like me to provide some crisis resources that might help?",
            "It sounds like you're going through a really difficult time. Your feelings are valid, but please know that there are people who care and want to help. Would you like to talk about some immediate support options?",
            "I'm here to listen, but I also want to make sure you're safe. There are trained professionals who can provide better support during crisis moments. Can I share some helpline numbers with you?"
        ],
        hi: [
            "आप जो साझा कर रहे हैं, उसके बारे में मुझे चिंता है। याद रखें कि आप अकेले नहीं हैं, और मदद उपलब्ध है। क्या आप चाहेंगे कि मैं कुछ संकट संसाधन प्रदान करूं जो मदद कर सकते हैं?",
            "ऐसा लगता है कि आप वास्तव में एक कठिन समय से गुजर रहे हैं। आपकी भावनाएं वैध हैं, लेकिन कृपया जानें कि ऐसे लोग हैं जो परवाह करते हैं और मदद करना चाहते हैं। क्या आप कुछ तत्काल सहायता विकल्पों के बारे में बात करना चाहेंगे?",
            "मैं सुनने के लिए यहां हूं, लेकिन मैं यह भी सुनिश्चित करना चाहता हूं कि आप सुरक्षित हैं। ऐसे प्रशिक्षित पेशेवर हैं जो संकट के क्षणों के दौरान बेहतर समर्थन प्रदान कर सकते हैं। क्या मैं आपके साथ कुछ हेल्पलाइन नंबर साझा कर सकता हूं?"
        ],
        ta: [
            "நீங்கள் பகிர்வது குறித்து நான் கவலைப்படுகிறேன். நீங்கள் தனியாக இல்லை என்பதை நினைவில் கொள்ளுங்கள், மேலும் உதவி கிடைக்கிறது. உதவக்கூடிய சில நெருக்கடி ஆதாரங்களை நான் வழங்க வேண்டுமா?",
            "நீங்கள் மிகவும் கடினமான நேரத்தைக் கடந்து செல்வது போல் தெரிகிறது. உங்கள் உணர்வுகள் செல்லுபடியாகும், ஆனால் அக்கறை கொண்டவர்களும் உதவ விரும்புபவர்களும் இருப்பதை நினைவில் கொள்ளுங்கள். சில உடனடி ஆதரவு விருப்பங்களைப் பற்றி பேச விரும்புகிறீர்களா?",
            "நான் கேட்க இங்கே இருக்கிறேன், ஆனால் நீங்கள் பாதுகாப்பாக இருப்பதை உறுதிப்படுத்த விரும்புகிறேன். நெருக்கடி நேரங்களில் சிறந்த ஆதரவை வழங்கக்கூடிய பயிற்சி பெற்ற நிபுணர்கள் உள்ளனர். உங்களுடன் சில உதவி எண்களைப் பகிர்ந்து கொள்ளலாமா?"
        ],
        bn: [
            "আপনি যা শেয়ার করছেন তা নিয়ে আমি উদ্বিগ্ন। মনে রাখবেন যে আপনি একা নন, এবং সাহায্য পাওয়া যায়। আপনি কি চান আমি কিছু সংকট সংস্থান প্রদান করি যা সাহায্য করতে পারে?",
            "মনে হচ্ছে আপনি সত্যিই একটি কঠিন সময় কাটাচ্ছেন। আপনার অনুভূতিগুলি বৈধ, তবে দয়া করে জেনে রাখুন যে এমন লোক আছে যারা যত্ন নেয় এবং সাহায্য করতে চায়। আপনি কি কিছু অবিলম্বে সমর্থন বিকল্প সম্পর্কে কথা বলতে চান?",
            "আমি শুনতে এখানে আছি, তবে আমি নিশ্চিত করতে চাই যে আপনি নিরাপদ। এমন প্রশিক্ষিত পেশাদাররা আছেন যারা সংকটের মুহূর্তে আরও ভাল সমর্থন প্রদান করতে পারেন। আমি কি আপনার সাথে কিছু হেল্পলাইন নম্বর শেয়ার করতে পারি?"
        ]
    };
    
    // Get responses for selected language or default to English
    const languageResponses = responses[language] || responses.en;
    
    // Return random response from the available options
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
}

function getMildDistressResponse(language, message) {
    const responses = {
        en: [
            "It sounds like you're going through a challenging time. Would you like to talk more about what's bothering you?",
            "I'm here to listen. Sometimes sharing our feelings can help us process them better. What's on your mind?",
            "Thank you for sharing that with me. It takes courage to express difficult emotions. Would you like to explore some coping strategies together?"
        ],
        hi: [
            "ऐसा लगता है कि आप एक चुनौतीपूर्ण समय से गुजर रहे हैं। क्या आप इस बारे में अधिक बात करना चाहेंगे कि आपको क्या परेशान कर रहा है?",
            "मैं सुनने के लिए यहां हूं। कभी-कभी अपनी भावनाओं को साझा करने से हमें उन्हें बेहतर ढंग से संसाधित करने में मदद मिल सकती है। आपके मन में क्या है?",
            "मुझे यह बताने के लिए धन्यवाद। मुश्किल भावनाओं को व्यक्त करने के लिए साहस की आवश्यकता होती है। क्या आप मेरे साथ कुछ सामना करने की रणनीतियों का पता लगाना चाहेंगे?"
        ],
        ta: [
            "நீங்கள் ஒரு சவாலான காலத்தைக் கடந்து செல்வது போல் தெரிகிறது. உங்களைத் தொந்தரவு செய்வது குறித்து மேலும் பேச விரும்புகிறீர்களா?",
            "நான் கேட்க இங்கே இருக்கிறேன். சில நேரங்களில் நமது உணர்வுகளைப் பகிர்வது அவற்றை சிறப்பாகச் செயலாக்க உதவும். உங்கள் மனதில் என்ன உள்ளது?",
            "அதை என்னுடன் பகிர்ந்து கொண்டதற்கு நன்றி. கடினமான உணர்வுகளை வெளிப்படுத்த தைரியம் தேவை. நீங்கள் என்னுடன் சில சமாளிக்கும் உத்திகளை ஆராய விரும்புகிறீர்களா?"
        ],
        bn: [
            "মনে হচ্ছে আপনি একটি চ্যালেঞ্জিং সময় কাটাচ্ছেন। আপনাকে কী বিরক্ত করছে সে সম্পর্কে আপনি আরও কথা বলতে চান?",
            "আমি শুনতে এখানে আছি। কখনও কখনও আমাদের অনুভূতি ভাগ করে নেওয়া আমাদের সেগুলি আরও ভালভাবে প্রক্রিয়া করতে সাহায্য করতে পারে। আপনার মনে কী আছে?",
            "আমার সাথে তা শেয়ার করার জন্য ধন্যবাদ। কঠিন আবেগ প্রকাশ করতে সাহস লাগে। আপনি কি একসাথে কিছু মোকাবেলা কৌশল অন্বেষণ করতে চান?"
        ]
    };
    
    // Get responses for selected language or default to English
    const languageResponses = responses[language] || responses.en;
    
    // Return random response from the available options
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
}

function getRegularResponse(language, message) {
    // In a real implementation, this would call an AI service
    // For now, we'll use some simple pattern matching
    
    const lowercaseMessage = message.toLowerCase();
    
    // Check for greetings
    if (lowercaseMessage.match(/\b(hi|hello|hey|namaste|vanakkam)\b/i)) {
        return getGreetingResponse(language);
    }
    
    // Check for questions about the app
    if (lowercaseMessage.includes('what can you do') || 
        lowercaseMessage.includes('how does this work') ||
        lowercaseMessage.includes('help me')) {
        return getHelpResponse(language);
    }
    
    // Check for gratitude
    if (lowercaseMessage.match(/\b(thanks|thank you|grateful)\b/i)) {
        return getGratitudeResponse(language);
    }
    
    // Default responses
    const defaultResponses = {
        en: [
            "I'm here to support you. Can you tell me more about what's on your mind?",
            "Thank you for sharing. How long have you been feeling this way?",
            "I'm listening. What would help you feel better right now?",
            "That sounds challenging. What strategies have helped you cope in the past?"
        ],
        hi: [
            "मैं आपका समर्थन करने के लिए यहां हूं। क्या आप मुझे बता सकते हैं कि आपके मन में क्या चल रहा है?",
            "साझा करने के लिए धन्यवाद। आप कब से ऐसा महसूस कर रहे हैं?",
            "मैं सुन रहा हूं। अभी आपको बेहतर महसूस करने में क्या मदद करेगा?",
            "वह चुनौतीपूर्ण लगता है। अतीत में आपको किन रणनीतियों से सामना करने में मदद मिली है?"
        ],
        ta: [
            "நான் உங்களை ஆதரிக்க இங்கே இருக்கிறேன். உங்கள் மனதில் என்ன இருக்கிறது என்பதைப் பற்றி மேலும் சொல்ல முடியுமா?",
            "பகிர்ந்தமைக்கு நன்றி. நீங்கள் எவ்வளவு காலமாக இப்படி உணர்கிறீர்கள்?",
            "நான் கேட்டுக்கொண்டிருக்கிறேன். இப்போது நீங்கள் நன்றாக உணர உதவுவது என்ன?",
            "அது சவாலாகத் தெரிகிறது. கடந்த காலத்தில் சமாளிக்க எந்த உத்திகள் உதவின?"
        ],
        bn: [
            "আমি আপনাকে সমর্থন করতে এখানে আছি। আপনার মনে কী আছে সে সম্পর্কে আপনি আমাকে আরও বলতে পারেন?",
            "শেয়ার করার জন্য ধন্যবাদ। আপনি কতদিন ধরে এইভাবে অনুভব করছেন?",
            "আমি শুনছি। এখন আপনাকে ভাল বোধ করতে কী সাহায্য করবে?",
            "তা চ্যালেঞ্জিং মনে হচ্ছে। অতীতে কোন কৌশলগুলি আপনাকে মোকাবেলা করতে সাহায্য করেছে?"
        ]
    };
    
    // Get responses for selected language or default to English
    const languageResponses = defaultResponses[language] || defaultResponses.en;
    
    // Return random response from the available options
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
}

function getGreetingResponse(language) {
    const greetings = {
        en: ["Hello! How are you feeling today?", "Hi there! How can I support you today?", "Hello! I'm here to listen. What's on your mind?"],
        hi: ["नमस्ते! आज आप कैसा महसूस कर रहे हैं?", "नमस्कार! आज मैं आपकी कैसे सहायता कर सकता हूँ?", "नमस्ते! मैं सुनने के लिए यहां हूं। आपके मन में क्या है?"],
        ta: ["வணக்கம்! இன்று நீங்கள் எப்படி உணருகிறீர்கள்?", "வணக்கம்! இன்று நான் உங்களை எவ்வாறு ஆதரிக்க முடியும்?", "வணக்கம்! நான் கேட்க இங்கே இருக்கிறேன். உங்கள் மனதில் என்ன உள்ளது?"],
        bn: ["হ্যালো! আজ আপনি কেমন বোধ করছেন?", "হাই! আজ আমি কীভাবে আপনাকে সমর্থন করতে পারি?", "হ্যালো! আমি শুনতে এখানে আছি। আপনার মনে কী আছে?"]
    };
    
    const languageGreetings = greetings[language] || greetings.en;
    return languageGreetings[Math.floor(Math.random() * languageGreetings.length)];
}

function getHelpResponse(language) {
    const helpResponses = {
        en: "I'm here to provide emotional support and a safe space to talk. You can share your feelings, and I'll listen without judgment. I can also suggest coping strategies, breathing exercises, or connect you with professional resources if needed. What would be most helpful for you right now?",
        hi: "मैं भावनात्मक समर्थन और बात करने के लिए एक सुरक्षित जगह प्रदान करने के लिए यहां हूं। आप अपनी भावनाओं को साझा कर सकते हैं, और मैं बिना किसी निर्णय के सुनूंगा। मैं सामना करने की रणनीतियों, श्वास व्यायाम का सुझाव दे सकता हूं, या यदि आवश्यक हो तो आपको पेशेवर संसाधनों से जोड़ सकता हूं। अभी आपके लिए सबसे अधिक मददगार क्या होगा?",
        ta: "நான் உணர்ச்சி ஆதரவையும் பேசுவதற்கு பாதுகாப்பான இடத்தையும் வழங்க இங்கே இருக்கிறேன். நீங்கள் உங்கள் உணர்வுகளைப் பகிர்ந்து கொள்ளலாம், நான் தீர்ப்பின்றி கேட்பேன். தேவைப்பட்டால் நான் சமாளிக்கும் உத்திகள், சுவாசப் பயிற்சிகளைப் பரிந்துரைக்கலாம் அல்லது உங்களை தொழில்முறை ஆதாரங்களுடன் இணைக்கலாம். இப்போது உங்களுக்கு மிகவும் உதவியாக இருப்பது என்ன?",
        bn: "আমি আবেগীয় সমর্থন এবং কথা বলার জন্য একটি নিরাপদ জায়গা প্রদান করতে এখানে আছি। আপনি আপনার অনুভূতি শেয়ার করতে পারেন, এবং আমি বিচার ছাড়াই শুনব। প্রয়োজনে আমি মোকাবেলা কৌশল, শ্বাস প্রশ্বাসের ব্যায়াম পরামর্শ দিতে পারি, বা আপনাকে পেশাদার সংস্থানের সাথে সংযোগ করতে পারি। এখন আপনার জন্য সবচেয়ে সহায়ক কী হবে?"
    };
    
    return helpResponses[language] || helpResponses.en;
}

function getGratitudeResponse(language) {
    const gratitudeResponses = {
        en: ["You're welcome! I'm glad I could help.", "It's my pleasure to support you.", "I'm here for you anytime you need to talk."],
        hi: ["आपका स्वागत है! मुझे खुशी है कि मैं मदद कर सका।", "आपका समर्थन करना मेरा सौभाग्य है।", "जब भी आपको बात करने की जरूरत हो, मैं आपके लिए यहां हूं।"],
        ta: ["வரவேற்கிறேன்! நான் உதவ முடிந்ததில் மகிழ்ச்சி அடைகிறேன்.", "உங்களை ஆதரிப்பது எனக்கு மகிழ்ச்சி.", "நீங்கள் பேச வேண்டிய நேரத்தில் நான் உங்களுக்காக இங்கே இருக்கிறேன்."],
        bn: ["স্বাগতম! আমি সাহায্য করতে পেরে খুশি।", "আপনাকে সমর্থন করা আমার আনন্দ।", "আপনার কথা বলার প্রয়োজন হলে আমি সবসময় আপনার জন্য এখানে আছি।"]
    };
    
    const languageResponses = gratitudeResponses[language] || gratitudeResponses.en;
    return languageResponses[Math.floor(Math.random() * languageResponses.length)];
}

function loadChatHistory() {
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    const chatMessages = document.getElementById('chat-messages');
    
    // Clear existing messages except the first welcome message
    const welcomeMessage = chatMessages.querySelector('.message');
    chatMessages.innerHTML = '';
    
    if (welcomeMessage) {
        chatMessages.appendChild(welcomeMessage);
    }
    
    // Add messages from history
    chatHistory.forEach(entry => {
        if (entry.sender === 'user') {
            // Decrypt message if it was encrypted
            const isAnonymousMode = localStorage.getItem('anonymousMode') !== 'false';
            const message = isAnonymousMode ? decryptMessage(entry.message) : entry.message;
            
            const messageElement = document.createElement('div');
            messageElement.className = 'message user';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = message;
            
            messageContent.appendChild(messageParagraph);
            messageElement.appendChild(messageContent);
            chatMessages.appendChild(messageElement);
        } else {
            const messageElement = document.createElement('div');
            messageElement.className = 'message bot';
            
            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';
            
            const messageParagraph = document.createElement('p');
            messageParagraph.textContent = entry.message;
            
            messageContent.appendChild(messageParagraph);
            messageElement.appendChild(messageContent);
            chatMessages.appendChild(messageElement);
        }
    });
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

async function createAnonymousUserIfNeeded() {
    // Check if user ID exists in local storage
    const userId = localStorage.getItem('userId');
    
    if (!userId) {
        try {
            // Get language preference
            const language = localStorage.getItem('language') || 'en';
            
            // Create anonymous user
            const response = await fetch('/api/user/anonymous', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ language })
            });
            
            if (!response.ok) {
                throw new Error('Failed to create anonymous user');
            }
            
            const data = await response.json();
            
            // Save user ID to local storage
            localStorage.setItem('userId', data.userId);
        } catch (error) {
            console.error('Error creating anonymous user:', error);
            // Generate a local ID as fallback
            const localId = 'local_' + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('userId', localId);
        }
    }
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chat-messages');
    const typingElement = document.createElement('div');
    typingElement.className = 'message bot typing-indicator';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const typingDots = document.createElement('div');
    typingDots.className = 'typing-dots';
    typingDots.innerHTML = '<span></span><span></span><span></span>';
    
    messageContent.appendChild(typingDots);
    typingElement.appendChild(messageContent);
    chatMessages.appendChild(typingElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

function showResourcesTab() {
    // Add a message with crisis resources
    const language = localStorage.getItem('language') || 'en';
    const resourcesMessage = getResourcesMessage(language);
    addBotMessage(resourcesMessage);
}

function getResourcesMessage(language) {
    const resources = {
        en: "I notice you may be going through a difficult time. Remember that you're not alone, and help is available. Here are some resources that might be helpful:\n\n• Crisis Text Line: Text HOME to 741741\n• National Suicide Prevention Lifeline: 988 or 1-800-273-8255\n• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/",
        hi: "मुझे लगता है कि आप एक कठिन समय से गुजर रहे हैं। याद रखें कि आप अकेले नहीं हैं, और मदद उपलब्ध है। यहां कुछ संसाधन हैं जो सहायक हो सकते हैं:\n\n• क्राइसिस टेक्स्ट लाइन: HOME को 741741 पर टेक्स्ट करें\n• नेशनल सुसाइड प्रिवेंशन लाइफलाइन: 988 या 1-800-273-8255\n• इंटरनेशनल एसोसिएशन फॉर सुसाइड प्रिवेंशन: https://www.iasp.info/resources/Crisis_Centres/",
        ta: "நீங்கள் ஒரு கடினமான நேரத்தைக் கடந்து செல்வதாக நான் கவனிக்கிறேன். நீங்கள் தனியாக இல்லை என்பதை நினைவில் கொள்ளுங்கள், மேலும் உதவி கிடைக்கிறது. இங்கே சில ஆதாரங்கள் உள்ளன:\n\n• நெருக்கடி உரை வரி: HOME ஐ 741741 க்கு அனுப்பவும்\n• தேசிய தற்கொலை தடுப்பு வாழ்க்கை: 988 அல்லது 1-800-273-8255\n• தற்கொலை தடுப்புக்கான சர்வதேச சங்கம்: https://www.iasp.info/resources/Crisis_Centres/",
        bn: "আমি লক্ষ্য করেছি আপনি একটি কঠিন সময় কাটাচ্ছেন। মনে রাখবেন যে আপনি একা নন, এবং সাহায্য পাওয়া যায়। এখানে কিছু সংস্থান রয়েছে যা সাহায্য করতে পারে:\n\n• ক্রাইসিস টেক্সট লাইন: HOME লিখুন 741741 নম্বরে\n• ন্যাশনাল সুইসাইড প্রিভেনশন লাইফলাইন: 988 বা 1-800-273-8255\n• আন্তর্জাতিক অ্যাসোসিয়েশন ফর সুইসাইড প্রিভেনশন: https://www.iasp.info/resources/Crisis_Centres/"
    };
    
    return resources[language] || resources.en;
}

// Simple encryption/decryption functions
// Note: This is a very basic implementation for demonstration purposes only
// In a real application, use a proper encryption library
function encryptMessage(message) {
    // Simple XOR encryption with a fixed key
    // This is NOT secure for real applications
    const key = 'MINDFULCOMPANION';
    let encrypted = '';
    
    for (let i = 0; i < message.length; i++) {
        const charCode = message.charCodeAt(i) ^ key.charCodeAt(i % key.length);
        encrypted += String.fromCharCode(charCode);
    }
    
    // Convert to base64 for storage
    return btoa(encrypted);
}

function decryptMessage(encryptedMessage) {
    try {
        // Convert from base64
        const encrypted = atob(encryptedMessage);
        const key = 'MINDFULCOMPANION';
        let decrypted = '';
        
        for (let i = 0; i < encrypted.length; i++) {
            const charCode = encrypted.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            decrypted += String.fromCharCode(charCode);
        }
        
        return decrypted;
    } catch (e) {
        // If decryption fails (e.g., not encrypted), return the original message
        return encryptedMessage;
    }
}