// content.js

/**
 * Moves the comments section to the sidebar and recommendations below the video.
 * Returns true if successful, false if required elements are not found.
 */
function swapCommentsAndRecommendations() {
  const comments = document.getElementById('comments');
  const primary = document.getElementById('primary');
  const secondary = document.getElementById('secondary');
  const player = document.getElementById('player');

  if (!comments || !primary || !secondary || !player) return false;

  // Find the recommendations node (usually ytd-watch-next-secondary-results-renderer)
  let recommendations = secondary.querySelector('ytd-watch-next-secondary-results-renderer');
  if (!recommendations) {
    // fallback: first child that's not comments
    recommendations = Array.from(secondary.children).find(child => !child.contains(comments));
  }
  if (!recommendations) return false;

  // Only move if not already swapped
  if (!primary.contains(recommendations)) {
    primary.appendChild(recommendations);
  }

  // Move comments into the sidebar (secondary)
  let commentsSidebarWrapper = secondary.querySelector('#comments-in-secondary');
  if (!commentsSidebarWrapper) {
    commentsSidebarWrapper = document.createElement('div');
    commentsSidebarWrapper.id = 'comments-in-secondary';
    commentsSidebarWrapper.style.marginTop = '24px';
    secondary.insertBefore(commentsSidebarWrapper, secondary.firstChild);
  }
  if (!commentsSidebarWrapper.contains(comments)) {
    commentsSidebarWrapper.appendChild(comments);
  }

  // Make only the comments section scrollable
  commentsSidebarWrapper.style.maxHeight = '100vh';
  commentsSidebarWrapper.style.overflowY = 'auto';

  return true;
}

/**
 * Polls for the required YouTube elements and runs the swap logic as soon as possible.
 * Polls every intervalMs for up to maxWaitMs milliseconds.
 */
function waitForElementsAndSwap(maxWaitMs = 3000, intervalMs = 200) {
  const start = Date.now();
  const trySwap = () => {
    if (swapCommentsAndRecommendations()) return;
    if (Date.now() - start < maxWaitMs) {
      setTimeout(trySwap, intervalMs);
    }
  };
  trySwap();
}

/**
 * Initializes the extension logic on page load and on YouTube SPA navigation.
 */
function onReady() {
  waitForElementsAndSwap();
  // Listen for navigation (YouTube uses SPA navigation)
  let lastUrl = location.href;
  new MutationObserver(() => {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      waitForElementsAndSwap();
    }
  }).observe(document.body, {childList: true, subtree: true});
}

// Run the extension logic as soon as the DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  onReady();
} else {
  window.addEventListener('DOMContentLoaded', onReady);
} 