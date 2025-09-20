document.addEventListener('DOMContentLoaded', () => {
    // Initialize the application
    initApp();
    
    // Load resources from API
    loadResources();
});

function loadResources() {
    fetch('/api/resources')
        .then(response => response.json())
        .then(data => {
            displayResources(data);
        })
        .catch(error => {
            console.error('Error loading resources:', error);
        });
}

function displayResources(resources) {
    const resourcesContainer = document.getElementById('resources-list');
    if (!resourcesContainer) return;
    
    resourcesContainer.innerHTML = '';
    
    resources.forEach(resource => {
        const resourceElement = document.createElement('div');
        resourceElement.className = 'resource-item';
        resourceElement.innerHTML = `
            <h3>${resource.title}</h3>
            <p>${resource.description}</p>
            <span class="resource-category">${resource.category}</span>
            <a href="${resource.url}" target="_blank" class="resource-link">Visit Resource</a>
        `;
        resourcesContainer.appendChild(resourceElement);
    });
}

function initApp() {
    // Set up navigation
    setupNavigation();
    
    // Set up mood selection
    setupMoodSelection();
    
    // Set up language selection
    setupLanguageSelection();
    
    // Set up settings toggles
    setupSettingsToggles();
    
    // Set up clear chat functionality
    setupClearChat();
}

function setupNavigation() {
    const menuItems = document.querySelectorAll('.menu-item[data-page]');
    const pages = document.querySelectorAll('.page');
    
    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            // Update active menu item
            menuItems.forEach(mi => mi.classList.remove('active'));
            item.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                if (page.id === `${targetPage}-page`) {
                    page.classList.add('active');
                } else {
                    page.classList.remove('active');
                }
            });
        });
    });
}

function setupMoodSelection() {
    const moodOptions = document.querySelectorAll('.mood');
    
    moodOptions.forEach(mood => {
        mood.addEventListener('click', () => {
            // Remove selected class from all moods
            moodOptions.forEach(m => m.classList.remove('selected'));
            
            // Add selected class to clicked mood
            mood.classList.add('selected');
            
            // Save mood to local storage
            const selectedMood = mood.getAttribute('data-mood');
            saveMood(selectedMood);
            
            // Update chat with mood selection
            updateChatWithMood(selectedMood);
        });
    });
}

function saveMood(mood) {
    const now = new Date();
    const moodData = {
        mood: mood,
        timestamp: now.toISOString()
    };
    
    // Get existing mood history or initialize empty array
    let moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    // Add new mood entry
    moodHistory.push(moodData);
    
    // Save back to local storage
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
    
    // Update mood chart if on progress page
    updateMoodChart();
}

function updateMoodChart() {
    const chartPlaceholder = document.querySelector('.chart-placeholder');
    if (!chartPlaceholder) return;
    
    const moodHistory = JSON.parse(localStorage.getItem('moodHistory')) || [];
    
    if (moodHistory.length > 0) {
        chartPlaceholder.innerHTML = '';
        chartPlaceholder.style.justifyContent = 'flex-start';
        
        // Create simple mood visualization
        const moodColors = {
            happy: '#4caf50',
            neutral: '#9e9e9e',
            sad: '#2196f3',
            anxious: '#ff9800',
            angry: '#f44336'
        };
        
        // Show last 7 entries or fewer if not available
        const recentMoods = moodHistory.slice(-7);
        
        const chartContainer = document.createElement('div');
        chartContainer.style.display = 'flex';
        chartContainer.style.alignItems = 'flex-end';
        chartContainer.style.height = '100%';
        chartContainer.style.width = '100%';
        chartContainer.style.justifyContent = 'space-around';
        chartContainer.style.padding = '10px';
        
        recentMoods.forEach(entry => {
            const date = new Date(entry.timestamp);
            const formattedDate = `${date.getDate()}/${date.getMonth() + 1}`;
            
            const moodBar = document.createElement('div');
            moodBar.style.display = 'flex';
            moodBar.style.flexDirection = 'column';
            moodBar.style.alignItems = 'center';
            moodBar.style.width = '30px';
            
            const bar = document.createElement('div');
            bar.style.width = '20px';
            bar.style.height = '100px';
            bar.style.backgroundColor = moodColors[entry.mood] || '#9e9e9e';
            bar.style.borderRadius = '5px';
            bar.style.marginBottom = '5px';
            
            const label = document.createElement('div');
            label.textContent = formattedDate;
            label.style.fontSize = '0.7rem';
            label.style.color = '#777';
            
            moodBar.appendChild(bar);
            moodBar.appendChild(label);
            chartContainer.appendChild(moodBar);
        });
        
        chartPlaceholder.appendChild(chartContainer);
    } else {
        chartPlaceholder.innerHTML = '<p>Your mood history will appear here as you use the app.</p>';
    }
}

