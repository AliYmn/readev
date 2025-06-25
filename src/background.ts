/**
 * Background script for Readev.news extension
 */

// Open default site when extension is installed
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    // Open default site in a new tab
    chrome.tabs.create({
      url: 'https://devurls.com/'
    });
  }
});
