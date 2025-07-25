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
  commentsSidebarWrapper.style.overflowY = 'auto';

  return true;
}

/**
 * Checks if all required elements are present in the DOM.
 */
function requiredElementsPresent() {
  return (
    document.getElementById('comments') &&
    document.getElementById('primary') &&
    document.getElementById('secondary') &&
    document.getElementById('player')
  );
}

/**
 * Debounce helper to avoid excessive calls to the swap logic.
 */
function debounce(fn, delay) {
  let timeout;
  return function() {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

/**
 * Sets up a robust MutationObserver on the main container to re-run the swap logic whenever the DOM changes.
 */
function setupRobustObserver() {
  const targetNode = document.getElementById('columns') || document.querySelector('ytd-app') || document.body;
  const debouncedSwap = debounce(() => {
    if (requiredElementsPresent()) {
      swapCommentsAndRecommendations();
    }
  }, 100);
  const observer = new MutationObserver(debouncedSwap);
  observer.observe(targetNode, { childList: true, subtree: true });
}

/**
 * Initializes the extension logic on page load and on YouTube SPA navigation.
 */
function onReady() {
  if (requiredElementsPresent()) {
    swapCommentsAndRecommendations();
  }
  setupRobustObserver();
}

// Run the extension logic as soon as the DOM is ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  onReady();
} else {
  window.addEventListener('DOMContentLoaded', onReady);
} 