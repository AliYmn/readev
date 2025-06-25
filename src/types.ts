/**
 * Base interface for content sources
 */
export interface ContentSource {
  name: string;
  description: string;
  type: 'site' | 'feed';
}

/**
 * Interface for a developer news site (iframe-based)
 */
export interface Site extends ContentSource {
  type: 'site';
  url: string;
}

/**
 * Interface for an RSS feed source
 */
export interface Feed extends ContentSource {
  type: 'feed';
  feed_url: string;
}

/**
 * Type guard to check if a content source is a Site
 */
export function isSite(source: ContentSource): source is Site {
  return source.type === 'site';
}

/**
 * Type guard to check if a content source is a Feed
 */
export function isFeed(source: ContentSource): source is Feed {
  return source.type === 'feed';
}

/**
 * Interface for the sites.json file structure
 */
export interface SitesData {
  sites: Site[];
}

/**
 * Interface for the feeds.json file structure
 */
export interface FeedsData {
  feeds: Feed[];
}

/**
 * Combined content sources data
 */
export interface ContentData {
  sources: ContentSource[];
}
