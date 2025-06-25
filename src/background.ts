/**
 * Background script for Readev extension
 */

// Listen for installation
chrome.runtime.onInstalled.addListener((details) => {
  console.log('Readev extension installed');

  // Open default site when extension is installed
  if (details.reason === 'install') {
    // Open default site in a new tab
    chrome.tabs.create({
      url: 'https://devurls.com/'
    });
  }
});

// No tab creation override needed anymore

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchFeed') {
    fetchFeed(request.url)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.toString() }));
    return true; // Required for async sendResponse
  }
});

// No icon update function needed anymore

/**
 * Fetch RSS feed content bypassing CORS restrictions
 */
async function fetchFeed(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch feed: ${response.status} ${response.statusText}`);
    }

    return await response.text();
  } catch (error) {
    console.error('Error fetching feed:', error);
    throw error;
  }
}
