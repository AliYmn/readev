/**
 * Interface for a developer news site
 */
export interface Site {
  name: string;
  url: string;
  description: string;
}

/**
 * Interface for the sites.json file structure
 */
export interface SitesData {
  sites: Site[];
}
