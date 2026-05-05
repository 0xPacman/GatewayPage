const WEATHER_API_KEY = 'bd6d715c01e7cdbd5cd95b39f2b6c64d';
const DEFAULT_LOCATION = { lat: 32.23, lon: -7.93 };
const NEWS_SOURCES = ['All', 'Tech', 'Design', 'Science', 'Dev'];
const CATEGORIES = ['All', 'AI', 'Dev', 'Design', 'Productivity', 'Learn', 'Media', 'Finance', 'Utilities', 'News'];

const sites = [
    { title: 'ChatGPT', url: 'https://chat.openai.com', category: 'AI', tag: 'AI workspace' },
    { title: 'Claude', url: 'https://claude.ai', category: 'AI', tag: 'AI assistant' },
    { title: 'Perplexity', url: 'https://www.perplexity.ai', category: 'AI', tag: 'Answer engine' },
    { title: 'Hugging Face', url: 'https://huggingface.co', category: 'AI', tag: 'Models' },
    { title: 'GitHub', url: 'https://github.com', category: 'Dev', tag: 'Code' },
    { title: 'Stack Overflow', url: 'https://stackoverflow.com', category: 'Dev', tag: 'Answers' },
    { title: 'MDN Web Docs', url: 'https://developer.mozilla.org', category: 'Dev', tag: 'Reference' },
    { title: 'Vercel', url: 'https://vercel.com', category: 'Dev', tag: 'Deploy' },
    { title: 'Figma', url: 'https://www.figma.com/community', category: 'Design', tag: 'Community' },
    { title: 'Dribbble', url: 'https://dribbble.com', category: 'Design', tag: 'Inspiration' },
    { title: 'Behance', url: 'https://www.behance.net', category: 'Design', tag: 'Portfolios' },
    { title: 'Mobbin', url: 'https://mobbin.com', category: 'Design', tag: 'Patterns' },
    { title: 'Notion', url: 'https://www.notion.so', category: 'Productivity', tag: 'Notes' },
    { title: 'Linear', url: 'https://linear.app', category: 'Productivity', tag: 'Issues' },
    { title: 'Google Drive', url: 'https://drive.google.com', category: 'Productivity', tag: 'Files' },
    { title: 'Gmail', url: 'https://mail.google.com', category: 'Productivity', tag: 'Mail' },
    { title: 'Coursera', url: 'https://www.coursera.org', category: 'Learn', tag: 'Courses' },
    { title: 'Khan Academy', url: 'https://www.khanacademy.org', category: 'Learn', tag: 'Study' },
    { title: 'freeCodeCamp', url: 'https://www.freecodecamp.org', category: 'Learn', tag: 'Practice' },
    { title: 'YouTube', url: 'https://www.youtube.com', category: 'Media', tag: 'Video' },
    { title: 'Spotify', url: 'https://open.spotify.com', category: 'Media', tag: 'Music' },
    { title: 'Netflix', url: 'https://www.netflix.com', category: 'Media', tag: 'Streaming' },
    { title: 'TradingView', url: 'https://www.tradingview.com', category: 'Finance', tag: 'Markets' },
    { title: 'Yahoo Finance', url: 'https://finance.yahoo.com', category: 'Finance', tag: 'Finance' },
    { title: 'CoinMarketCap', url: 'https://coinmarketcap.com', category: 'Finance', tag: 'Crypto' },
    { title: 'Google Maps', url: 'https://maps.google.com', category: 'Utilities', tag: 'Maps' },
    { title: 'Speedtest', url: 'https://www.speedtest.net', category: 'Utilities', tag: 'Network' },
    { title: 'Zoom Earth', url: 'https://zoom.earth', category: 'Utilities', tag: 'Weather' },
    { title: 'Hacker News', url: 'https://news.ycombinator.com', category: 'News', tag: 'Tech' },
    { title: 'The Verge', url: 'https://www.theverge.com', category: 'News', tag: 'Tech news' },
    { title: 'Reuters', url: 'https://www.reuters.com', category: 'News', tag: 'World' },
    { title: 'TechCrunch', url: 'https://techcrunch.com', category: 'News', tag: 'Startups' }
].map((site) => ({
    ...site,
    id: slug(site.title),
    host: new URL(site.url).hostname.replace(/^www\./, '')
}));

