// Configuration Constants
const HACKERNEWS_STORIES_COUNT = 15;
const REDDIT_POST_LIMIT = 20;
const DEFAULT_SUBREDDIT = 'programming';
const WEATHER_API_KEY = 'bd6d715c01e7cdbd5cd95b39f2b6c64d'; // Consider moving to environment variable
const TOAST_DURATION = 5000;

// DOM Elements
const bodyElement = document.body;
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const weatherElement = document.getElementById('weather');
const weatherDetailsElement = document.getElementById('weatherDetails');
const themeToggleButton = document.getElementById('themeToggle');
const hnPostsContainer = document.getElementById('hnPosts');
const redditPostsContainer = document.getElementById('redditPosts');
const redditTitleElement = document.getElementById('redditTitle');
const subredditInputElement = document.getElementById('subredditInput');
const subredditLoadButton = document.getElementById('subredditLoad');
const noteElement = document.getElementById('notes');
const toastContainer = document.getElementById('toastContainer');
const cityInputElement = document.getElementById('cityInput');
const citySearchButton = document.getElementById('citySearchBtn');

// Refresh buttons
const hnRefreshBtn = document.getElementById('hnRefresh');
const redditRefreshBtn = document.getElementById('redditRefresh');
const weatherRefreshBtn = document.getElementById('weatherRefresh');
const notesRefreshBtn = document.getElementById('notesRefresh');

// State Management
let currentLocation = { lat: 32.23, lon: -7.93 }; // Default: Ben Guerir coords
let currentSubreddit = DEFAULT_SUBREDDIT;
let refreshIntervals = {};
let currentCity = 'Ben Guerir'; // Default city name

// Utility Functions
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
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
}

function createLoadingHTML(message = 'Loading...') {
    return `
        <div class="loading">
            <i class="fas fa-spinner"></i>
            <span>${message}</span>
        </div>
    `;
}

function createErrorHTML(title, message, retryCallback = null) {
    const retryButton = retryCallback ? 
        `<button class="retry-btn" onclick="${retryCallback}">
            <i class="fas fa-redo"></i> Retry
        </button>` : '';
    
    return `
        <div class="error">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Failed to load ${title}</h3>
            <p>${message}</p>
            ${retryButton}
        </div>
    `;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Background Animation
function initBackgroundAnimation() {
    const canvas = document.getElementById('background');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.size = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(138, 133, 255, ${this.opacity})`;
            ctx.fill();
        }
    }
    
    function initParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor((canvas.width * canvas.height) / 15000));
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        requestAnimationFrame(animate);
    }
    
    function setupCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        initParticles();
    }
    
    if (window.matchMedia('(prefers-reduced-motion: no-preference)').matches) {
        setupCanvas();
        animate();
        window.addEventListener('resize', debounce(setupCanvas, 250));
    } else {
        canvas.style.display = 'none';
    }
}

// Time & Date Functions
function updateTimeDate() {
    const now = new Date();
    timeElement.textContent = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit', 
        hour12: false 
    });
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
}

// Weather Functions
async function fetchWeather(lat = currentLocation.lat, lon = currentLocation.lon, showToastOnError = true) {
    weatherElement.innerHTML = `<i class="fas fa-spinner"></i> Loading weather...`;
    weatherDetailsElement.innerHTML = createLoadingHTML('Loading weather details...');
    
    if (WEATHER_API_KEY === 'YOUR_API_KEY') {
        const message = 'Weather API key not configured';
        weatherElement.innerHTML = `<i class="fas fa-cog"></i> ${message}`;
        weatherDetailsElement.innerHTML = createErrorHTML('Weather', message);
        if (showToastOnError) showToast(message, 'warning');
        return;
    }
    
    const weatherApiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    
    try {
        const response = await fetch(weatherApiUrl);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
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
            <span>${temp}°C, ${description} in ${location}</span>
        `;
        
        weatherDetailsElement.innerHTML = `
            <div class="weather-item">
                <span class="label">Temperature</span>
                <span class="value">${temp}°C</span>
            </div>
            <div class="weather-item">
                <span class="label">Feels like</span>
                <span class="value">${Math.round(data.main.feels_like)}°C</span>
            </div>
            <div class="weather-item">
                <span class="label">Humidity</span>
                <span class="value">${data.main.humidity}%</span>
            </div>
            <div class="weather-item">
                <span class="label">Pressure</span>
                <span class="value">${data.main.pressure} hPa</span>
            </div>
            <div class="weather-item">
                <span class="label">Wind Speed</span>
                <span class="value">${data.wind?.speed || 0} m/s</span>
            </div>
            <div class="weather-item">
                <span class="label">Visibility</span>
                <span class="value">${data.visibility ? (data.visibility / 1000).toFixed(1) + ' km' : 'N/A'}</span>
            </div>
        `;
        
        // Update current location
        currentLocation = { lat, lon };
        
    } catch (error) {
        console.error('Error fetching weather:', error);
        const message = 'Weather data unavailable';
        weatherElement.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
        weatherDetailsElement.innerHTML = createErrorHTML('Weather', error.message, 'refreshWeather()');
        if (showToastOnError) showToast(`Weather error: ${error.message}`, 'error');
    }
}


