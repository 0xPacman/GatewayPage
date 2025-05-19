// --- Configuration ---
const HACKERNEWS_STORIES_COUNT = 12; // How many HN stories to show
const REDDIT_POST_LIMIT = 15; // How many Reddit posts to show
const DEFAULT_SUBREDDIT = 'technology';

// --- DOM Elements ---
const timeElement = document.getElementById('time');
const dateElement = document.getElementById('date');
const weatherElement = document.getElementById('weather');
const themeToggleButton = document.getElementById('themeToggle');
const hnPostsContainer = document.getElementById('hn-posts');
const redditPostsContainer = document.getElementById('reddit-posts');
const redditTitleElement = document.getElementById('reddit-title');
const subredditInputElement = document.getElementById('subreddit-input');
const subredditLoadButton = document.getElementById('subreddit-button');
const noteElement = document.getElementById('note');
const bodyElement = document.body;

// --- Loading/Error Messages ---
const loadingHTML = `<p class="loading-message"><i class="fas fa-spinner"></i> Loading...</p>`;
function errorHTML(service, message) {
  return `<p class="error-message"><i class="fas fa-exclamation-triangle"></i> Error loading ${service}: ${message}</p>`;
}

// --- Canvas Background Animation ---
// ...existing code for canvas animation...

// --- Time & Date Update ---
// ...existing code for time/date update...

// --- Weather Fetch Placeholder ---
// ...existing code for weather fetch...

// --- Hacker News Fetch ---
// ...existing code for HN fetch...

// --- Reddit Fetch ---
// ...existing code for Reddit fetch...

// --- Reddit Input Handling ---
// ...existing code for Reddit input handling...

// --- Note Persistence ---
// ...existing code for note persistence...

// --- Theme Toggle & Persistence ---
// ...existing code for theme toggle...

// --- Initial Data Fetch ---
// ...existing code for initial data fetch...

// --- Animate dashboard title on click ---
document.querySelector('.dashboard-title').addEventListener('click', function() {
  this.classList.add('clicked');
  setTimeout(() => this.classList.remove('clicked'), 600);
});

// --- Animate cards on scroll into view ---
const cards = document.querySelectorAll('.card');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animationDelay = '0s';
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.2 });
cards.forEach(card => observer.observe(card));

// --- Animate posts fade-in after fetch ---
function animatePosts(container) {
  const posts = container.querySelectorAll('.post-item');
  posts.forEach((post, i) => {
    post.style.animationDelay = `${0.1 + i * 0.1}s`;
    post.classList.add('fade-in');
  });
}

// Patch fetchHackerNews and fetchReddit to call animatePosts after rendering
const origFetchHackerNews = fetchHackerNews;
fetchHackerNews = async function() {
  await origFetchHackerNews.apply(this, arguments);
  animatePosts(hnPostsContainer);
};
const origFetchReddit = fetchReddit;
fetchReddit = async function() {
  await origFetchReddit.apply(this, arguments);
  animatePosts(redditPostsContainer);
};

// --- Add floating label for note textarea ---
const note = document.getElementById('note');
if (note) {
  note.addEventListener('focus', function() {
    this.placeholder = '';
  });
  note.addEventListener('blur', function() {
    if (!this.value) this.placeholder = 'Type your note here... changes saved automatically.';
  });
}
