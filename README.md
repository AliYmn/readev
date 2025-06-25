
<div align="center">

<img src="images/logo.png" alt="Readev Logo" width="160" />

# Readev

**A newspaper for developers — every time you open a new tab.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
![Status](https://img.shields.io/badge/status-active-brightgreen)
![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Coming%20Soon-orange)
![Made with TypeScript](https://img.shields.io/badge/Made%20with-TypeScript-3178c6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Styled%20with-TailwindCSS-38b2ac?logo=tailwind-css&logoColor=white)

</div>

---

## 📰 About

**Readev** is a modern, open-source Chrome extension that transforms your new tab into a beautifully minimal developer news dashboard.

It aggregates content from top developer-centric sources and displays them in a focused, readable format — helping you stay updated with the latest in tech every time you open a new tab.

---

## 🌐 What It Does

✅ Replaces your Chrome new tab with a customizable news panel
📰 Shows content from trusted sources like:

- [Dev.to](https://dev.to) 👩‍💻
- [freeCodeCamp](https://www.freecodecamp.org/news/) 🔥
- [Google Developers](https://developers.googleblog.com/) 🧩
- [Lobste.rs](https://lobste.rs) 🦞
- [HackerNoon](https://hackernoon.com) 🚀
- [Reddit r/programming](https://www.reddit.com/r/programming/) 🤖
- [Stack Overflow Blog](https://stackoverflow.blog/) ⚡
- [TrendShift](https://trendshift.io) 📈
- [TuxURLs](https://tuxurls.com) 🐧
- [DZone](https://dzone.com) 📚
- and more...

🎨 Clean, responsive interface with dark/light mode support
🔒 No tracking, ads, or logins — just dev content via secure iframes
💾 Remembers your last viewed source

---

## 🎯 Why Readev?

> Open a new tab. See what’s happening in tech. Every time.
> No distractions. No noise. Just the dev news that matters.

Readev is your silent companion for staying informed, learning, and exploring new tools — without leaving the browser.

---

## 🤝 How to Contribute

Want to add your favorite developer news source to Readev? Contributions are welcome and encouraged!

### 🔗 Add a New Source

1. Open a pull request (PR) editing the following file:
   👉 [`sources.json`](https://github.com/AliYmn/readev/blob/main/src/sources.json)

2. Add your new source using the following structure:

```json
{
  "name": "Example Source",
  "url": "https://example.com",
  "description": "Short description of what this site offers",
  "type": "site",
  "emoji": "🧠"
}
```

- Use `"type": "site"` for iframe-compatible sites.
- Use `"type": "feed"` and `feed_url` if the site does **not** allow iframe embedding but provides an RSS or Atom feed.

### ⚠️ Iframe Compatibility

- Make sure the site allows embedding in an iframe (no restrictive `X-Frame-Options` or `Content-Security-Policy` headers).
- If the site **does not support iframe**, you can still include it using a valid RSS/Atom feed.

### 🚀 Tips

- Choose trusted, high-quality developer content sources.
- Add a clear, concise description.
- Use a relevant emoji to improve visual clarity.

Once your PR is reviewed and merged, the source will appear in the next release of Readev.

---

## 🧡 Open Source

This project is open-source and MIT licensed.
Built by developers, for developers who value simplicity, open knowledge, and beautiful tools.

---

> **Readev** – built for the curious developer.