// City Search Function
async function fetchWeatherByCity(cityName, showToastOnError = true) {
    if (!cityName.trim()) {
        showToast("Please enter a city name", "warning", 3000);
        return;
    }
    
    citySearchButton.disabled = true;
    cityInputElement.disabled = true;
    citySearchButton.classList.add("loading");
    
    if (WEATHER_API_KEY === "YOUR_API_KEY") {
        const message = "Weather API key not configured";
        if (showToastOnError) showToast(message, "warning");
        citySearchButton.disabled = false;
        cityInputElement.disabled = false;
        citySearchButton.classList.remove("loading");
        return;
    }
    
    const geocodingUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(cityName)}&limit=1&appid=${WEATHER_API_KEY}`;
    
    try {
        const response = await fetch(geocodingUrl);
        if (!response.ok) {
            throw new Error(`Geocoding API error! Status: ${response.status}`);
        }
        const data = await response.json();
        
        if (!data || data.length === 0) {
            throw new Error(`City "${cityName}" not found. Please check the spelling and try again.`);
        }
        
        const location = data[0];
        await fetchWeather(location.lat, location.lon, showToastOnError);
        
        showToast(`Weather updated for ${location.name}${location.country ? `, ${location.country}` : ""}`, "success", 3000);
        
    } catch (error) {
        console.error("Error fetching weather by city:", error);
        if (showToastOnError) showToast(`City search error: ${error.message}`, "error");
    } finally {
        citySearchButton.disabled = false;
        cityInputElement.disabled = false;
        citySearchButton.classList.remove("loading");
    }
}
// Hacker News Functions
async function fetchHackerNews(showToastOnError = true) {
    hnPostsContainer.innerHTML = createLoadingHTML('Loading Hacker News...');
    
    try {
        const idsResponse = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        if (!idsResponse.ok) throw new Error(`HN API Error: ${idsResponse.status}`);
        const ids = await idsResponse.json();
        const topIds = ids.slice(0, HACKERNEWS_STORIES_COUNT);
        
        const storyPromises = topIds.map(id =>
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => {
                if (!res.ok) throw new Error(`HN Item API Error: ${res.status}`);
                return res.json();
            })
        );
        const stories = await Promise.all(storyPromises);
        
        hnPostsContainer.innerHTML = stories
            .filter(story => story)
            .map(story => `
                <div class="post-item fade-in">
                    <a href="${story.url || `https://news.ycombinator.com/item?id=${story.id}`}" 
                       target="_blank" rel="noopener noreferrer">
                        ${story.title}
                        ${story.url ? '<i class="fas fa-external-link-alt"></i>' : ''}
                    </a>
                    <p>Score: ${story.score || 0} | By: ${story.by || 'Unknown'} | Comments: ${story.descendants || 0}</p>
                </div>
            `).join('');
            
        showToast('Hacker News updated', 'success', 2000);
        
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        hnPostsContainer.innerHTML = createErrorHTML('Hacker News', error.message, 'refreshHackerNews()');
        if (showToastOnError) showToast(`Hacker News error: ${error.message}`, 'error');
    }
}

// Reddit Functions
async function fetchReddit(subreddit = currentSubreddit, showToastOnError = true) {
    redditPostsContainer.innerHTML = createLoadingHTML('Loading Reddit...');
    redditTitleElement.textContent = `r/${subreddit}`;
    subredditLoadButton.disabled = true;
    subredditInputElement.disabled = true;
    subredditLoadButton.classList.add('loading');
    
    try {
        const response = await fetch(`https://www.reddit.com/r/${encodeURIComponent(subreddit)}/hot.json?limit=${REDDIT_POST_LIMIT}`);
        
        if (!response.ok) {
            if (response.status === 404) throw new Error(`Subreddit 'r/${subreddit}' not found.`);
            if (response.status === 403) throw new Error(`Access denied to 'r/${subreddit}' (private?).`);
            throw new Error(`Reddit API Error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data?.data?.children || data.data.children.length === 0) {
            throw new Error(`No posts found in r/${subreddit} or invalid data.`);
        }
        
        const posts = data.data.children.map(post => post.data);
        redditPostsContainer.innerHTML = posts.map(post => `
            <div class="post-item fade-in">
                <a href="https://reddit.com${post.permalink}" target="_blank" rel="noopener noreferrer">
                    ${post.link_flair_text ? `[${post.link_flair_text}] ` : ''}${post.title}
                    <i class="fas fa-external-link-alt"></i>
                </a>
                <p>Score: ${post.score} | Comments: ${post.num_comments} | Upvote Ratio: ${Math.round(post.upvote_ratio * 100)}%</p>
            </div>
        `).join('');
        
        currentSubreddit = subreddit;
        showToast(`r/${subreddit} updated`, 'success', 2000);
        
    } catch (error) {
        console.error('Error fetching Reddit:', error);
        redditPostsContainer.innerHTML = createErrorHTML(`r/${subreddit}`, error.message, 'refreshReddit()');
        if (showToastOnError) showToast(`Reddit error: ${error.message}`, 'error');
    } finally {
        subredditLoadButton.disabled = false;
        subredditInputElement.disabled = false;
        subredditLoadButton.classList.remove('loading');
    }
}

// Refresh Functions
function refreshHackerNews() {
    hnRefreshBtn.classList.add('loading');
    fetchHackerNews().finally(() => {
        hnRefreshBtn.classList.remove('loading');
    });
}

function refreshReddit() {
    redditRefreshBtn.classList.add('loading');
    fetchReddit(currentSubreddit).finally(() => {
        redditRefreshBtn.classList.remove('loading');
    });
}

function refreshWeather() {
    weatherRefreshBtn.classList.add('loading');
    fetchWeather(currentLocation.lat, currentLocation.lon).finally(() => {
        weatherRefreshBtn.classList.remove('loading');
    });
}

function clearNotes() {
    if (confirm('Are you sure you want to clear all notes?')) {
        noteElement.value = '';
        localStorage.removeItem('devDashboardNote');
        showToast('Notes cleared', 'success', 2000);
    }
}

// Event Handlers
function handleSubredditLoad() {
    const subreddit = subredditInputElement.value.trim().replace(/^r\//i, '');
    if (subreddit) {
        fetchReddit(subreddit);
    } else {
        subredditInputElement.focus();
        showToast('Please enter a subreddit name', 'warning', 3000);
    }
}

// Keyboard Shortcuts
function handleKeyboardShortcuts(event) {
    // Only trigger if not typing in an input
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;
    
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'r':
                event.preventDefault();
                refreshHackerNews();
                refreshReddit();
                refreshWeather();
                showToast('All sections refreshed', 'info', 2000);
                break;
            case 't':
                event.preventDefault();
                themeToggleButton.click();
                break;
            case '/':
                event.preventDefault();
                subredditInputElement.focus();
                break;
            case "w":\n                event.preventDefault();\n                cityInputElement.focus();\n                break;
        }
    }
}

// Geolocation
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                fetchWeather(position.coords.latitude, position.coords.longitude, false);
            },
            (error) => {
                console.warn("Geolocation failed:", error.message);
                fetchWeather(currentLocation.lat, currentLocation.lon, false);
            }
        );
    } else {
        console.warn("Geolocation not supported");
        fetchWeather(currentLocation.lat, currentLocation.lon, false);
    }
}

// Auto-refresh functionality
function setupAutoRefresh() {
    // Refresh Hacker News every 10 minutes
    refreshIntervals.hackerNews = setInterval(refreshHackerNews, 10 * 60 * 1000);
    
    // Refresh weather every 30 minutes
    refreshIntervals.weather = setInterval(refreshWeather, 30 * 60 * 1000);
}

// Initialization
function init() {
    // Initialize background animation
    initBackgroundAnimation();
    
    // Start time updates
    setInterval(updateTimeDate, 1000);
    updateTimeDate();
    
    // Load saved notes
    const savedNote = localStorage.getItem('devDashboardNote');
    if (savedNote) {
        noteElement.value = savedNote;
    }
    
    // Load saved theme
    const currentTheme = localStorage.getItem('devDashboardTheme');
    if (currentTheme === 'light') {
        bodyElement.classList.add('light-mode');
    }
    
    // Setup event listeners
    themeToggleButton.addEventListener('click', () => {
        bodyElement.classList.toggle('light-mode');
        const theme = bodyElement.classList.contains('light-mode') ? 'light' : 'dark';
        localStorage.setItem('devDashboardTheme', theme);
        showToast(`Switched to ${theme} mode`, 'info', 2000);
    });
    
    // Refresh button listeners
    hnRefreshBtn.addEventListener('click', refreshHackerNews);
    redditRefreshBtn.addEventListener('click', refreshReddit);
    weatherRefreshBtn.addEventListener('click', refreshWeather);
    notesRefreshBtn.addEventListener('click', clearNotes);
    
    // Reddit input listeners
    subredditLoadButton.addEventListener('click', handleSubredditLoad);
    subredditInputElement.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSubredditLoad();
        }
    });

    // City search listeners
    citySearchButton.addEventListener("click", () => {
        const cityName = cityInputElement.value.trim();
        if (cityName) {
            fetchWeatherByCity(cityName);
        } else {
            cityInputElement.focus();
            showToast("Please enter a city name", "warning", 3000);
        }
    });
    
    cityInputElement.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            const cityName = cityInputElement.value.trim();
            if (cityName) {
                fetchWeatherByCity(cityName);
            } else {
                showToast("Please enter a city name", "warning", 3000);
            }
        }
    });
    
    // Notes auto-save with debouncing
    const debouncedSaveNotes = debounce(() => {
        localStorage.setItem('devDashboardNote', noteElement.value);
    }, 500);
    
    noteElement.addEventListener('input', debouncedSaveNotes);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
    
    // Initial data fetch
    fetchHackerNews(false);
    fetchReddit(DEFAULT_SUBREDDIT, false);
    getCurrentLocation();
    
    // Setup auto-refresh
    setupAutoRefresh();
    
    // Show welcome message
    setTimeout(() => {
        showToast('Welcome to Gateway Dashboard! Press Ctrl+R to refresh all, Ctrl+T to toggle theme, Ctrl+/ to focus Reddit search, Ctrl+W to focus city search.', 'info', 8000);
    }, 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    Object.values(refreshIntervals).forEach(interval => clearInterval(interval));
});

// Start the application
document.addEventListener('DOMContentLoaded', init);