const quickActionTitles = ['ChatGPT', 'GitHub', 'Figma', 'YouTube'];
const designFeed = [
    { title: 'Figma Community: dashboard templates and UI kits', url: 'https://www.figma.com/templates/dashboard-designs/', source: 'Design', meta: 'Figma Community' },
    { title: 'Dribbble: command palette and launcher inspiration', url: 'https://dribbble.com/search/command', source: 'Design', meta: 'Dribbble' },
    { title: 'Behance: dashboard and product interface inspiration', url: 'https://www.behance.net/search/projects/dashboard%20ui', source: 'Design', meta: 'Behance' },
    { title: 'Mobbin: real app UI patterns', url: 'https://mobbin.com/browse/web/apps', source: 'Design', meta: 'Mobbin' }
];
let activeView = 'dashboard';
let activeCategory = 'All';
let activeNewsSource = 'All';
let showSeconds = false;
let allNews = [];
let favorites = loadJson('gateway:favorites', ['chatgpt', 'github', 'figma', 'notion', 'youtube', 'hacker-news']);
let recents = loadJson('gateway:recents', []);

const elements = {
    greeting: document.getElementById('greeting'),
    dateLabel: document.getElementById('dateLabel'),
    systemStatus: document.getElementById('systemStatus'),
    time: document.getElementById('time'),
    timeButton: document.getElementById('timeButton'),
    weather: document.getElementById('weather'),
    quickActions: document.getElementById('quickActions'),
    favoriteGrid: document.getElementById('favoriteGrid'),
    recentList: document.getElementById('recentList'),
    siteSearch: document.getElementById('siteSearch'),
    categoryTabs: document.getElementById('categoryTabs'),
    siteGrid: document.getElementById('siteGrid'),
    newsTabs: document.getElementById('newsTabs'),
    newsList: document.getElementById('newsList'),
    refreshNews: document.getElementById('refreshNews'),
    commandPalette: document.getElementById('commandPalette'),
    commandInput: document.getElementById('commandInput'),
    commandResults: document.getElementById('commandResults'),
    openCommand: document.getElementById('openCommand'),
    themeToggle: document.getElementById('themeToggle'),
    toastContainer: document.getElementById('toastContainer')
};

function slug(value) {
    return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function loadJson(key, fallback) {
    try {
        return JSON.parse(localStorage.getItem(key)) || fallback;
    } catch {
        return fallback;
    }
}

function saveJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}

function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    }[char]));
}

function getIconUrl(site) {
    return `https://www.google.com/s2/favicons?domain=${site.host}&sz=64`;
}

function openSite(site) {
    recents = [site.id, ...recents.filter((id) => id !== site.id)].slice(0, 6);
    saveJson('gateway:recents', recents);
    renderRecents();
    window.open(site.url, '_blank', 'noopener');
}

function toggleFavorite(siteId) {
    favorites = favorites.includes(siteId)
        ? favorites.filter((id) => id !== siteId)
        : [siteId, ...favorites].slice(0, 12);
    saveJson('gateway:favorites', favorites);
    renderSites();
    renderFavorites();
}

function makeSiteCard(site, compact = false) {
    const card = document.createElement('article');
    card.className = 'site-card';
    card.innerHTML = `
        <div class="site-top">
            <button class="site-icon" type="button" aria-label="Open ${escapeHtml(site.title)}">
                <img src="${getIconUrl(site)}" alt="" loading="lazy">
            </button>
            <button class="pin-btn ${favorites.includes(site.id) ? 'is-pinned' : ''}" type="button" aria-label="Pin ${escapeHtml(site.title)}">
                <i class="fas fa-star"></i>
            </button>
        </div>
        <div>
            <strong>${escapeHtml(site.title)}</strong>
            <span>${escapeHtml(compact ? site.host : `${site.category} - ${site.tag}`)}</span>
        </div>
    `;
    card.querySelector('.site-icon').addEventListener('click', () => openSite(site));
    card.querySelector('.pin-btn').addEventListener('click', () => toggleFavorite(site.id));
    card.addEventListener('dblclick', () => openSite(site));
    return card;
}

