// Configuration Constants
const HACKERNEWS_STORIES_COUNT = 5;
const WEATHER_API_KEY = 'bd6d715c01e7cdbd5cd95b39f2b6c64d'; // Consider moving to environment variable
const TOAST_DURATION = 5000;
const WALLPAPER_CHANGE_INTERVAL = 15 * 60 * 1000; // 15 minutes
const NOTIFICATION_CYCLE_INTERVAL = 1 * 60 * 1000; // 1 minute

// DOM Elements
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const weatherElement = document.getElementById('weather');
const notificationsContainer = document.getElementById('notifications-container');
const toastContainer = document.getElementById('toastContainer');
const backgroundImage = document.getElementById('background-image');

// State Management
let currentLocation = { lat: 32.23, lon: -7.93 }; // Default: Ben Guerir coords
let wallpaperInterval;
let notificationInterval;
let hackerNewsStories = [];
let currentStoryIndex = 0;
let allNotifications = []; // Store all notification cards
let visibleStartIndex = 0; // Track which cards are currently visible

// --- Utility Functions ---
function showToast(message, type = 'info', duration = TOAST_DURATION) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const iconMap = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas ${iconMap[type]} icon"></i>
        <span class="message">${message}</span>
        <button class="close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function createErrorHTML(title, message) {
    return `
        <div class="notification-card visible">
            <div class="header">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Error</span>
            </div>
            <p><strong>Failed to load ${title}:</strong> ${message}</p>
        </div>
    `;
}

// --- Core Functions ---

// Time and Date
function updateTimeDate() {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        hour12: false 
    });
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Wallpaper
async function updateWallpaper() {
    // The wallpaper is now a CSS gradient, so this function is not needed.
    // We can re-enable it if we want to go back to image backgrounds.
}

