document.addEventListener('DOMContentLoaded', () => {
    // Initialize activities
    initActivities();
});

function initActivities() {
    // Set up activity buttons
    setupActivityButtons();
    
    // Set up modal close buttons
    setupModalCloseButtons();
    
    // Initialize breathing exercise
    initBreathingExercise();
    
    // Initialize gratitude journal
    initGratitudeJournal();
    
    // Initialize music player
    initMusicPlayer();
    
    // Initialize art therapy
    initArtTherapy();
}

function setupActivityButtons() {
    const activityButtons = document.querySelectorAll('.start-activity');
    
    activityButtons.forEach(button => {
        button.addEventListener('click', () => {
            const activity = button.getAttribute('data-activity');
            openActivityModal(activity);
        });
    });
}

function openActivityModal(activity) {
    const modal = document.getElementById(`${activity}-modal`);
    if (modal) {
        modal.style.display = 'flex';
        
        // Start the activity
        if (activity === 'breathing') {
            startBreathingExercise();
        } else if (activity === 'music') {
            // Auto-play music
            togglePlayPause();
        }
    }
}

function setupModalCloseButtons() {
    const closeButtons = document.querySelectorAll('.close-modal');
    
    closeButtons.forEach(button => {
        button.addEventListener('click', () => {
            const modal = button.closest('.modal');
            if (modal) {
                modal.style.display = 'none';
                
                // Stop activities when modal is closed
                if (modal.id === 'breathing-modal') {
                    stopBreathingExercise();
                } else if (modal.id === 'music-modal') {
                    pauseMusic();
                }
            }
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
                
                // Stop activities when modal is closed
                if (modal.id === 'breathing-modal') {
                    stopBreathingExercise();
                } else if (modal.id === 'music-modal') {
                    pauseMusic();
                }
            }
        });
    });
}

// Breathing Exercise
let breathingInterval;
let breathingTimer;
let seconds = 0;

function initBreathingExercise() {
    // Initialize breathing exercise elements
    const timerElement = document.querySelector('#breathing-modal .timer');
    const instructionElement = document.querySelector('#breathing-modal .instruction');
}

function startBreathingExercise() {
    const timerElement = document.querySelector('#breathing-modal .timer');
    const instructionElement = document.querySelector('#breathing-modal .instruction');
    const circle = document.querySelector('#breathing-modal .circle');
    
    // Reset timer
    seconds = 0;
    updateTimer();
    
    // Clear any existing intervals
    if (breathingInterval) clearInterval(breathingInterval);
    if (breathingTimer) clearInterval(breathingTimer);
    
    // Start breathing cycle
    let phase = 0; // 0: inhale, 1: hold, 2: exhale, 3: hold
    updateBreathingPhase(phase, instructionElement);
    
    breathingInterval = setInterval(() => {
        phase = (phase + 1) % 4;
        updateBreathingPhase(phase, instructionElement);
    }, 4000); // 4 seconds per phase
    
    // Start timer
    breathingTimer = setInterval(() => {
        seconds++;
        updateTimer();
    }, 1000);
}

function updateBreathingPhase(phase, instructionElement) {
    const instructions = [
        'Breathe in...',
        'Hold...',
        'Breathe out...',
        'Hold...'
    ];
    
    instructionElement.textContent = instructions[phase];
}

function updateTimer() {
    const timerElement = document.querySelector('#breathing-modal .timer');
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
}

function stopBreathingExercise() {
    if (breathingInterval) clearInterval(breathingInterval);
    if (breathingTimer) clearInterval(breathingTimer);
    
    // Record achievement if exercise was at least 1 minute
    if (seconds >= 60) {
        recordAchievement('breathing');
    }
}

// Gratitude Journal
function initGratitudeJournal() {
    const saveButton = document.querySelector('.save-gratitude');
    
    if (saveButton) {
        saveButton.addEventListener('click', saveGratitudeEntry);
    }
    
    // Load existing entries if available
    loadGratitudeEntries();
}

function saveGratitudeEntry() {
    const textareas = document.querySelectorAll('#gratitude-modal textarea');
    const entries = [];
    
    let hasContent = false;
    
    textareas.forEach(textarea => {
        const entry = textarea.value.trim();
        entries.push(entry);
        if (entry) hasContent = true;
    });
    
    if (hasContent) {
        const now = new Date();
        const gratitudeEntry = {
            entries: entries,
            timestamp: now.toISOString()
        };
        
        // Get existing entries or initialize empty array
        let gratitudeEntries = JSON.parse(localStorage.getItem('gratitudeEntries')) || [];
        
        // Add new entry
        gratitudeEntries.push(gratitudeEntry);
        
        // Save back to local storage
        localStorage.setItem('gratitudeEntries', JSON.stringify(gratitudeEntries));
        
        // Clear textareas
        textareas.forEach(textarea => {
            textarea.value = '';
        });
        
        // Show confirmation
        alert('Your gratitude entry has been saved!');
        
        // Record achievement
        recordAchievement('gratitude');
        
        // Close modal
        document.getElementById('gratitude-modal').style.display = 'none';
    } else {
        alert('Please enter at least one thing you\'re grateful for.');
    }
}

function loadGratitudeEntries() {
    // This function would load and display past entries
    // For now, we'll just leave it as a placeholder
}

// Music Player
let audioElement;
let isPlaying = false;