function setupLanguageSelection() {
    const languageSelect = document.getElementById('language-select');
    
    languageSelect.addEventListener('change', () => {
        const selectedLanguage = languageSelect.value;
        changeLanguage(selectedLanguage);
    });
    
    // Initialize with saved language or default
    const savedLanguage = localStorage.getItem('language') || 'en';
    languageSelect.value = savedLanguage;
    changeLanguage(savedLanguage);
}

function changeLanguage(language) {
    // Save selected language
    localStorage.setItem('language', language);
    
    // Update UI text based on selected language
    const translations = {
        en: {
            moodTitle: 'How are you feeling today?',
            chatPlaceholder: 'Type your message here...',
            // Add more translations as needed
        },
        hi: {
            moodTitle: 'आज आप कैसा महसूस कर रहे हैं?',
            chatPlaceholder: 'अपना संदेश यहां लिखें...',
            // Add more translations as needed
        },
        ta: {
            moodTitle: 'இன்று நீங்கள் எப்படி உணருகிறீர்கள்?',
            chatPlaceholder: 'உங்கள் செய்தியை இங்கே தட்டச்சு செய்யவும்...',
            // Add more translations as needed
        },
        bn: {
            moodTitle: 'আজ আপনি কেমন বোধ করছেন?',
            chatPlaceholder: 'এখানে আপনার বার্তা টাইপ করুন...',
            // Add more translations as needed
        }
    };
    
    // Apply translations
    if (translations[language]) {
        document.getElementById('mood-title').textContent = translations[language].moodTitle;
        document.getElementById('user-input').placeholder = translations[language].chatPlaceholder;
        // Update more UI elements as needed
    }
}

function setupSettingsToggles() {
    const saveChatToggle = document.getElementById('save-chat');
    const anonymousModeToggle = document.getElementById('anonymous-mode');
    const activityRemindersToggle = document.getElementById('activity-reminders');
    
    // Initialize toggles from saved settings
    saveChatToggle.checked = localStorage.getItem('saveChat') !== 'false';
    anonymousModeToggle.checked = localStorage.getItem('anonymousMode') !== 'false';
    activityRemindersToggle.checked = localStorage.getItem('activityReminders') === 'true';
    
    // Add event listeners
    saveChatToggle.addEventListener('change', () => {
        localStorage.setItem('saveChat', saveChatToggle.checked);
    });
    
    anonymousModeToggle.addEventListener('change', () => {
        localStorage.setItem('anonymousMode', anonymousModeToggle.checked);
    });
    
    activityRemindersToggle.addEventListener('change', () => {
        localStorage.setItem('activityReminders', activityRemindersToggle.checked);
    });
}

function setupClearChat() {
    const clearChatButton = document.getElementById('clear-chat');
    
    clearChatButton.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear your chat history? This cannot be undone.')) {
            // Clear chat messages from DOM
            const chatMessages = document.getElementById('chat-messages');
            
            // Keep only the first welcome message
            const welcomeMessage = chatMessages.querySelector('.message');
            chatMessages.innerHTML = '';
            chatMessages.appendChild(welcomeMessage);
            
            // Clear chat history from storage if enabled
            if (localStorage.getItem('saveChat') !== 'false') {
                localStorage.removeItem('chatHistory');
            }
            
            // Show confirmation message
            addBotMessage('Chat history has been cleared.');
        }
    });
}

// Helper function to update chat with mood selection
function updateChatWithMood(mood) {
    const moodMessages = {
        happy: "I'm glad you're feeling happy today! What's bringing you joy?",
        neutral: "You're feeling okay today. Is there anything specific on your mind?",
        sad: "I'm sorry to hear you're feeling sad. Would you like to talk about what's bothering you?",
        anxious: "I notice you're feeling anxious. Deep breaths can help. Would you like to try a breathing exercise together?",
        angry: "I see you're feeling angry. It's okay to feel this way. Would you like to talk about what's frustrating you?"
    };
    
    const message = moodMessages[mood] || "How can I support you today?";
    addBotMessage(message);
}

// Helper function to add bot message to chat
function addBotMessage(message) {
    const chatMessages = document.getElementById('chat-messages');
    
    const messageElement = document.createElement('div');
    messageElement.className = 'message bot';
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    
    const messageParagraph = document.createElement('p');
    messageParagraph.textContent = message;
    
    messageContent.appendChild(messageParagraph);
    messageElement.appendChild(messageContent);
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    // Save to chat history if enabled
    if (localStorage.getItem('saveChat') !== 'false') {
        saveChatMessage('bot', message);
    }
}

// Helper function to save chat message to local storage
function saveChatMessage(sender, message) {
    const now = new Date();
    const chatMessage = {
        sender: sender,
        message: message,
        timestamp: now.toISOString()
    };
    
    // Get existing chat history or initialize empty array
    let chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    
    // Add new message
    chatHistory.push(chatMessage);
    
    // Save back to local storage
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
}