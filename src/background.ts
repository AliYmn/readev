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
    // Only fetch feed if extension is enabled
    if (extensionEnabled) {
      fetchFeed(request.url)
        .then(data => sendResponse({ success: true, data }))
        .catch(error => sendResponse({ success: false, error: error.toString() }));
      return true; // Required for async sendResponse
    } else {
      sendResponse({ success: false, error: 'Extension is disabled' });
      return true;
    }
  } else if (request.action === 'updateExtensionState') {
    // Update extension state
    extensionEnabled = request.enabled;
    updateExtensionIcon(extensionEnabled);
    chrome.storage.local.set({ extensionEnabled: extensionEnabled });
    
    // If extension is disabled and we're on the newtab page, redirect to about:blank
    if (!extensionEnabled) {
      try {
        // Find all tabs with our extension's newtab page
        chrome.tabs.query({ url: chrome.runtime.getURL('newtab.html') }, (tabs) => {
          tabs.forEach(tab => {
            if (tab.id) {
              // Close and reopen as blank tab
              chrome.tabs.remove(tab.id);
              chrome.tabs.create({ url: 'about:blank' });
            }
          });
        });
      } catch (error) {
        console.error('Error updating existing tabs:', error);
      }
    }
    
    sendResponse({ success: true });
    return true;
  }
});

/**
 * Update extension icon based on enabled/disabled state
 */
function updateExtensionIcon(enabled: boolean): void {
  try {
    // Instead of trying to use different icon files, we'll just set badge text
    // to indicate disabled state
    if (chrome.action) {
      if (!enabled) {
        chrome.action.setBadgeText({ text: 'OFF' });
        chrome.action.setBadgeBackgroundColor({ color: '#888888' });
      } else {
        chrome.action.setBadgeText({ text: '' });
      }
    } else if (chrome.browserAction) {
      if (!enabled) {
        chrome.browserAction.setBadgeText({ text: 'OFF' });
        chrome.browserAction.setBadgeBackgroundColor({ color: '#888888' });
      } else {
        chrome.browserAction.setBadgeText({ text: '' });
      }
    }
  } catch (error) {
    console.error('Error updating extension icon:', error);
  }
}

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
