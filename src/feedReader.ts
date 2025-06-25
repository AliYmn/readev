/**
 * Feed Reader module for displaying RSS feeds in a modern UI
 */

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate?: string;
  author?: string;
}

export interface FeedInfo {
  title: string;
  link?: string;
  description?: string;
}

export class FeedReader {
  private container: HTMLElement;
  private feedUrl: string;
  private isLoading: boolean = false;
  private errorState: boolean = false;
  private feedItems: FeedItem[] = [];
  private feedInfo: FeedInfo = { title: '' };
  private maxDisplayItems: number = 20; // Increased from default 10

  constructor(container: HTMLElement) {
    this.container = container;
    this.feedUrl = '';
  }

  /**
   * Load and display a feed
   */
  public async loadFeed(feedUrl: string): Promise<void> {
    this.feedUrl = feedUrl;
    this.isLoading = true;
    this.errorState = false;
    this.renderLoadingState();

    try {
      // Try multiple CORS proxies in sequence until one works
      let feedText = '';
      let success = false;

      // List of CORS proxies to try
      const proxies = [
        (url: string) => `https://corsproxy.io/?${encodeURIComponent(url)}`,
        (url: string) => `https://cors-anywhere.herokuapp.com/${url}`,
        (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
        (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
      ];

      // Try each proxy until one works
      for (const proxyFn of proxies) {
        if (success) break;

        try {
          const proxyUrl = proxyFn(feedUrl);
          console.log(`Trying proxy: ${proxyUrl}`);

          const response = await fetch(proxyUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml'
            }
          });

          if (!response.ok) {
            console.warn(`Proxy failed with status: ${response.status}`);
            continue;
          }

          feedText = await response.text();

          // Check if we got valid XML content
          if (feedText && feedText.includes('<')) {
            success = true;
            break;
          } else {
            console.warn('Received empty or invalid feed content');
          }
        } catch (proxyError) {
          console.warn('Proxy error:', proxyError);
          // Continue to next proxy
        }
      }

      // If none of the proxies worked
      if (!success) {
        throw new Error('All proxies failed to fetch the feed');
      }

      // Parse and render the feed
      this.parseFeed(feedText);
      this.isLoading = false;
      this.renderFeed();
    } catch (error) {
      console.error('Error loading feed:', error);
      this.isLoading = false;
      this.errorState = true;
      this.renderErrorState();
    }
  }

  /**
   * Parse XML feed content
   */
  private parseFeed(feedText: string): void {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(feedText, 'text/xml');

    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      throw new Error('XML parsing error');
    }

    // Clear existing items
    this.feedItems = [];

    // Reset feed info
    this.feedInfo = { title: '' };

    // Determine if this is RSS or Atom
    const isRSS = !!xmlDoc.querySelector('rss, rdf\\:RDF');
    const isAtom = !!xmlDoc.querySelector('feed');

