<div align="center">

# 🎬 Cinejoy — Modern Free Movie & TV Show Streaming Platform

[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express](https://img.shields.io/badge/Express-SSR_SEO-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore_%26_Auth-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com/)
[![TMDB API](https://img.shields.io/badge/TMDB-v3_API-01B4E4?style=for-the-badge&logo=themoviedatabase&logoColor=white)](https://www.themoviedb.org/)

<p align="center">
  <strong>Watch Movies & TV Series Online Free in 1080p/4K HD with Dynamic Glassmorphic Theming, SSR SEO Engine, and Instant Cloud Sync.</strong>
</p>

[Live Demo (cinejoy.to)](https://cinejoy.to) • [FlixHQ Mirror](https://flixhq.to) • [Report Bug](https://github.com/your-username/cinejoy/issues) • [Request Feature](https://github.com/your-username/cinejoy/issues)

</div>

---

## 📌 Overview

**Cinejoy** is an ultra-fast, server-side SEO-optimized Progressive Web Application (PWA) designed for discovering, cataloging, and streaming trending movies, top-rated TV series, and official 4K trailers. Built with **React 18**, **TypeScript**, **Tailwind CSS**, and **Express SSR**, Cinejoy delivers a premium frosted-glass interface with real-time poster palette extraction, cross-device watchlist synchronization, and multi-domain branding.

---

## ✨ Key Features

- 🎭 **Dynamic Poster Color Palette & Glassmorphic Tinting**:
  - Automatically extracts dominant, secondary, and accent colors from movie posters via an in-memory canvas quantizer.
  - Dynamically updates backdrop glow, modal glass borders, buttons, and tab indicators.
- 🚀 **Server-Side Rendered (SSR) Dynamic SEO Engine**:
  - Express server prerenders meta tags (`<title>`, `<meta name="description">`, `<meta name="keywords">`).
  - Generates Open Graph (`og:*`), Twitter Cards (`twitter:*`), and canonical links for search engines and social crawlers.
  - Injects dynamic **Schema.org JSON-LD** structured data (`Movie`, `TVSeries`, `BreadcrumbList`, and `WebSite` with Sitelinks Searchbox).
- 🔄 **Multi-Domain Dynamic Rebranding**:
  - Seamlessly adapts branding and SEO tags based on incoming hostname (`cinejoy.to`, `cinejoy.online`, `flixhq.to`, `flixhq.ink`).
- 🎬 **Extensive TMDB Database Integration**:
  - Explore 50,000+ movies and TV shows, trending hero carousels, genre filtering, actor cast credits, runtime, ratings, and YouTube 4K trailers.
- ☁️ **Cloud Firestore Watchlist & Auth**:
  - Instant Google & Email Authentication with real-time cloud synchronization for user favorites, watch history, and playback settings.
- 📱 **Mobile-First Progressive Web App (PWA)**:
  - Installable on iOS, Android, and Desktop with offline caching, responsive touch gestures, and haptic feedback.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide React, Motion
- **Backend & SSR**: Node.js, Express, Vite Custom SSR Middleware, esbuild
- **Database & Auth**: Google Firebase Auth, Cloud Firestore
- **External APIs**: TMDB (The Movie Database API v3), YouTube IFrame API
- **Color Quantization**: HTML5 Canvas Pixel Luminance & Saturation Bucket Extraction

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18.x or higher)
- npm, yarn, or bun
- TMDB API Key ([Get one free from TMDB](https://www.themoviedb.org/settings/api))

### 1. Clone the repository
```bash
git clone https://github.com/your-username/cinejoy.git
cd cinejoy
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment variables
Create a `.env` file in the project root:
```env
# TMDB API Key
VITE_TMDB_API_KEY=your_tmdb_api_key_here
TMDB_API_KEY=your_tmdb_api_key_here

# Firebase Configuration (Optional for Cloud Sync)
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

### 4. Run development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for production
```bash
npm run build
npm start
```

---

## 🔍 SEO & Deep Linking Routes

Cinejoy supports clean, shareable SEO-friendly query parameters and URL paths that crawlers and users can index:

| Route / Query | Description |
| :--- | :--- |
| `/?movie=:id` | Movie detail page with prerendered TMDB metadata & Schema.org Movie data |
| `/?tv=:id` | TV show detail page with prerendered seasons & Schema.org TVSeries data |
| `/?tab=browse&type=movie` | Browse trending box office and genre-filtered movies |
| `/?tab=browse&type=tv` | Browse popular TV shows and network series |
| `/?tab=search&q=:query` | Live search results with dynamic title & description indexing |
| `/api/seo/debug?url=...` | SSR SEO inspection endpoint for crawler verification |

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## ⚖️ Disclaimer

*Cinejoy is an educational open-source project powered by the TMDB API. It does not host, upload, or store any copyrighted video files on its servers. All metadata, images, and video assets are sourced from public APIs and third-party media providers.*