function renderQuickActions() {
    elements.quickActions.innerHTML = '';
    quickActionTitles
        .map((title) => sites.find((site) => site.title === title))
        .filter(Boolean)
        .forEach((site) => {
            const link = document.createElement('a');
            link.className = 'quick-action';
            link.href = site.url;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            link.innerHTML = `
                <span class="site-icon"><img src="${getIconUrl(site)}" alt=""></span>
                <span><strong>${escapeHtml(site.title)}</strong><span>${escapeHtml(site.tag)}</span></span>
                <i class="fas fa-arrow-up-right-from-square"></i>
            `;
            link.addEventListener('click', () => {
                recents = [site.id, ...recents.filter((id) => id !== site.id)].slice(0, 6);
                saveJson('gateway:recents', recents);
            });
            elements.quickActions.appendChild(link);
        });
}

function renderFavorites() {
    elements.favoriteGrid.innerHTML = '';
    const pinned = favorites.map((id) => sites.find((site) => site.id === id)).filter(Boolean).slice(0, 6);
    const list = pinned.length ? pinned : sites.slice(0, 6);
    list.forEach((site) => elements.favoriteGrid.appendChild(makeSiteCard(site, true)));
}

function renderRecents() {
    elements.recentList.innerHTML = '';
    const recentSites = recents.map((id) => sites.find((site) => site.id === id)).filter(Boolean);
    if (!recentSites.length) {
        elements.recentList.innerHTML = '<p class="empty">Open a few sites and they will appear here.</p>';
        return;
    }
    recentSites.forEach((site) => {
        const item = document.createElement('button');
        item.className = 'recent-item';
        item.type = 'button';
        item.innerHTML = `
            <span class="site-icon"><img src="${getIconUrl(site)}" alt=""></span>
            <span><strong>${escapeHtml(site.title)}</strong><span>${escapeHtml(site.host)}</span></span>
            <i class="fas fa-arrow-right"></i>
        `;
        item.addEventListener('click', () => openSite(site));
        elements.recentList.appendChild(item);
    });
}

function renderCategoryTabs() {
    elements.categoryTabs.innerHTML = '';
    CATEGORIES.forEach((category) => {
        const button = document.createElement('button');
        button.className = `tab ${category === activeCategory ? 'is-active' : ''}`;
        button.type = 'button';
        button.textContent = category;
        button.addEventListener('click', () => {
            activeCategory = category;
            renderCategoryTabs();
            renderSites();
        });
        elements.categoryTabs.appendChild(button);
    });
}

function renderSites() {
    const query = elements.siteSearch.value.trim().toLowerCase();
    const filtered = sites.filter((site) => {
        const inCategory = activeCategory === 'All' || site.category === activeCategory;
        const inQuery = !query || `${site.title} ${site.host} ${site.category} ${site.tag}`.toLowerCase().includes(query);
        return inCategory && inQuery;
    });
    elements.siteGrid.innerHTML = '';
    filtered.forEach((site) => elements.siteGrid.appendChild(makeSiteCard(site)));
}

function setView(view) {
    activeView = view;
    document.querySelectorAll('[data-panel]').forEach((panel) => {
        const isNewsDock = panel.classList.contains('news-dock');
        if (view === 'dashboard') {
            panel.hidden = panel.classList.contains('launch-screen');
        } else if (view === 'launch') {
            panel.hidden = !panel.classList.contains('launch-screen') && !isNewsDock;
        } else if (view === 'news') {
            panel.hidden = !isNewsDock;
        }
    });
    document.querySelectorAll('.rail-btn[data-view]').forEach((button) => {
        button.classList.toggle('is-active', button.dataset.view === view);
    });
}

function updateTime() {
    const now = new Date();
    const hour = now.getHours();
    elements.greeting.textContent = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
    elements.time.textContent = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: showSeconds ? '2-digit' : undefined,
        hour12: false
    });
    elements.dateLabel.textContent = now.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric'
    });
}

