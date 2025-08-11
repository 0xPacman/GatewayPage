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
// menuClock removed with top bar

// State Management
let currentLocation = { lat: 32.23, lon: -7.93 }; // Default: Ben Guerir coords
let wallpaperInterval;
let notificationInterval;
let hackerNewsStories = [];
let currentStoryIndex = 0;
let allNotifications = []; // Store all notification cards
let visibleStartIndex = 0; // Track which cards are currently visible
let showSeconds = false; // Track whether to show seconds
let lastTime = ''; // Track last time to detect changes

// Sites for Start Menu (popular + useful)
const POPULAR_SITES = [
    { title: 'Google', url: 'https://www.google.com', icon: 'https://www.google.com/favicon.ico' },
    { title: 'YouTube', url: 'https://www.youtube.com', icon: 'https://www.youtube.com/s/desktop/1c8e08d0/img/favicon_144x144.png' },
    { title: 'Twitter', url: 'https://twitter.com', icon: 'https://abs.twimg.com/favicons/twitter.3.ico' },
    { title: 'Reddit', url: 'https://www.reddit.com', icon: 'https://www.redditstatic.com/desktop2x/img/favicon/favicon-32x32.png' },
    { title: 'GitHub', url: 'https://github.com', icon: 'https://github.githubassets.com/favicons/favicon.png' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', icon: 'https://cdn.sstatic.net/Sites/stackoverflow/Img/favicon.ico' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', icon: 'https://news.ycombinator.com/favicon.ico' },
    { title: 'Wikipedia', url: 'https://wikipedia.org', icon: 'https://www.wikipedia.org/static/favicon/wikipedia.ico' },
    { title: 'Product Hunt', url: 'https://www.producthunt.com', icon: 'https://ph-files.imgix.net/production/ph-assets/favicon.png' },
    { title: 'Zoom Earth', url: 'https://zoom.earth', icon: 'https://zoom.earth/wp-content/uploads/2023/04/cropped-zoom-earth-192x192.png' },
    { title: 'Gmail', url: 'https://mail.google.com', icon: 'https://ssl.gstatic.com/ui/v1/icons/mail/favicon.ico' },
    { title: 'Drive', url: 'https://drive.google.com', icon: 'https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png' },
    { title: 'LinkedIn', url: 'https://www.linkedin.com', icon: 'https://static.licdn.com/scds/common/u/images/logos/favicons/v1/favicon.ico' },
    { title: 'Facebook', url: 'https://www.facebook.com', icon: 'https://static.xx.fbcdn.net/rsrc.php/yD/r/d4ZIVX-5C-b.ico' },
    { title: 'Instagram', url: 'https://www.instagram.com', icon: 'https://www.instagram.com/static/images/ico/favicon-192.png/68d99ba29cc8.png' },
    { title: 'Netflix', url: 'https://www.netflix.com', icon: 'https://assets.nflxext.com/us/ffe/siteui/common/icons/nficon2016.ico' },
    { title: 'Amazon', url: 'https://www.amazon.com', icon: 'https://www.amazon.com/favicon.ico' },
    { title: 'Twitch', url: 'https://www.twitch.tv', icon: 'https://static.twitchcdn.net/assets/favicon-32-e29e246c157142c94346.png' },
    { title: 'Discord', url: 'https://discord.com', icon: 'https://discord.com/assets/847541504914fd33810e70a0ea73177e.ico' },
    { title: 'OpenAI', url: 'https://openai.com', icon: 'https://openai.com/favicon.ico' },
    { title: 'BBC', url: 'https://www.bbc.com', icon: 'https://static.files.bbci.co.uk/core/website/assets/static/favicon/favicon-32x32.png' },
    { title: 'NYTimes', url: 'https://www.nytimes.com', icon: 'https://www.nytimes.com/vi-assets/static-assets/favicon.ico' },
    { title: 'The Verge', url: 'https://www.theverge.com', icon: 'https://www.theverge.com/favicon.ico' },
    { title: 'Bloomberg', url: 'https://www.bloomberg.com', icon: 'https://www.bloomberg.com/favicon.ico' },
    { title: 'Dev.to', url: 'https://dev.to', icon: 'https://practicaldev-herokuapp-com.freetls.fastly.net/assets/devlogo-pwa-192.png' },

    // Additions
    { title: 'DuckDuckGo', url: 'https://duckduckgo.com', icon: 'https://duckduckgo.com/favicon.ico' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', icon: 'https://developer.mozilla.org/favicon-48x48.cbbd161b.png' },
    { title: 'GitLab', url: 'https://gitlab.com', icon: 'https://about.gitlab.com/ico/favicon.ico' },
    { title: 'CodePen', url: 'https://codepen.io', icon: 'https://codepen.io/favicon.ico' },
    { title: 'JSFiddle', url: 'https://jsfiddle.net', icon: 'https://jsfiddle.net/favicon.ico' },
    { title: 'npm', url: 'https://www.npmjs.com', icon: 'https://www.npmjs.com/favicon.ico' },
    { title: 'Node.js', url: 'https://nodejs.org', icon: 'https://nodejs.org/static/images/favicons/favicon-32x32.png' },
    { title: 'React', url: 'https://react.dev', icon: 'https://react.dev/favicon.ico' },
    { title: 'Vue', url: 'https://vuejs.org', icon: 'https://vuejs.org/images/icons/favicon-32x32.png' },
    { title: 'Angular', url: 'https://angular.io', icon: 'https://angular.io/assets/images/favicons/favicon-32x32.png' },
    { title: 'TypeScript', url: 'https://www.typescriptlang.org', icon: 'https://www.typescriptlang.org/favicon-32x32.png' },
    { title: 'Tailwind CSS', url: 'https://tailwindcss.com', icon: 'https://tailwindcss.com/favicons/favicon-32x32.png' },
    { title: 'Vite', url: 'https://vitejs.dev', icon: 'https://vitejs.dev/logo.svg' },
    { title: 'Webpack', url: 'https://webpack.js.org', icon: 'https://webpack.js.org/favicon.ico' },

    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', icon: 'https://www.freecodecamp.org/favicon-32x32.png' },
    { title: 'Coursera', url: 'https://www.coursera.org', icon: 'https://www.coursera.org/favicon.ico' },
    { title: 'Khan Academy', url: 'https://www.khanacademy.org', icon: 'https://www.khanacademy.org/favicon.ico' },
    { title: 'Udemy', url: 'https://www.udemy.com', icon: 'https://www.udemy.com/staticx/udemy/images/v7/favicon-32x32.png' },

    { title: 'Slack', url: 'https://slack.com', icon: 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png' },
    { title: 'Notion', url: 'https://www.notion.so', icon: 'https://www.notion.so/images/favicon.ico' },
    { title: 'Trello', url: 'https://trello.com', icon: 'https://trello.com/favicon.ico' },
    { title: 'Asana', url: 'https://asana.com', icon: 'https://asana.com/favicon-32x32.png' },
    { title: 'Todoist', url: 'https://todoist.com', icon: 'https://todoist.com/static/favicon/favicon-32x32.png' },

    { title: 'Google Maps', url: 'https://maps.google.com' },
    { title: 'Google Calendar', url: 'https://calendar.google.com', icon: 'https://calendar.google.com/googlecalendar/images/favicons_2020q4/calendar_31_32.png' },
    { title: 'Google Photos', url: 'https://photos.google.com' },

    { title: 'Spotify', url: 'https://open.spotify.com', icon: 'https://open.spotify.com/favicon.ico' },
    { title: 'Apple', url: 'https://www.apple.com', icon: 'https://www.apple.com/favicon.ico' },
    { title: 'Microsoft', url: 'https://www.microsoft.com', icon: 'https://www.microsoft.com/favicon.ico' },
    { title: 'Outlook', url: 'https://outlook.office.com', icon: 'https://outlook.office.com/favicon.ico' },
    { title: 'OneDrive', url: 'https://onedrive.live.com', icon: 'https://onedrive.live.com/favicon.ico' },
    { title: 'Office', url: 'https://www.office.com', icon: 'https://www.office.com/favicon.ico' },

    { title: 'AWS Console', url: 'https://console.aws.amazon.com', icon: 'https://a0.awsstatic.com/libra-css/images/site/fav/favicon.ico' },
    { title: 'Azure Portal', url: 'https://portal.azure.com', icon: 'https://portal.azure.com/favicon.ico' },
    { title: 'Google Cloud Console', url: 'https://console.cloud.google.com', icon: 'https://cloud.google.com/_static/cloud/images/favicons/onecloud/favicon.ico' },

    { title: 'Ars Technica', url: 'https://arstechnica.com', icon: 'https://cdn.arstechnica.net/wp-content/themes/ars/assets/img/favicons/favicon-32x32.png' },
    { title: 'TechCrunch', url: 'https://techcrunch.com', icon: 'https://techcrunch.com/favicon.ico' },
    { title: 'Wired', url: 'https://www.wired.com', icon: 'https://www.wired.com/favicon.ico' },
    { title: 'The Guardian', url: 'https://www.theguardian.com', icon: 'https://www.theguardian.com/favicon.ico' },
    { title: 'Reuters', url: 'https://www.reuters.com', icon: 'https://www.reuters.com/pf/resources/images/reuters/favicon-32x32.png' },
    { title: 'AP News', url: 'https://apnews.com', icon: 'https://apnews.com/favicon.ico' },

    { title: 'Yahoo Finance', url: 'https://finance.yahoo.com', icon: 'https://finance.yahoo.com/favicon.ico' },
    { title: 'CoinMarketCap', url: 'https://coinmarketcap.com', icon: 'https://s2.coinmarketcap.com/static/cloud/img/coinmarketcap_32x32.png' },
    { title: 'TradingView', url: 'https://www.tradingview.com', icon: 'https://www.tradingview.com/favicon.ico' },

    { title: 'Medium', url: 'https://medium.com', icon: 'https://medium.com/favicon.ico' },
    { title: 'Lobsters', url: 'https://lobste.rs', icon: 'https://lobste.rs/favicon.ico' },
    { title: 'Stack Exchange', url: 'https://stackexchange.com', icon: 'https://stackexchange.com/favicon.ico' },

    { title: 'Speedtest', url: 'https://www.speedtest.net', icon: 'https://www.speedtest.net/favicon.ico' },
    { title: 'WhatsApp Web', url: 'https://web.whatsapp.com', icon: 'https://web.whatsapp.com/img/favicon/1x/favicon.png' },
    { title: 'Telegram Web', url: 'https://web.telegram.org', icon: 'https://web.telegram.org/favicon.ico' },

    { title: 'eBay', url: 'https://www.ebay.com', icon: 'https://www.ebay.com/favicon.ico' },
    { title: 'AliExpress', url: 'https://www.aliexpress.com', icon: 'https://www.aliexpress.com/favicon.ico' },

    { title: 'Pinterest', url: 'https://www.pinterest.com', icon: 'https://www.pinterest.com/favicon.ico' },
    { title: 'Dribbble', url: 'https://dribbble.com', icon: 'https://dribbble.com/favicon.ico' },
    { title: 'Behance', url: 'https://www.behance.net', icon: 'https://www.behance.net/favicon.ico' },

    { title: 'IMDb', url: 'https://www.imdb.com', icon: 'https://m.media-amazon.com/images/G/01/imdb/images/mobile/favicon_32-2161679182._CB482747980_.png' },
    { title: 'Windy', url: 'https://www.windy.com', icon: 'https://www.windy.com/img/windy-32.png' },
    { title: 'OpenStreetMap', url: 'https://www.openstreetmap.org', icon: 'https://www.openstreetmap.org/favicon.ico' }
];

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
    const timeOptions = showSeconds 
        ? { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }
        : { hour: '2-digit', minute: '2-digit', hour12: false };
    
    const newTime = now.toLocaleTimeString('en-US', timeOptions);
    
    // Check if this is the first load
    if (lastTime === '') {
        // First load - just set the time without animation
        setTimeWithoutAnimation(newTime);
    } else if (newTime !== lastTime) {
        // Time changed - animate the difference
        animateTimeChange(lastTime, newTime);
    }
    
    lastTime = newTime;
    
    dateElement.textContent = now.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
    });

    // Mirror simplified time to menu bar clock
    // menuClock removed
}

