/**
 * Theme management utilities
 */

// Theme options
export type Theme = 'light' | 'dark';

// Local storage key for theme
const THEME_STORAGE_KEY = 'readev-theme';

/**
 * Get the current theme from storage or system preference
 */
export function getTheme(): Theme {
  // Check if theme is stored in local storage
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  
  if (storedTheme) {
    return storedTheme;
  }
  
  // Check system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Default to light theme
  return 'light';
}

/**
 * Set the theme and update the UI
 */
export function setTheme(theme: Theme): void {
  // Store theme preference
  localStorage.setItem(THEME_STORAGE_KEY, theme);
  
  // Update body class
  const body = document.body;
  
  if (theme === 'dark') {
    body.classList.add('dark');
    body.classList.remove('light');
  } else {
    body.classList.add('light');
    body.classList.remove('dark');
  }
  
  // Update theme toggle icons
  updateThemeToggleIcons(theme);
}

/**
 * Update theme toggle icons based on current theme
 */
export function updateThemeToggleIcons(theme: Theme): void {
  const darkIcons = document.querySelectorAll('.dark-icon');
  const lightIcons = document.querySelectorAll('.light-icon');
  
  if (theme === 'dark') {
    darkIcons.forEach(icon => icon.classList.remove('hidden'));
    lightIcons.forEach(icon => icon.classList.add('hidden'));
  } else {
    darkIcons.forEach(icon => icon.classList.add('hidden'));
    lightIcons.forEach(icon => icon.classList.remove('hidden'));
  }
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): void {
  const currentTheme = getTheme();
  const newTheme: Theme = currentTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
}

/**
 * Initialize theme based on stored preference or system preference
 */
export function initTheme(): void {
  const theme = getTheme();
  setTheme(theme);
}
