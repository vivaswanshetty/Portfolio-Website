# Vivaswan Shetty | Developer Portfolio

A premium, minimalist, and responsive personal portfolio website showcasing engineering projects, academic milestones, skills, and work timeline. 

🔗 **Live Link**: [elevatex-one.vercel.app](https://elevatex-one.vercel.app) *(or your deployed custom domain)*

---

## ✨ Features & Design Aesthetics

* **Premium Typography**: Styled with **Inter** (featuring a tight `-0.035em` tracking for a minimal, editorial layout) and **Space Grotesk** (for technical elements).
* **Ambient Interactivity**: Dynamic dark-mode theme utilizing iOS-style backdrop glassmorphism, glowing radial backdrops, and active starfield particle effects.
* **Responsive 3-Column Profile Section**: Featuring an AI-cleaned portrait picture, a detailed biography, and interactive counting cards (tracking lines of code, caffeine, hours in flow, and bugs squashed).
* **Multi-Repository Project Showcase**: Showcases full-stack software developments like **ElevateX** and **ConquerONE** with separate links for Web repositories, Mobile (React Native) repositories, and Live sites.
* **Unified Data Structure**: Uses `src/data/portfolioData.js` as a single source of truth to change texts, links, education timelines, and projects instantly without altering React components.
* **Performance Focused**: Snappy micro-animations powered by **Framer Motion** with custom delays mapped to viewport intersections.

---

## 🛠️ Technology Stack

* **Core**: React 18, Vite
* **Styling**: Vanilla CSS, Flexbox/CSS Grid layouts
* **Animations**: Framer Motion
* **Icons**: Lucide React
* **Router**: React Router DOM (v6)

---

## 📁 Project Structure

```text
myportfolio/
├── public/                 # Static assets
├── src/
│   ├── assets/             # Images, logos, and portrait picture
│   ├── components/         # Modular React views (Hero, About, Projects, Resume, etc.)
│   ├── data/
│   │   └── portfolioData.js # CONFIG: Single source of truth for portfolio contents
│   ├── hooks/              # Custom React hooks (scroll reveal utilities)
│   ├── App.jsx             # Route definitions and page transition wrappers
│   ├── index.css           # Global design tokens, gradients, variables & scroll bars
│   └── main.jsx            # React root element mounting
├── vercel.json             # Rewrites rules to prevent routing 404s on refresh
└── vite.config.js          # Vite compiler and asset bundler configurations
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have Node.js (v18+) and npm installed on your system.

### Installation

1. Clone this repository to your local machine:
   ```bash
   git clone https://github.com/vivaswanshetty/Portfolio-Website.git
   cd Portfolio-Website
   ```

2. Install the project dependencies:
   ```bash
   npm install
   ```

3. Launch the local development server:
   ```bash
   npm run dev
   ```
   *The site will be available locally at `http://localhost:5173` (or the next available port).*

### Build for Production

To compile the application into lightweight, optimized static assets ready for production hosting:
```bash
npm run build
```
This generates a build bundle inside the `dist/` directory.

---

## 🌐 Deployment Configuration

This codebase includes a pre-configured [vercel.json](./vercel.json) routing configuration to automatically map all sub-routes (`/about`, `/projects`, `/resume`, etc.) to `index.html` on Vercel. This secures the application from returning `404 Not Found` errors when page refreshes are triggered in production.