async function fetchWeather(lat = DEFAULT_LOCATION.lat, lon = DEFAULT_LOCATION.lon) {
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`);
        if (!response.ok) throw new Error(`Weather ${response.status}`);
        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const description = data.weather?.[0]?.description || 'current weather';
        elements.weather.innerHTML = `<i class="fas fa-cloud-sun"></i><span>${temp}C, ${escapeHtml(description)} in ${escapeHtml(data.name)}</span>`;
        elements.systemStatus.textContent = 'Synced';
    } catch (error) {
        elements.weather.innerHTML = '<i class="fas fa-triangle-exclamation"></i><span>Weather unavailable</span>';
        elements.systemStatus.textContent = 'Limited';
    }
}

function requestWeather() {
    if (!navigator.geolocation) {
        fetchWeather();
        return;
    }
    navigator.geolocation.getCurrentPosition(
        (position) => fetchWeather(position.coords.latitude, position.coords.longitude),
        () => fetchWeather(),
        { timeout: 3500 }
    );
}

async function fetchNews() {
    elements.newsList.innerHTML = skeletonNews();
    const requests = [
        fetch('https://hn.algolia.com/api/v1/search_by_date?tags=front_page').then((res) => res.json()).then((data) =>
            data.hits.slice(0, 12).map((item) => ({
                title: item.title,
                url: item.url || `https://news.ycombinator.com/item?id=${item.objectID}`,
                source: 'Tech',
                meta: `HN - ${item.points || 0} points`
            }))
        ),
        fetch('https://dev.to/api/articles?top=7&per_page=12').then((res) => res.json()).then((data) =>
            data.map((item) => ({
                title: item.title,
                url: item.url,
                source: 'Dev',
                meta: `DEV - ${item.readable_publish_date || ''}`
            }))
        ),
        fetch('https://api.spaceflightnewsapi.net/v4/articles/?limit=10').then((res) => res.json()).then((data) =>
            data.results.map((item) => ({
                title: item.title,
                url: item.url,
                source: 'Science',
                meta: item.news_site || 'Spaceflight News'
            }))
        )
    ];
    const settled = await Promise.allSettled(requests);
    allNews = [...designFeed, ...settled.flatMap((result) => result.status === 'fulfilled' ? result.value : [])];
    if (!allNews.length) {
        allNews = [
            { title: 'Hacker News', url: 'https://news.ycombinator.com', source: 'Tech', meta: 'Open source feed' },
            { title: 'Designer News', url: 'https://www.designernews.co', source: 'Design', meta: 'Design community' },
            { title: 'The Verge', url: 'https://www.theverge.com', source: 'Tech', meta: 'Technology news' }
        ];
        showToast('Live news is unavailable, showing fallback sources.');
    }
    renderNewsTabs();
    renderNews();
}

function skeletonNews() {
    return Array.from({ length: 5 }, () => '<article class="news-item"><span>Loading...</span></article>').join('');
}

function renderNewsTabs() {
    elements.newsTabs.innerHTML = '';
    NEWS_SOURCES.forEach((source) => {
        const button = document.createElement('button');
        button.className = `tab ${source === activeNewsSource ? 'is-active' : ''}`;
        button.type = 'button';
        button.textContent = source;
        button.addEventListener('click', () => {
            activeNewsSource = source;
            renderNewsTabs();
            renderNews();
        });
        elements.newsTabs.appendChild(button);
    });
}

function renderNews() {
    const visible = allNews.filter((item) => activeNewsSource === 'All' || item.source === activeNewsSource).slice(0, 18);
    elements.newsList.innerHTML = '';
    visible.forEach((item) => {
        const link = document.createElement('a');
        link.className = 'news-item';
        link.href = item.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.innerHTML = `
            <small>${escapeHtml(item.source)}</small>
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.meta)}</span>
        `;
        elements.newsList.appendChild(link);
    });
}

function openPalette() {
    elements.commandPalette.hidden = false;
    elements.commandInput.value = '';
    renderCommandResults('');
    requestAnimationFrame(() => elements.commandInput.focus());
}

