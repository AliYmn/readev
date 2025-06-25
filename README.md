# Readev.news

A modern Chrome extension that displays developer news from Devurls and TrendShift in your new tab page.

## Features

- **Modern Tech Stack**: Built with TypeScript and Tailwind CSS
- **New Tab Integration**: Replaces the new tab page with developer news
- **Multiple Sources**: Access content from Devurls and TrendShift
- **Responsive Design**: Modern UI with sticky header and footer
- **Site Persistence**: Remembers your last selected news source

## Development

### Prerequisites

- Node.js and npm

### Setup

```bash
# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run dev
```

### Loading the Extension

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the `dist` folder

## Project Structure

```
├── src/                  # Source files
│   ├── html/             # HTML templates
│   ├── images/           # Extension icons
│   ├── background.ts     # Background script
│   ├── newtab.ts         # New tab page script
│   ├── popup.ts          # Popup script
│   ├── styles.css        # Tailwind CSS styles
│   ├── types.ts          # TypeScript interfaces
│   ├── manifest.json     # Extension manifest
│   └── sites.json        # Site configuration
├── dist/                 # Compiled files (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── webpack.config.js     # Webpack configuration
```
- All content is displayed through iframes

## License

MIT
