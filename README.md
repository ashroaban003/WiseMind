# wiseMind

> Enjoyable, gentle daily memory and cognitive engagement activities designed for older adults, inspired by classic wooden tabletop puzzles.

---

## 📖 Overview

**wiseMind** is a web-based cognitive engagement platform designed with older adults in mind. Inspired by the warmth of heirloom wooden board games and tactile tabletop puzzles, it provides stimulating daily mental exercises without the clinical stress, aggressive timers, or predatory microtransactions of traditional "brain training" apps.

Every puzzle emphasizes clarity, dignity, and relaxation: large readable typography, generous click/tap zones (48px+), high-contrast warm palettes, gentle acoustic soundscapes, and encouraging positive reinforcement.

---

## 🧩 Available Games

| Activity | Cognitive Focus | Description |
|---|---|---|
| **Grid Memory** | Visual & Spatial Recall | Memorize and recreate illuminated patterns on a handcrafted 3×3, 4×4, or 5×5 wooden tile grid. Includes adaptive difficulty and recovery rounds. |
| **Sequence Memory** | Working Memory & Pathfinding | Watch a progressive sequence of lighting wooden blocks and repeat the order. Accompanied by soothing pentatonic musical tones. |
| **Arrow Finder** | Visual-Spatial Attention & Focus | Scan a field of wooden directional arrows to determine the dominant direction under gentle, low-pressure pacing. |
| **Memory Locker** | Digit Span & Working Memory | Memorize combination codes to unlock a vintage brass-and-wood vault door using an engraved numeric keypad. |
| **Impulse Match** | Cognitive Inhibition & Association | Memorize vintage nostalgic objects (rotary phone, cassette tape, typewriter, teacup, etc.) categorized by shelf, then react accurately as objects appear. |

---

## ✨ Key Features

- **Random Daily Activity**: Clicking **"Play Today's Game"** dynamically selects a fresh activity from the collection, keeping daily routines engaging.
- **Tactile Wooden Aesthetic**: Warm wood grains, soft parchment backgrounds, brass accents, and subtle tactile button depths.
- **Senior-Friendly Accessibility**:
  - Minimum 18px–24px text with high WCAG-compliant color contrast.
  - Generous button padding and touch targets exceeding 48px.
  - Skip links and screen-reader accessible attributes.
- **Gentle Audio Experience**: Built-in Web Audio API synthesizer generates organic wooden chimes and pentatonic harmonies without loud, jarring buzzers. Sound can be toggled on or off at any time.
- **Zero-Stress Difficulty Progression**:
  - Choose between Easy, Medium, and Hard at any time.
  - Optional level-up prompt appears only after consistent success.
  - No penalizing "Game Over" or flashing red error states.
- **Private, Local Persistence**:
  - High scores, consecutive win streaks, and daily play counts persist safely in browser `localStorage`.
  - Automatic daily reset for daily counters while preserving lifetime high scores.
- **Production-Ready SPA**:
  - Full client-side routing with direct URL support (`/games/grid-memory`, `/games/impulse-match`, etc.).
  - Includes `vercel.json` rewrites to support seamless browser refreshes on all deep links.

---

## 🛠️ Tech Stack

- **UI Library**: React 19
- **Language**: TypeScript 5.8
- **Build Tool / Bundler**: Vite 6
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`)
- **Icons**: Lucide React
- **Audio**: Web Audio API (procedural harmonic chimes, zero external audio assets)
- **Deployment**: Static SPA compatible with Vercel, Netlify, Cloudflare Pages, or GitHub Pages

---

## ⚙️ Environment Variables

**None required.**

The application is completely self-contained and operates entirely client-side. There are no backend APIs, third-party authentication services, or cloud database credentials necessary to run or deploy.

---

## 🚀 Getting Started (Local Setup)

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- `npm` (or `pnpm` / `yarn` / `bun`)

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/daily-mind-games.git
cd daily-mind-games
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

This compiles the application to the `dist/` directory.

To preview the production build locally:

```bash
npm run preview
```

---

## ☁️ Deploying to Vercel

The project is pre-configured with `vercel.json` for one-click deployment to Vercel.

### Method 1: Via Vercel Web Dashboard (Recommended)

1. Push your repository to **GitHub**.
2. Go to [vercel.com/new](https://vercel.com/new) and log in.
3. Import the `daily-mind-games` repository.
4. Vercel will automatically detect the **Vite** framework preset:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Leave **Environment Variables** empty (none needed).
6. Click **Deploy**.

### Method 2: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the prompts; Vercel will build and deploy the application in seconds.

---

## 📁 Repository Structure

```
├── public/                 # Static assets
├── src/
│   ├── assets/             # Handcrafted images & nostalgic object webp assets
│   ├── components/         # Reusable UI components (Header, Footer, Button, Modal)
│   ├── games/              # Game implementations
│   │   ├── grid-memory/    # Grid Memory game
│   │   ├── sequence-memory/# Sequence Memory game
│   │   ├── arrow-finder/   # Arrow Finder game
│   │   ├── memory-locker/  # Memory Locker vault game
│   │   ├── impulse-match/  # Impulse Match nostalgic sorting game
│   │   └── registry.ts     # Central game definitions & lookup
│   ├── pages/              # Top-level pages (Home, Games, How It Works, About)
│   ├── utils/              # Local storage score & streak manager
│   ├── App.tsx             # Root routing and shell layout
│   ├── main.tsx            # React application entry point
│   ├── index.css           # Tailwind CSS imports & custom wooden theme utilities
│   └── types.ts            # Global TypeScript types & game interfaces
├── index.html              # HTML5 entry template
├── package.json            # Scripts & dependencies
├── tsconfig.json           # TypeScript configuration
├── vercel.json             # Vercel SPA routing rewrite rules
└── vite.config.ts          # Vite build & Tailwind plugin configuration
```

---

## 📄 License

MIT License. Feel free to use, modify, and distribute this project.