    if (isRSS) {
      this.parseRSS(xmlDoc);
    } else if (isAtom) {
      this.parseAtom(xmlDoc);
    } else {
      throw new Error('Unsupported feed format');
    }
  }

  /**
   * Parse RSS feed
   */
  private parseRSS(xmlDoc: Document): void {
    // Get feed information
    const channel = xmlDoc.querySelector('channel');
    if (channel) {
      this.feedInfo.title = this.getElementText(channel, 'title');
    }

    // Get feed items
    const items = xmlDoc.querySelectorAll('item');

    items.forEach(item => {
      this.feedItems.push({
        title: this.getElementText(item, 'title'),
        link: this.getElementText(item, 'link'),
        description: this.getElementText(item, 'description'),
        pubDate: this.getElementText(item, 'pubDate'),
        author: this.getElementText(item, 'author') || this.getElementText(item, 'dc:creator')
      });
    });
  }

  /**
   * Parse Atom feed
   */
  private parseAtom(xmlDoc: Document): void {
    // Get feed information
    const feed = xmlDoc.querySelector('feed');
    if (feed) {
      // Get link href
      let feedLink = '';
      const feedLinkElement = feed.querySelector('link[rel="alternate"]') || feed.querySelector('link');
      if (feedLinkElement && feedLinkElement.hasAttribute('href')) {
        feedLink = feedLinkElement.getAttribute('href') || '';
      }

      this.feedInfo = {
        title: this.getElementText(feed, 'title'),
        link: feedLink,
        description: this.getElementText(feed, 'subtitle')
      };
    }

    // Get feed entries
    const entries = xmlDoc.querySelectorAll('entry');

    entries.forEach(entry => {
      // Get link href
      let link = '';
      const linkElement = entry.querySelector('link');
      if (linkElement && linkElement.hasAttribute('href')) {
        link = linkElement.getAttribute('href') || '';
      }

      // Get author
      let author = '';
      const authorElement = entry.querySelector('author name');
      if (authorElement) {
        author = authorElement.textContent || '';
      }

      this.feedItems.push({
        title: this.getElementText(entry, 'title'),
        link: link,
        description: this.getElementText(entry, 'summary') || this.getElementText(entry, 'content'),
        pubDate: this.getElementText(entry, 'published') || this.getElementText(entry, 'updated'),
        author: author
      });
    });
  }

  /**
   * Helper to get text content of an XML element
   * Handles namespaced elements like dc:creator
   */
  private getElementText(parent: Element, tagName: string): string {
    // Handle namespaced elements like dc:creator
    if (tagName.includes(':')) {
      const [namespace, name] = tagName.split(':');
      // Try to find element with namespace
      const elements = parent.getElementsByTagName(name);
      for (let i = 0; i < elements.length; i++) {
        const element = elements[i];
        const nsURI = element.namespaceURI || '';
        if (nsURI.includes(namespace)) {
          return element.textContent || '';
        }
      }
      // Fallback: try direct access without namespace validation
      for (let i = 0; i < elements.length; i++) {
        const content = elements[i].textContent || '';
        if (content) {
          return content;
        }
      }
      return '';
    }

    // Regular elements without namespace
    const element = parent.querySelector(tagName);
    return element ? element.textContent || '' : '';
  }

  /**
   * Render loading state with improved animation
   */
  private renderLoadingState(): void {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-8">
        <div class="relative w-16 h-16">
          <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <div class="absolute top-0 left-0 w-16 h-16 border-4 border-transparent border-b-primary-400 rounded-full animate-spin" style="animation-duration: 1.5s;"></div>
        </div>
        <p class="mt-4 text-lg font-medium theme-text-primary">Loading feed...</p>
        <p class="text-sm theme-text-secondary animate-pulse">Fetching the latest articles</p>
      </div>
    `;
  }

  /**
   * Render error state
   */
  private renderErrorState(): void {
    this.container.innerHTML = `
      <div class="flex flex-col items-center justify-center h-full p-8">
        <div class="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 class="text-xl font-bold theme-text-primary mb-2">Failed to load feed</h3>
        <p class="theme-text-secondary mb-4">There was a problem loading content from this feed.</p>
        <button id="retry-feed-btn" class="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors">
          Try Again
        </button>
      </div>
    `;

    // Add retry button event listener
    const retryButton = this.container.querySelector('#retry-feed-btn');
    if (retryButton) {
      retryButton.addEventListener('click', () => {
        this.loadFeed(this.feedUrl);
      });
    }
  }

  /**
   * Render feed content with modern styling
   */
  private renderFeed(): void {
    if (this.feedItems.length === 0) {
      this.container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full p-8">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <p class="theme-text-primary text-lg font-medium">No articles found</p>
          <p class="theme-text-secondary text-sm mt-2">This feed doesn't contain any items to display.</p>
        </div>
      `;
      return;
    }

    // Create feed container
    const feedContainer = document.createElement('div');
    feedContainer.className = 'feed-container p-4 md:p-6 max-w-4xl mx-auto';

    // Add feed items (use maxDisplayItems to limit the number)
    const feedItemsHtml = this.feedItems.slice(0, this.maxDisplayItems).map(item => {
      // Clean description (remove HTML tags for security)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = item.description;
      const cleanDescription = tempDiv.textContent || tempDiv.innerText || '';
      const truncatedDescription = cleanDescription.length > 150
        ? cleanDescription.substring(0, 150) + '...'
        : cleanDescription;

      // Format date if available
      let dateHtml = '';
      if (item.pubDate) {
        try {
          const date = new Date(item.pubDate);
          const formattedDate = date.toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          });
          dateHtml = `<span class="text-xs theme-text-secondary">${formattedDate}</span>`;
        } catch (e) {
          dateHtml = `<span class="text-xs theme-text-secondary">${item.pubDate}</span>`;
        }
      }

      // Author info if available
      const authorHtml = item.author
        ? `<span class="text-xs theme-text-secondary ml-2">by ${item.author}</span>`
        : '';

      return `
        <div class="feed-item mb-6 p-5 rounded-lg theme-bg-secondary border theme-border hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <h3 class="text-lg font-semibold theme-text-primary mb-3">
            <a href="${item.link}" target="_blank" class="hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-200">${item.title}</a>
          </h3>
          <p class="theme-text-secondary mb-4 text-sm leading-relaxed">${truncatedDescription}</p>
          <div class="flex items-center justify-between border-t theme-border pt-3 mt-3">
            <div class="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              ${dateHtml}
            </div>
            <div class="flex items-center">
              ${authorHtml ? `
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                ${authorHtml}
              ` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Create feed title with site name
    const feedTitle = this.feedInfo.title
      ? `${this.feedInfo.title}`
      : 'Latest Articles';

    // Create feed header with site info
    const feedLink = this.feedInfo.link ? `<a href="${this.feedInfo.link}" target="_blank" class="text-primary-600 dark:text-primary-400 hover:underline ml-2 text-sm">Visit Site</a>` : '';

    feedContainer.innerHTML = `
      <div class="mb-8 pb-4 border-b theme-border">
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-bold theme-text-primary">${feedTitle}</h2>
          ${feedLink}
        </div>
        ${this.feedInfo.description ? `<p class="theme-text-secondary mt-2 text-sm">${this.feedInfo.description}</p>` : ''}
      </div>
      <div class="feed-items">
        ${feedItemsHtml}
      </div>
    `;

    // Clear container and append feed
    this.container.innerHTML = '';
    this.container.appendChild(feedContainer);

    // Add click event for links to open in new tab
    const links = this.container.querySelectorAll('a');
    links.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        chrome.tabs.create({ url: link.href });
      });
    });
  }
}