// Weather
async function fetchWeather(lat = currentLocation.lat, lon = currentLocation.lon) {
    if (WEATHER_API_KEY === 'YOUR_API_KEY') {
        weatherElement.innerHTML = `<i class="fas fa-cog"></i> API Key Needed`;
        return;
    }
    
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        const data = await response.json();
        
        const iconCode = data.weather[0].icon;
        const description = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        const location = data.name;
        
        const weatherIcons = {
            '01d': 'fa-sun', '01n': 'fa-moon',
            '02d': 'fa-cloud-sun', '02n': 'fa-cloud-moon',
            '03d': 'fa-cloud', '03n': 'fa-cloud',
            '04d': 'fa-cloud', '04n': 'fa-cloud',
            '09d': 'fa-cloud-showers-heavy', '09n': 'fa-cloud-showers-heavy',
            '10d': 'fa-cloud-sun-rain', '10n': 'fa-cloud-moon-rain',
            '11d': 'fa-bolt', '11n': 'fa-bolt',
            '13d': 'fa-snowflake', '13n': 'fa-snowflake',
            '50d': 'fa-smog', '50n': 'fa-smog'
        };
        
        weatherElement.innerHTML = `
            <i class="fas ${weatherIcons[iconCode] || 'fa-question-circle'}"></i>
            <span>${temp}°C in ${location}</span>
        `;
        
        currentLocation = { lat, lon };
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        weatherElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Weather unavailable`;
        showToast(`Weather error: ${error.message}`, 'error');
    }
}

// Hacker News
async function fetchHackerNews() {
    try {
        const idsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        if (!idsResponse.ok) throw new Error(`HN API Error: ${idsResponse.status}`);
        const ids = await idsResponse.json();
        const topIds = ids.slice(0, HACKERNEWS_STORIES_COUNT * 2); // Fetch more to ensure we get enough valid stories
        
        const storyPromises = topIds.map(id =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json())
        );
        
        const stories = await Promise.all(storyPromises);
        hackerNewsStories = stories.filter(story => story && story.title && story.url);
        
        if (hackerNewsStories.length > 0) {
            currentStoryIndex = 0;
            cycleNotification(); // Show the first one immediately
            if (notificationInterval) clearInterval(notificationInterval);
            notificationInterval = setInterval(cycleNotification, NOTIFICATION_CYCLE_INTERVAL);
        } else {
            notificationsContainer.innerHTML = createErrorHTML('Hacker News', 'No stories found.');
        }
        
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        notificationsContainer.innerHTML = createErrorHTML('Hacker News', error.message);
    }
}

function cycleNotification() {
    if (hackerNewsStories.length === 0) return;

    const story = hackerNewsStories[currentStoryIndex];
    
    const notificationCard = document.createElement('div');
    notificationCard.className = 'notification-card';
    notificationCard.innerHTML = `
        <div class="header">
            <i class="fab fa-hacker-news"></i>
            <span>Hacker News</span>
        </div>
        <a href="${story.url}" target="_blank" rel="noopener noreferrer">${story.title}</a>
        <p>Score: ${story.score || 0} | Comments: ${story.descendants || 0}</p>
    `;
    
    // Add to beginning of allNotifications array
    allNotifications.unshift(notificationCard);
    
    // Keep maximum of 3 cards - remove old ones (reduced for very compact view)
    if (allNotifications.length > 3) {
        allNotifications.splice(3);
    }
    
    // Reset visibleStartIndex to show the newest card
    visibleStartIndex = 0;
    
    // Update the display
    updateNotificationDisplay();

    currentStoryIndex = (currentStoryIndex + 1) % hackerNewsStories.length;
}

function updateNotificationDisplay() {
    // Clear container
    notificationsContainer.innerHTML = '';
    
    // Show up to 3 cards starting from visibleStartIndex (reduced for very compact view)
    const maxVisible = 3;
    for (let i = 0; i < Math.min(maxVisible, allNotifications.length); i++) {
        const cardIndex = (visibleStartIndex + i) % allNotifications.length;
        const card = allNotifications[cardIndex].cloneNode(true);
        
        // Apply stacking styles
        card.style.position = 'absolute';
        card.style.top = `${i * 3}px`; // Very tight stacking
        card.style.left = '0';
        card.style.right = '0';
        card.style.zIndex = maxVisible - i;
        card.style.width = '100%';
        
        // Apply visual effects based on position
        if (i === 0) {
            card.classList.add('visible');
            card.style.transform = 'translateY(0px) scale(1)';
            card.style.opacity = '1';
            card.style.filter = 'blur(0px)';
        } else if (i === 1) {
            card.classList.add('old');
            card.style.transform = 'translateY(3px) scale(0.98)';
            card.style.opacity = '0.6';
            card.style.filter = 'blur(1px)';
        } else {
            card.classList.add('older');
            card.style.transform = 'translateY(6px) scale(0.96)';
            card.style.opacity = '0.4';
            card.style.filter = 'blur(2px)';
        }
        
        notificationsContainer.appendChild(card);
    }
}

function scrollNotifications(direction) {
    if (allNotifications.length <= 1) return;
    
    if (direction > 0) {
        // Scroll down (show newer cards)
        visibleStartIndex = (visibleStartIndex - 1 + allNotifications.length) % allNotifications.length;
    } else {
        // Scroll up (show older cards)
        visibleStartIndex = (visibleStartIndex + 1) % allNotifications.length;
    }
    
    updateNotificationDisplay();
}


// Geolocation
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude);
            },
            (error) => {
                console.warn("Geolocation failed:", error.message);
                fetchWeather(); // Use default location
            }
        );
    } else {
        console.warn("Geolocation not supported");
        fetchWeather(); // Use default location
    }
}

// Time-based theme update
function updateTheme() {
  const hour = new Date().getHours();
  let c1, c2, c3, text;

  if (hour >= 6 && hour < 12) {
    // Morning
    c1 = '#a1c4fd'; c2 = '#c2e9fb'; c3 = '#ffffff';
    text = '#000000';
  } else if (hour >= 12 && hour < 18) {
    // Day
    c1 = '#fde68a'; c2 = '#f59e0b'; c3 = '#f97316';
    text = '#000000';
  } else if (hour >= 18 && hour < 20) {
    // Evening
    c1 = '#833ab4'; c2 = '#fd1d1d'; c3 = '#fcb045';
    text = '#ffffff';
  } else {
    // Night
    c1 = '#0f2027'; c2 = '#203a43'; c3 = '#2c5364';
    text = '#ffffff';
  }
  const root = document.documentElement.style;
  root.setProperty('--color-1', c1);
  root.setProperty('--color-2', c2);
  root.setProperty('--color-3', c3);
  root.setProperty('--text-color', text);
}

// Initialization
function init() {
    // Initial calls
    updateTimeDate();
    getCurrentLocation();
    fetchHackerNews();
    updateTheme();

    // Set intervals
    setInterval(updateTimeDate, 1000);
    setInterval(updateTheme, 60 * 1000);
    setInterval(cycleNotification, NOTIFICATION_CYCLE_INTERVAL);
    
    // Add scroll event listener for card navigation
    notificationsContainer.addEventListener('wheel', (e) => {
        e.preventDefault();
        const direction = e.deltaY > 0 ? 1 : -1;
        scrollNotifications(direction);
    }, { passive: false });
    
    // Add touch support for mobile
    let startY = 0;
    notificationsContainer.addEventListener('touchstart', (e) => {
        startY = e.touches[0].clientY;
    });
    
    notificationsContainer.addEventListener('touchend', (e) => {
        const endY = e.changedTouches[0].clientY;
        const diff = startY - endY;
        
        if (Math.abs(diff) > 50) { // Minimum swipe distance
            const direction = diff > 0 ? 1 : -1;
            scrollNotifications(direction);
        }
    });
    
    // Welcome message
    setTimeout(() => {
        showToast('Welcome to your personal Gateway.', 'info', 6000);
    }, 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // if (wallpaperInterval) clearInterval(wallpaperInterval);
    if (notificationInterval) clearInterval(notificationInterval);
});

// Start the application
document.addEventListener('DOMContentLoaded', init);