function initMusicPlayer() {
    const playPauseButton = document.getElementById('play-pause');
    const musicOptions = document.querySelectorAll('.music-option');
    const volumeSlider = document.querySelector('.volume-slider');
    
    if (playPauseButton) {
        playPauseButton.addEventListener('click', togglePlayPause);
    }
    
    if (musicOptions) {
        musicOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                musicOptions.forEach(opt => opt.classList.remove('active'));
                
                // Add active class to clicked option
                option.classList.add('active');
                
                // Change music
                const musicType = option.getAttribute('data-music');
                changeMusic(musicType);
            });
        });
    }
    
    if (volumeSlider) {
        volumeSlider.addEventListener('input', () => {
            if (audioElement) {
                audioElement.volume = volumeSlider.value / 100;
            }
        });
    }
}

function togglePlayPause() {
    const playPauseButton = document.getElementById('play-pause');
    const playPauseIcon = playPauseButton.querySelector('i');
    
    if (isPlaying) {
        pauseMusic();
        playPauseIcon.className = 'fas fa-play';
    } else {
        playMusic();
        playPauseIcon.className = 'fas fa-pause';
    }
    
    isPlaying = !isPlaying;
}

function playMusic() {
    if (!audioElement) {
        // Get selected music type
        const activeOption = document.querySelector('.music-option.active');
        const musicType = activeOption ? activeOption.getAttribute('data-music') : 'nature';
        
        changeMusic(musicType);
    } else {
        audioElement.play();
    }
}

function pauseMusic() {
    if (audioElement) {
        audioElement.pause();
    }
}

function changeMusic(musicType) {
    // In a real app, these would be actual audio files
    const musicSources = {
        nature: 'https://example.com/nature-sounds.mp3',
        meditation: 'https://example.com/meditation-music.mp3',
        piano: 'https://example.com/gentle-piano.mp3'
    };
    
    // For demo purposes, we'll just simulate the audio
    if (audioElement) {
        audioElement.pause();
    }
    
    // Create new audio element
    audioElement = new Audio();
    
    // Set volume
    const volumeSlider = document.querySelector('.volume-slider');
    if (volumeSlider) {
        audioElement.volume = volumeSlider.value / 100;
    }
    
    // In a real app, we would set the source to an actual audio file
    // audioElement.src = musicSources[musicType];
    
    // For demo, we'll just simulate playing
    if (isPlaying) {
        // audioElement.play();
    }
    
    // Update progress bar (in a real app, this would be tied to audio timeupdate event)
    simulateProgress();
}

function simulateProgress() {
    const progressBar = document.querySelector('.progress');
    if (progressBar) {
        let width = 0;
        const interval = setInterval(() => {
            if (width >= 100) {
                clearInterval(interval);
            } else if (isPlaying) {
                width += 0.5;
                progressBar.style.width = width + '%';
            }
        }, 1000);
    }
}

// Art Therapy
let canvas, ctx;
let isDrawing = false;
let currentColor = '#000000';

function initArtTherapy() {
    canvas = document.getElementById('art-canvas');
    if (!canvas) return;
    
    ctx = canvas.getContext('2d');
    
    // Set white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Set up color picker
    const colorButtons = document.querySelectorAll('.color');
    colorButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all colors
            colorButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked color
            button.classList.add('active');
            
            // Set current color
            currentColor = button.getAttribute('data-color');
        });
    });
    
    // Set first color as active
    if (colorButtons.length > 0) {
        colorButtons[0].classList.add('active');
    }
    
    // Set up clear button
    const clearButton = document.getElementById('clear-canvas');
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        });
    }
    
    // Set up save button
    const saveButton = document.getElementById('save-artwork');
    if (saveButton) {
        saveButton.addEventListener('click', saveArtwork);
    }
    
    // Set up drawing events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    // Touch events for mobile
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', stopDrawing);
}

function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.offsetX, e.offsetY);
}

function handleTouch(e) {
    e.preventDefault();
    
    if (e.type === 'touchstart') {
        isDrawing = true;
    }
    
    if (!isDrawing) return;
    
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = currentColor;
    
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
}

function stopDrawing() {
    isDrawing = false;
    ctx.beginPath();
}

function saveArtwork() {
    // In a real app, this would save the artwork to the server or local storage
    // For demo purposes, we'll just show a confirmation
    alert('Your artwork has been saved!');
    
    // Record achievement
    recordAchievement('art');
    
    // Close modal
    document.getElementById('art-modal').style.display = 'none';
}

// Achievement tracking
function recordAchievement(type) {
    // Get existing achievements or initialize empty object
    let achievements = JSON.parse(localStorage.getItem('achievements')) || {};
    
    // Update achievement count
    if (!achievements[type]) {
        achievements[type] = 1;
    } else {
        achievements[type]++;
    }
    
    // Save back to local storage
    localStorage.setItem('achievements', JSON.stringify(achievements));
    
    // Update UI if on progress page
    updateAchievements();
}

function updateAchievements() {
    const achievementItems = document.querySelector('.achievement-items');
    if (!achievementItems) return;
    
    const achievements = JSON.parse(localStorage.getItem('achievements')) || {};
    
    // Update First Conversation achievement
    const chatHistory = JSON.parse(localStorage.getItem('chatHistory')) || [];
    if (chatHistory.length > 0) {
        const firstConversationAchievement = achievementItems.querySelector('.achievement:first-child .achievement-icon');
        if (firstConversationAchievement) {
            firstConversationAchievement.classList.remove('locked');
        }
    }
    
    // Update Breathing Master achievement
    if (achievements.breathing && achievements.breathing >= 5) {
        const breathingAchievement = achievementItems.querySelector('.achievement:nth-child(2) .achievement-icon');
        if (breathingAchievement) {
            breathingAchievement.classList.remove('locked');
        }
    }
}