function setTimeWithoutAnimation(timeString) {
    timeElement.innerHTML = '';
    for (let i = 0; i < timeString.length; i++) {
        const char = timeString[i];
        if (char === ':') {
            const separator = document.createElement('span');
            separator.className = 'time-separator';
            separator.textContent = ':';
            timeElement.appendChild(separator);
        } else {
            const digitContainer = document.createElement('span');
            digitContainer.className = 'time-digit';
            digitContainer.textContent = char;
            timeElement.appendChild(digitContainer);
        }
    }
}

function animateTimeChange(oldTime, newTime) {
    const digitContainers = timeElement.querySelectorAll('.time-digit');
    let containerIndex = 0;
    
    for (let i = 0; i < newTime.length; i++) {
        const char = newTime[i];
        
        if (char !== ':') {
            const oldChar = oldTime[i] || '';
            
            if (char !== oldChar && digitContainers[containerIndex]) {
                // Create old digit element for slide-down animation
                const oldDigit = document.createElement('span');
                oldDigit.className = 'digit-old';
                oldDigit.textContent = oldChar;
                
                // Create new digit element for slide-up animation
                const newDigit = document.createElement('span');
                newDigit.className = 'digit-new';
                newDigit.textContent = char;
                
                // Clear container and add both digits
                const container = digitContainers[containerIndex];
                container.innerHTML = '';
                container.appendChild(oldDigit);
                container.appendChild(newDigit);
                
                // Clean up after animation
                setTimeout(() => {
                    container.innerHTML = char;
                }, 600);
            }
            containerIndex++;
        }
    }
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
    const skeleton = document.getElementById('hn-skeleton');
    const timeout = (ms) => new Promise((_, reject) => setTimeout(() => reject(new Error('Request timeout')), ms));
    try {
        const idsResponse = await Promise.race([
            fetch('https://hacker-news.firebaseio.com/v0/topstories.json'),
            timeout(8000)
        ]);
        if (!idsResponse.ok) throw new Error(`HN API Error: ${idsResponse.status}`);
        const ids = await idsResponse.json();
        const topIds = ids.slice(0, HACKERNEWS_STORIES_COUNT * 3); // fetch extra for filtering
        const storyPromises = topIds.map(id => Promise.race([
            fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(res => res.json()),
            timeout(6000)
        ]).catch(() => null));
        const stories = await Promise.all(storyPromises);
        hackerNewsStories = stories.filter(story => story && story.title && story.url).slice(0, HACKERNEWS_STORIES_COUNT);

        // Fallback curated sample if API returns nothing
        if (hackerNewsStories.length === 0) {
            hackerNewsStories = [
                { title: 'Hacker News temporarily unavailable', url: 'https://news.ycombinator.com', score: 0, descendants: 0 },
                { title: 'Retry later for fresh stories', url: 'https://news.ycombinator.com/newest', score: 0, descendants: 0 }
            ];
        }

        if (skeleton) skeleton.remove();
        currentStoryIndex = 0;
        cycleNotification();
        if (notificationInterval) clearInterval(notificationInterval);
        notificationInterval = setInterval(cycleNotification, NOTIFICATION_CYCLE_INTERVAL);
    } catch (error) {
        console.error('Error fetching Hacker News:', error);
        if (skeleton) skeleton.remove();
        notificationsContainer.innerHTML = createErrorHTML('Hacker News', error.message || 'Unknown error');
        showToast('Hacker News feed unavailable', 'warning');
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
        card.style.top = `${i * 8}px`; // Increased spacing between cards
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
            card.style.transform = 'translateY(12px) scale(0.98)';
            card.style.opacity = '0.6';
            card.style.filter = 'blur(1px)';
        } else {
            card.classList.add('older');
            card.style.transform = 'translateY(24px) scale(0.96)';
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
    
    // Add click event to time to toggle seconds display
    timeElement.addEventListener('click', () => {
        showSeconds = !showSeconds;
        lastTime = ''; // Force animation on next update
        updateTimeDate(); // Update immediately
    });
    
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

    // Taskbar handlers
    const btnTheme = document.getElementById('btnTheme');
    const btnStart = document.getElementById('btnStart');
    const btnRefresh = document.getElementById('btnRefresh');
    const startMenu = document.getElementById('startMenu');
    const overlay = document.getElementById('overlay');
    const siteGrid = document.getElementById('siteGrid');
    const siteSearch = document.getElementById('siteSearch');
    const prevPageBtn = document.getElementById('prevPage');
    const nextPageBtn = document.getElementById('nextPage');
    const pageDots = document.getElementById('pageDots');

    const toggleTheme = () => document.body.classList.toggle('alt-theme');
    const doRefresh = () => location.reload();
    window.toggleTheme = toggleTheme;
    window.doRefresh = doRefresh;

    const openStart = () => {
        startMenu.hidden = false; overlay.hidden = false;
        requestAnimationFrame(() => { startMenu.classList.add('open'); btnStart.setAttribute('aria-expanded', 'true'); siteSearch?.focus(); });
    };
    const closeStart = () => {
        startMenu.classList.remove('open'); btnStart.setAttribute('aria-expanded', 'false');
        setTimeout(() => { startMenu.hidden = true; overlay.hidden = true; }, 200);
    };
    const toggleStart = () => startMenu.hidden ? openStart() : closeStart();
    window.toggleStartMenu = toggleStart;
    if (startMenu && overlay) {
        overlay.addEventListener('click', closeStart);
        document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !startMenu.hidden) closeStart(); });
    }

    // Populate sites
    if (siteGrid) {
        const makeCard = (site) => {
            const a = document.createElement('a');
            a.className = 'site-card';
            a.href = site.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
                        const iconUrl = site.icon || `https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64`;
                        a.innerHTML = `
                            <span class="site-icon"><img src="${iconUrl}" alt="${site.title}" onerror="this.src='https://www.google.com/s2/favicons?domain=${new URL(site.url).hostname}&sz=64'"/></span>
                            <span class="site-title">${site.title}</span>
                        `;
            return a;
        };
        let filtered = [...POPULAR_SITES];
        let currentPage = 0;

        const getPerPage = () => {
            // Mirror CSS grid: 4 cols desktop, 3 on small
            const cols = window.matchMedia('(max-width: 520px)').matches ? 3 : 4;
            const rows = 3; // fixed rows, no scroll
            return cols * rows; // 12 desktop, 9 mobile
        };

        const updateDots = (pages) => {
            pageDots.innerHTML = '';
            for (let i = 0; i < pages; i++) {
                const dot = document.createElement('span');
                dot.className = 'page-dot' + (i === currentPage ? ' active' : '');
                dot.setAttribute('role', 'tab');
                dot.setAttribute('aria-selected', i === currentPage ? 'true' : 'false');
                dot.addEventListener('click', () => { currentPage = i; renderPage(); });
                pageDots.appendChild(dot);
            }
        };

        const renderPage = () => {
            const perPage = getPerPage();
            const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
            currentPage = Math.max(0, Math.min(currentPage, totalPages - 1));
            const start = currentPage * perPage;
            const slice = filtered.slice(start, start + perPage);
            siteGrid.innerHTML = '';
            slice.forEach(s => siteGrid.appendChild(makeCard(s)));
            updateDots(totalPages);
            // Update nav state
            if (prevPageBtn) prevPageBtn.disabled = currentPage === 0;
            if (nextPageBtn) nextPageBtn.disabled = currentPage >= totalPages - 1;
        };

        // Initial render
        renderPage();

        // Search
        if (siteSearch) {
            siteSearch.addEventListener('input', () => {
                const q = siteSearch.value.trim().toLowerCase();
                filtered = !q ? [...POPULAR_SITES] : POPULAR_SITES.filter(s => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
                currentPage = 0;
                renderPage();
            });
        }

        // Nav buttons
        if (prevPageBtn) prevPageBtn.addEventListener('click', () => { currentPage = Math.max(0, currentPage - 1); renderPage(); });
        if (nextPageBtn) nextPageBtn.addEventListener('click', () => { currentPage = currentPage + 1; renderPage(); });

        // Recompute on resize for responsive cols
        window.addEventListener('resize', () => { renderPage(); });

        if (siteSearch) {
            siteSearch.addEventListener('input', () => {
                const q = siteSearch.value.trim().toLowerCase();
                if (!q) return render(POPULAR_SITES);
                const filtered = POPULAR_SITES.filter(s => s.title.toLowerCase().includes(q) || s.url.toLowerCase().includes(q));
                render(filtered);
            });
        }
    }

    // Make weather widget open Zoom Earth on click / keyboard
    if (weatherElement) {
        weatherElement.setAttribute('role', 'button');
        weatherElement.setAttribute('tabindex', '0');
        weatherElement.setAttribute('title', 'Open live earth view (Zoom Earth)');
        const openZoomEarth = () => window.open('https://zoom.earth', '_blank', 'noopener');
        weatherElement.addEventListener('click', openZoomEarth);
        weatherElement.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openZoomEarth(); }
        });
    }
}

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
    // if (wallpaperInterval) clearInterval(wallpaperInterval);
    if (notificationInterval) clearInterval(notificationInterval);
});

// Start the application
document.addEventListener('DOMContentLoaded', init);

