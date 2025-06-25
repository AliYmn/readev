import './styles.css';
import { Site, SitesData } from './types';
import { initTheme, toggleTheme } from './theme';

/**
 * Popup controller
 */
class PopupController {
  private openNewTabButton: HTMLButtonElement;
  private sitesList: HTMLDivElement;
  private themeToggleButton: HTMLButtonElement;
  private sites: Site[] = [];

  constructor() {
    // Initialize DOM elements
    this.openNewTabButton = document.getElementById('open-newtab') as HTMLButtonElement;
    this.sitesList = document.getElementById('sites-list') as HTMLDivElement;
    this.themeToggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;
    
    // Initialize event listeners
    this.initEventListeners();
    
    // Initialize theme
    initTheme();
    
    // Load sites
    this.loadSites();
  }

  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Open new tab button click
    this.openNewTabButton.addEventListener('click', () => {
      chrome.tabs.create({});
    });
    
    // Theme toggle button click
    this.themeToggleButton.addEventListener('click', () => {
      toggleTheme();
    });
  }

  /**
   * Load sites from sites.json
   */
  private async loadSites(): Promise<void> {
    try {
      const response = await fetch('sites.json');
      const data: SitesData = await response.json();
      this.sites = data.sites;
      
      // Render sites list
      this.renderSitesList();
    } catch (error) {
      console.error('Error loading sites:', error);
      this.renderError();
    }
  }

  /**
   * Render sites list in the popup
   */
  private renderSitesList(): void {
    // Clear existing content
    this.sitesList.innerHTML = '';
    
    // Add sites to list
    this.sites.forEach(site => {
      const siteElement = document.createElement('div');
      siteElement.className = 'flex items-center justify-between p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md';
      
      const siteInfo = document.createElement('div');
      
      const siteName = document.createElement('div');
      siteName.className = 'font-medium text-sm theme-text-primary';
      siteName.textContent = site.name;
      
      const siteDescription = document.createElement('div');
      siteDescription.className = 'text-xs theme-text-secondary';
      siteDescription.textContent = site.description;
      
      siteInfo.appendChild(siteName);
      siteInfo.appendChild(siteDescription);
      
      const openButton = document.createElement('button');
      openButton.className = 'text-xs text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300';
      openButton.textContent = 'Open';
      openButton.addEventListener('click', () => {
        this.openSiteInNewTab(site.url);
      });
      
      siteElement.appendChild(siteInfo);
      siteElement.appendChild(openButton);
      
      this.sitesList.appendChild(siteElement);
    });
  }

  /**
   * Render error message
   */
  private renderError(): void {
    this.sitesList.innerHTML = `
      <div class="text-sm text-red-500">
        Failed to load sites. Please try again later.
      </div>
    `;
  }

  /**
   * Open a site in a new tab
   */
  private openSiteInNewTab(url: string): void {
    chrome.tabs.create({ url });
    
    // Save as last selected site
    chrome.storage.local.set({ lastSelectedSite: url });
  }
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
