<div align="center">

# Readev

<img src="images/logo.png" alt="Readev Logo" width="120" height="120">

A modern Chrome extension that transforms your new tab into a developer news aggregator.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-green.svg)](https://chrome.google.com/webstore)

</div>

## Overview

Readev is an open-source Chrome extension designed for developers who want to stay updated with the latest tech news and trends. It transforms your new tab page into a customizable news aggregator that brings together content from various developer-focused websites.

## Features

- **Modern Tech Stack**: Built with TypeScript and Tailwind CSS for a maintainable codebase
- **New Tab Integration**: Seamlessly replaces Chrome's new tab page with developer news
- **Multiple News Sources**: Access content from popular developer sites like Devurls, TrendShift, Lobste.rs, and more
- **Dark/Light Theme**: Automatically adapts to your system preferences or can be manually toggled
- **Responsive Design**: Clean, modern UI with a focus on readability and usability
- **Site Persistence**: Remembers your last selected news source between sessions
- **Loading Animations**: Smooth transitions when switching between sites

## Installation

### Chrome Web Store

*Coming soon!*

### Manual Installation

1. Download or clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run build` to build the extension
4. Open Chrome and navigate to `chrome://extensions/`
5. Enable "Developer mode" in the top-right corner
6. Click "Load unpacked" and select the `dist` folder from this project

## Development

### Prerequisites

- Node.js (v14 or later)
- npm (v6 or later)

### Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/readev.git
cd readev

# Install dependencies
npm install

# Build the extension
npm run build

# Watch for changes during development
npm run dev
```

## Project Structure

```
├── src/                  # Source files
│   ├── html/             # HTML templates
│   ├── images/           # Extension icons
│   ├── background.ts     # Background script
│   ├── newtab.ts         # New tab page script
│   ├── popup.ts          # Popup script
│   ├── styles.css        # Tailwind CSS styles
│   ├── theme.ts          # Theme management
│   ├── types.ts          # TypeScript interfaces
│   ├── manifest.json     # Extension manifest
│   └── sites.json        # Site configuration
├── dist/                 # Compiled extension files
├── webpack.config.js     # Webpack configuration
└── tailwind.config.js    # Tailwind CSS configuration
```

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests to help improve Readev.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Thanks to all the developer news sites that make their content available
- Built with [TypeScript](https://www.typescriptlang.org/) and [Tailwind CSS](https://tailwindcss.com/)
- Icon and design inspiration from various open-source projects
├── dist/                 # Compiled files (generated)
├── package.json          # Project dependencies
├── tsconfig.json         # TypeScript configuration
├── tailwind.config.js    # Tailwind CSS configuration
└── webpack.config.js     # Webpack configuration
```
- All content is displayed through iframes
