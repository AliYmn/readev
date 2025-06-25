/**
 * Enhanced theme management utilities
 * Provides smooth transitions between themes and system preference detection
 */

// Theme options
export type Theme = 'light' | 'dark';

// Local storage key for theme
const THEME_STORAGE_KEY = 'readev-theme';

// CSS transition duration in milliseconds for theme changes
const TRANSITION_DURATION = 300;

/**
 * Get the current theme from storage or system preference
 * @returns The current theme ('light' or 'dark')
 */
export function getTheme(): Theme {
  // Check if theme is stored in local storage
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  
  if (storedTheme && (storedTheme === 'light' || storedTheme === 'dark')) {
    return storedTheme;
  }
  
  // Check system preference with media query
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light theme
  return 'light';
}

/**
 * Set the theme and update the UI with smooth transition
 * @param theme The theme to set ('light' or 'dark')
 */
export function setTheme(theme: Theme): void {
  // Store theme preference
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  // Get body element
  const body = document.body;
  
  // Add transition class for smooth theme change
  body.classList.add('theme-transition');
  
  // Update body class after a small delay to ensure transition is applied
  setTimeout(() => {
    if (theme === 'dark') {
      body.classList.add('dark');
      body.classList.remove('light');
    } else {
      body.classList.add('light');
      body.classList.remove('dark');
    }
    
    // Update theme toggle icons
    updateThemeToggleIcons(theme);
    
    // Remove transition class after transition completes
    setTimeout(() => {
      body.classList.remove('theme-transition');
    }, TRANSITION_DURATION);
  }, 10);
}

/**
 * Update theme toggle icons based on current theme with fade effect
 * @param theme The current theme ('light' or 'dark')
 */
export function updateThemeToggleIcons(theme: Theme): void {
  const darkIcons = document.querySelectorAll('.dark-icon');
  const lightIcons = document.querySelectorAll('.light-icon');
  
  if (theme === 'dark') {
    // Show dark mode icons (sun) and hide light mode icons (moon)
    darkIcons.forEach(icon => {
      icon.classList.remove('hidden');
      icon.classList.add('fade-in');
    });
    lightIcons.forEach(icon => icon.classList.add('hidden'));
  } else {
    // Show light mode icons (moon) and hide dark mode icons (sun)
    lightIcons.forEach(icon => {
      icon.classList.remove('hidden');
      icon.classList.add('fade-in');
    });
    darkIcons.forEach(icon => icon.classList.add('hidden'));
  }
}

/**
 * Toggle between light and dark themes with animation
 */
export function toggleTheme(): void {
  const currentTheme = getTheme();
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  
  // Add a subtle animation to the toggle button
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.classList.add('animate-toggle');
    setTimeout(() => themeToggle.classList.remove('animate-toggle'), 500);
  }
  
  setTheme(newTheme);
}

/**
 * Initialize theme based on stored preference or system preference
 * Also sets up system preference change listener
 */
export function initTheme(): void {
  const theme = getTheme();
  setTheme(theme);
  
  // Listen for system preference changes
  if (window.matchMedia) {
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Modern approach using addEventListener
    if (colorSchemeQuery.addEventListener) {
      colorSchemeQuery.addEventListener('change', (e) => {
        // Only update if user hasn't explicitly set a preference
        if (!localStorage.getItem(THEME_STORAGE_KEY)) {
          setTheme(e.matches ? 'dark' : 'light');
        }
      });
    }
  }
  
  // Add CSS for theme transition to the document
  addThemeTransitionStyles();
}

/**
 * Add CSS styles for theme transitions
 */
function addThemeTransitionStyles(): void {
  // Create style element if it doesn't exist
  let styleEl = document.getElementById('theme-transition-styles');
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = 'theme-transition-styles';
    document.head.appendChild(styleEl);
  }
  
  // Add transition styles
  styleEl.textContent = `
    .theme-transition * {
      transition: background-color ${TRANSITION_DURATION}ms ease,
                 color ${TRANSITION_DURATION}ms ease,
                 border-color ${TRANSITION_DURATION}ms ease,
                 box-shadow ${TRANSITION_DURATION}ms ease !important;
    }
    
    .animate-toggle {
      animation: pulse 0.5s ease-in-out;
    }
    
    @keyframes pulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.1); }
      100% { transform: scale(1); }
    }
  `;
}
