import './styles.css';
import { ContentSource, Site, Feed, isSite, isFeed, ContentData } from './types';
import { initTheme, toggleTheme } from './theme';
import { FeedReader } from './feedReader';

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
  private feedContainer: HTMLDivElement;
  private feedReader: FeedReader;
  private currentSiteName: HTMLSpanElement;
  private siteDescription: HTMLSpanElement;
  private refreshButton: HTMLButtonElement;
  private loadingOverlay: HTMLDivElement;
  private themeToggleButton: HTMLButtonElement;
  private sources: ContentSource[] = [];
  private sites: Site[] = [];
  private defaultSiteUrl: string = 'https://devurls.com/';
  private maxVisibleSites: number = 4; // Will be dynamically calculated based on screen width

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
    this.feedContainer = document.getElementById('feed-container') as HTMLDivElement;
    this.feedReader = new FeedReader(this.feedContainer);
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
   * Load favorites from Chrome storage and apply to sources
   */
  private async loadFavorites(): Promise<void> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['favorites'], (result) => {
        const favorites = result.favorites || [];
        console.log('Loaded favorites:', favorites);

        // Apply favorites to sources
        this.sources.forEach(source => {
          source.favorite = favorites.includes(source.name);
        });

        resolve();
      });
    });
  }

  /**
   * Save favorites to Chrome storage
   */
  private saveFavorites(): void {
    const favorites = this.sources
      .filter(source => source.favorite)
      .map(source => source.name);

    chrome.storage.local.set({ favorites }, () => {
      console.log('Favorites saved:', favorites);
    });
  }

  /**
   * Load sources from sources.json and apply favorites
   */
  private async loadSites(): Promise<void> {
    try {
      const response = await fetch('sources.json');
      const data: ContentData = await response.json();
      this.sources = data.sources;

      // Load favorites from Chrome storage
      await this.loadFavorites();

      // Calculate max visible sites based on screen width
      this.calculateMaxVisibleSites();

      // Add window resize listener to recalculate visible sites
      window.addEventListener('resize', () => {
        this.calculateMaxVisibleSites();
        this.populateSiteButtons();
      });

      // Populate site buttons and dropdown
      this.populateSiteButtons();

      // Load last selected site or default
      this.loadLastSelectedSite();
    } catch (error) {
      console.error('Error loading sources:', error);
      this.loadSite(this.defaultSiteUrl);
    }
  }

  /**
   * Calculate maximum visible sites based on screen width
   */
  private calculateMaxVisibleSites(): void {
    const screenWidth = window.innerWidth;
    if (screenWidth < 640) { // Small screens
      this.maxVisibleSites = 1;
    } else if (screenWidth < 768) { // Medium screens
      this.maxVisibleSites = 2;
    } else if (screenWidth < 1024) { // Large screens
      this.maxVisibleSites = 3;
    } else if (screenWidth < 1280) { // XL screens
      this.maxVisibleSites = 4;
    } else { // 2XL screens and above
      this.maxVisibleSites = 5;
    }
  }

  /**
   * Populate site buttons and dropdown
   * Favorites are shown first, then regular sites up to maxVisibleSites
   */
  private populateSiteButtons(): void {
    // Clear existing buttons and dropdown items
    this.siteButtons.innerHTML = '';
    this.moreSitesDropdownContent.innerHTML = '';

    // Sort sources: favorites first, then regular sites
    const sortedSources = [...this.sources].sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      return 0;
    });

    // Track how many buttons we've added
    let visibleCount = 0;

    // Add all sources as buttons or dropdown items
    sortedSources.forEach((source) => {
      // Show as button if it's a favorite or we haven't reached max visible sites
      if (source.favorite || visibleCount < this.maxVisibleSites) {
        visibleCount++;
        // Create button for visible sources
        const button = document.createElement('button');
        button.className = 'site-button px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center';

        // Set URL based on source type
        if (isSite(source)) {
          button.dataset.url = source.url;
        } else if (isFeed(source)) {
          button.dataset.url = source.feed_url;
        }

        // Add source emoji icon
        const icon = document.createElement('span');
        icon.className = 'w-6 h-6 mr-2 flex items-center justify-center';

        // Use emoji if available, otherwise fallback to first letter
        if (source.emoji) {
          icon.textContent = source.emoji;
          icon.className += ' text-lg';
        } else {
          icon.textContent = source.name.charAt(0).toUpperCase();
          icon.className += ' text-primary-600 dark:text-primary-400 font-bold';
        }

        // Add source name
        const name = document.createElement('span');
        name.className = 'theme-text-primary';
        name.textContent = source.name;

        // Create container for name and favorite icon
        const nameContainer = document.createElement('div');
        nameContainer.className = 'flex items-center justify-between flex-grow';

        // Add name to container
        nameContainer.appendChild(name);

        // Add favorite star icon
        const favoriteIcon = document.createElement('span');
        favoriteIcon.className = `ml-2 ${source.favorite ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400 transition-colors`;
        favoriteIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        `;

        // Add favorite toggle functionality
        favoriteIcon.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent button click
          source.favorite = !source.favorite;
          this.saveFavorites();
          this.populateSiteButtons();
        });

        nameContainer.appendChild(favoriteIcon);

        button.appendChild(icon);
        button.appendChild(nameContainer);

        // Add click event
        button.addEventListener('click', () => {
          if (isSite(source)) {
            this.loadSite(source.url);
          } else if (isFeed(source)) {
            this.loadSite(source.feed_url);
          }
        });

        this.siteButtons.appendChild(button);
      } else {
        // Show the more sites container
        this.moreSitesContainer.style.display = 'block';

        // Create dropdown item for additional sources
        const item = document.createElement('a');
        item.className = 'block px-4 py-2 text-sm theme-text-primary hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center';

        // Add source emoji icon
        const icon = document.createElement('span');
        icon.className = 'w-6 h-6 mr-2 flex items-center justify-center';

        // Use emoji if available, otherwise fallback to first letter
        if (source.emoji) {
          icon.textContent = source.emoji;
          icon.className += ' text-lg';
        } else {
          icon.textContent = source.name.charAt(0).toUpperCase();
          icon.className += ' text-primary-600 dark:text-primary-400 font-bold';
        }

        // Add source name
        const name = document.createElement('span');
        name.className = source.favorite ? 'font-medium text-primary-600 dark:text-primary-400' : '';
        name.textContent = source.name;

        // Create container for name and favorite icon
        const nameContainer = document.createElement('div');
        nameContainer.className = 'flex items-center justify-between flex-grow';
        nameContainer.appendChild(name);

        // Add favorite star icon
        const favoriteIcon = document.createElement('span');
        favoriteIcon.className = `ml-2 ${source.favorite ? 'text-yellow-400' : 'text-gray-300'} cursor-pointer hover:text-yellow-400 transition-colors`;
        favoriteIcon.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        `;

        // Add favorite toggle functionality
        favoriteIcon.addEventListener('click', (e) => {
          e.stopPropagation(); // Prevent item click
          source.favorite = !source.favorite;
          this.saveFavorites();
          this.populateSiteButtons();
        });

        nameContainer.appendChild(favoriteIcon);

        item.appendChild(icon);
        item.appendChild(nameContainer);

        // Set URL based on source type
        if (isSite(source)) {
          item.dataset.url = source.url;
        } else if (isFeed(source)) {
          item.dataset.url = source.feed_url;
        }

        // Add click event
        item.addEventListener('click', (e) => {
          e.preventDefault();
          if (isSite(source)) {
            this.loadSite(source.url);
          } else if (isFeed(source)) {
            this.loadSite(source.feed_url);
          }
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
   * Load a content source (site or feed)
   */
  private loadSite(url: string): void {
    // Show loading overlay
    this.showLoading();

    // Find if this is a site or feed URL
    const source = this.sources.find(s =>
      (isSite(s) && s.url === url) ||
      (isFeed(s) && s.feed_url === url)
    );

    // Handle based on source type
    if (source && isFeed(source)) {
      // For feeds, show feed container and hide iframe
      this.contentFrame.classList.add('hidden');
      this.feedContainer.classList.remove('hidden');

      // Update site name and description
      this.currentSiteName.textContent = source.name;
      this.siteDescription.textContent = source.description || '';

      // Load feed content with source information
      this.feedReader.loadFeed(url, source);

      // Hide loading when feed reader is done
      setTimeout(() => this.hideLoading(), 500);
    } else {
      // For sites, show iframe and hide feed container
      this.contentFrame.classList.remove('hidden');
      this.feedContainer.classList.add('hidden');

      // Update iframe source
      this.contentFrame.src = url;
    }

    // Update site info
    this.updateSiteInfo(url);

    // Save last selected site
    chrome.storage.local.set({ lastSelectedSite: url });
  }

  /**
   * Update site info in the UI
   */
  private updateSiteInfo(url: string): void {
    // Find the source by URL (could be site or feed)
    const source = this.sources.find(s =>
      (isSite(s) && s.url === url) ||
      (isFeed(s) && s.feed_url === url)
    );

    if (source) {
      this.currentSiteName.textContent = source.name;
      this.siteDescription.textContent = source.description;
    } else {
      this.currentSiteName.textContent = 'External Site';
      this.siteDescription.textContent = url;
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