function closePalette() {
    elements.commandPalette.hidden = true;
}

function renderCommandResults(query) {
    const q = query.trim().toLowerCase();
    const siteResults = sites
        .filter((site) => !q || `${site.title} ${site.host} ${site.category} ${site.tag}`.toLowerCase().includes(q))
        .slice(0, 8)
        .map((site) => ({ type: 'site', label: site.title, detail: site.host, site }));
    const newsResults = allNews
        .filter((item) => q && item.title.toLowerCase().includes(q))
        .slice(0, 4)
        .map((item) => ({ type: 'news', label: item.title, detail: item.meta, item }));
    const actions = [
        { type: 'action', label: 'Open launch library', detail: 'View all websites', run: () => setView('launch') },
        { type: 'action', label: 'Open news radar', detail: 'Scan live feeds', run: () => setView('news') },
        { type: 'action', label: 'Toggle theme', detail: 'Switch light or dark', run: toggleTheme }
    ].filter((item) => !q || item.label.toLowerCase().includes(q));
    const results = [...actions, ...siteResults, ...newsResults].slice(0, 14);
    elements.commandResults.innerHTML = '';
    results.forEach((result) => {
        const button = document.createElement('button');
        button.className = 'command-item';
        button.type = 'button';
        button.innerHTML = `
            <span class="site-icon"><i class="fas ${result.type === 'site' ? 'fa-globe' : result.type === 'news' ? 'fa-newspaper' : 'fa-bolt'}"></i></span>
            <span><strong>${escapeHtml(result.label)}</strong><span>${escapeHtml(result.detail)}</span></span>
            <mark>${escapeHtml(result.type)}</mark>
        `;
        button.addEventListener('click', () => {
            if (result.type === 'site') openSite(result.site);
            if (result.type === 'news') window.open(result.item.url, '_blank', 'noopener');
            if (result.type === 'action') result.run();
            closePalette();
        });
        elements.commandResults.appendChild(button);
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark');
    localStorage.setItem('gateway:theme', document.body.classList.contains('dark') ? 'dark' : 'light');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class="fas fa-circle-info"></i><span>${escapeHtml(message)}</span><button type="button" aria-label="Dismiss"><i class="fas fa-xmark"></i></button>`;
    toast.querySelector('button').addEventListener('click', () => toast.remove());
    elements.toastContainer.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'toastOut .24s var(--ease) forwards';
        setTimeout(() => toast.remove(), 260);
    }, 4200);
}

function bindEvents() {
    document.querySelectorAll('.rail-btn[data-view]').forEach((button) => {
        button.addEventListener('click', () => setView(button.dataset.view));
    });
    document.querySelectorAll('[data-open-view]').forEach((button) => {
        button.addEventListener('click', () => setView(button.dataset.openView));
    });
    elements.siteSearch.addEventListener('input', renderSites);
    elements.timeButton.addEventListener('click', () => {
        showSeconds = !showSeconds;
        updateTime();
    });
    elements.weather.addEventListener('click', () => window.open('https://zoom.earth', '_blank', 'noopener'));
    elements.refreshNews.addEventListener('click', fetchNews);
    elements.openCommand.addEventListener('click', openPalette);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.commandInput.addEventListener('input', () => renderCommandResults(elements.commandInput.value));
    document.querySelectorAll('[data-close-palette]').forEach((target) => target.addEventListener('click', closePalette));
    document.addEventListener('keydown', (event) => {
        const isCommand = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k';
        if (isCommand) {
            event.preventDefault();
            openPalette();
        }
        if (event.key === 'Escape' && !elements.commandPalette.hidden) closePalette();
    });
}

function init() {
    if (localStorage.getItem('gateway:theme') === 'dark') {
        document.body.classList.add('dark');
    }
    bindEvents();
    renderQuickActions();
    renderCategoryTabs();
    renderSites();
    renderFavorites();
    renderRecents();
    renderNewsTabs();
    updateTime();
    setInterval(updateTime, 1000);
    requestWeather();
    fetchNews();
    setView('dashboard');
}

document.addEventListener('DOMContentLoaded', init);
