import './styles.css';
import { Site, SitesData } from './types';
import { initTheme, toggleTheme } from './theme';

/**
 * NewTab page controller
 */
class NewTabController {
  private siteButtons: HTMLDivElement;
  private moreSitesContainer: HTMLDivElement;
  private moreSitesButton: HTMLButtonElement;
  private moreSitesDropdown: HTMLDivElement;
  private moreSitesDropdownContent: HTMLDivElement;
  private logoContainer: HTMLDivElement;
  private contentFrame: HTMLIFrameElement;
  private currentSiteName: HTMLSpanElement;
  private siteDescription: HTMLSpanElement;
  private refreshButton: HTMLButtonElement;
  private loadingOverlay: HTMLDivElement;
  private themeToggleButton: HTMLButtonElement;
  private sites: Site[] = [];
  private defaultSiteUrl: string = 'https://devurls.com/';
  private maxVisibleSites: number = 4; // Maximum number of sites to show as buttons

  constructor() {
    // Initialize DOM elements
    this.siteButtons = document.getElementById('site-buttons') as HTMLDivElement;
    this.moreSitesContainer = document.getElementById('more-sites-container') as HTMLDivElement;
    this.moreSitesButton = document.getElementById('more-sites-btn') as HTMLButtonElement;
    this.moreSitesDropdown = document.getElementById('more-sites-dropdown') as HTMLDivElement;
    this.moreSitesDropdownContent = document.createElement('div');
    this.moreSitesDropdownContent.className = 'py-1 theme-bg-primary theme-text-primary shadow-lg rounded-md border theme-border';
    this.moreSitesDropdown.appendChild(this.moreSitesDropdownContent);
    this.logoContainer = document.getElementById('logo-container') as HTMLDivElement;
    this.contentFrame = document.getElementById('content-frame') as HTMLIFrameElement;
    this.currentSiteName = document.getElementById('current-site-name') as HTMLSpanElement;
    this.siteDescription = document.getElementById('site-description') as HTMLSpanElement;
    this.refreshButton = document.getElementById('refresh-btn') as HTMLButtonElement;
    
    // Create loading overlay
    this.loadingOverlay = document.createElement('div');
    this.loadingOverlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    this.loadingOverlay.innerHTML = `
      <div class="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col items-center">
        <div class="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="mt-2 text-sm theme-text-primary">Loading...</p>
      </div>
    `;
    document.body.appendChild(this.loadingOverlay);
    this.themeToggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;

    // Initialize event listeners
    this.initEventListeners();

    // Initialize theme
    initTheme();
    
    // Show initial loading state
    this.showLoading();
    
    // Load sites and initialize content
    this.loadSites();
  }

  /**
   * Initialize event listeners
   */
  private initEventListeners(): void {
    // Logo click - refresh page
    this.logoContainer.addEventListener('click', () => {
      window.location.reload();
    });

    // Refresh button click
    this.refreshButton.addEventListener('click', () => {
      this.refreshCurrentSite();
    });
    
    // Add iframe load event listener
    this.contentFrame.addEventListener('load', () => {
      this.hideLoading();
    });
    
    // Theme toggle button click
    this.themeToggleButton.addEventListener('click', () => {
      toggleTheme();
    });

    // More sites button click
    this.moreSitesButton.addEventListener('click', () => {
      this.toggleMoreSitesDropdown();
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      if (!this.moreSitesContainer.contains(event.target as Node) &&
          !this.moreSitesDropdown.classList.contains('hidden')) {
        this.moreSitesDropdown.classList.add('hidden');
      }
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

      // Populate site buttons and dropdown
      this.populateSiteButtons();

      // Load last selected site or default
      this.loadLastSelectedSite();
    } catch (error) {
      console.error('Error loading sites:', error);
      this.loadSite(this.defaultSiteUrl);
    }
  }

  /**
   * Populate site buttons and dropdown
   */
  private populateSiteButtons(): void {
    // Clear existing buttons and dropdown items
    this.siteButtons.innerHTML = '';
    this.moreSitesDropdownContent.innerHTML = '';

    // Add sites as buttons or dropdown items
    this.sites.forEach((site, index) => {
      if (index < this.maxVisibleSites) {
        // Create button for visible sites
        const button = document.createElement('button');
        button.className = 'site-button px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center';
        button.dataset.url = site.url;

        // Add site icon (placeholder)
        const icon = document.createElement('span');
        icon.className = 'w-5 h-5 mr-2 flex items-center justify-center text-primary-600 dark:text-primary-400 font-bold';
        icon.textContent = site.name.charAt(0).toUpperCase();

        // Add site name
        const name = document.createElement('span');
        name.className = 'theme-text-primary';
        name.textContent = site.name;

        button.appendChild(icon);
        button.appendChild(name);

        // Add click event
        button.addEventListener('click', () => {
          this.loadSite(site.url);
        });

        this.siteButtons.appendChild(button);
      } else {
        // Show the more sites container
        this.moreSitesContainer.style.display = 'block';

        // Create dropdown item for additional sites
        const item = document.createElement('a');
        item.className = 'block px-4 py-2 text-sm theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer';
        item.textContent = site.name;
        item.dataset.url = site.url;

        // Add click event
        item.addEventListener('click', (e) => {
          e.preventDefault();
          this.loadSite(site.url);
          this.moreSitesDropdown.classList.add('hidden');
        });

        this.moreSitesDropdownContent.appendChild(item);
      }
    });
  }

  /**
   * Load last selected site from storage
   */
  private loadLastSelectedSite(): void {
    chrome.storage.local.get(['lastSelectedSite'], (result) => {
      const lastSelectedSite = result.lastSelectedSite || this.defaultSiteUrl;
      this.loadSite(lastSelectedSite);
    });
  }

  /**
   * Show loading overlay
   */
  private showLoading(): void {
    this.loadingOverlay.classList.remove('hidden');
  }

  /**
   * Hide loading overlay
   */
  private hideLoading(): void {
    this.loadingOverlay.classList.add('hidden');
  }

  /**
   * Load a site in the iframe
   */
  private loadSite(url: string): void {
    // Show loading overlay
    this.showLoading();
    
    // Update iframe source
    this.contentFrame.src = url;

    // Save selected site to storage
    chrome.storage.local.set({ lastSelectedSite: url });

    // Update UI
    this.updateSiteInfo(url);
  }

  /**
   * Update site info in the UI
   */
  private updateSiteInfo(url: string): void {
    const site = this.sites.find(site => site.url === url);

    if (site) {
      this.currentSiteName.textContent = site.name;
      this.siteDescription.textContent = site.description;
    } else {
      this.currentSiteName.textContent = 'Unknown Site';
      this.siteDescription.textContent = '';
    }
  }

  /**
   * Toggle more sites dropdown visibility
   */
  private toggleMoreSitesDropdown(): void {
    this.moreSitesDropdown.classList.toggle('hidden');
  }

  /**
   * Refresh the current site
   */
  private refreshCurrentSite(): void {
    const currentUrl = this.contentFrame.src;
    this.showLoading();
    this.contentFrame.src = '';
    setTimeout(() => {
      this.contentFrame.src = currentUrl;
    }, 100);
  }
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new NewTabController();
});
