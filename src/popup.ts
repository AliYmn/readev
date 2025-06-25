import './styles.css';
import { initTheme, toggleTheme } from './theme';

/**
 * Popup controller for Readev extension
 */
class PopupController {
  private openNewTabButton: HTMLButtonElement;
  private themeToggleButton: HTMLButtonElement;

  constructor() {
    // Initialize DOM elements
    this.openNewTabButton = document.getElementById('open-newtab') as HTMLButtonElement;
    this.themeToggleButton = document.getElementById('theme-toggle') as HTMLButtonElement;

    // Initialize event listeners
    this.initEventListeners();

    // Initialize theme
    initTheme();
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
}

// Initialize controller when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new PopupController();
});
