// Copied from src/app.js for GitHub Pages root deployment

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
const loadingHTML = `<p class=\"loading-message\"><i class=\"fas fa-spinner\"></i> Loading...</p>`;
function errorHTML(service, message) {
  return `<p class=\"error-message\"><i class=\"fas fa-exclamation-triangle\"></i> Error loading ${service}: ${message}</p>`;
}

// ...existing code from src/app.js...
