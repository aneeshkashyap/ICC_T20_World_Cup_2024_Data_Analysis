# ICC Men's T20 World Cup 2024 – Exploratory Data Analysis & Interactive Dashboard

## Project Overview
This project performs a comprehensive Exploratory Data Analysis (EDA) of the ICC Men's T20 World Cup 2024 using Python, and presents the findings in a production-ready, interactive web dashboard.

The platform has been upgraded to a **modern, high-performance React application** featuring a cinematic design, glassmorphism UI components, fluid Framer Motion animations, and data-driven Recharts visualizations. The interface provides a professional sports analytics experience for exploring tournament statistics, charting data trends, and analyzing player/team performances.

---

## Features

- **Cinematic Web Dashboard:** A sleek, fully responsive React application styled with an authentic ICC-inspired Navy/Gold palette, using advanced glassmorphism techniques.
- **Animated Hero & Stats Ticker:** Features a bold split-layout hero section and a live, broadcast-style scrolling stats ticker.
- **Match Centre Grid:** Filterable, interactive grid displaying all 52 tournament matches with "Live Data" badges and hover-lift dynamics.
- **Premium Player Profiles:** Large circular player avatars with dynamic SVG arc progress rings for runs, wickets, strike rate, and economy.
- **National Flags Integration:** Built-in mapping utilizing optimized CDNs to display high-quality circular and rectangular national flags for all 20 participating teams.
- **Data Visualizations:** Interactive Bar charts powered by Recharts, enabling users to tab between Top Runs, Strike Rates, Economy, and Wickets.
- **Performant & Animated:** Uses `framer-motion` for staggered entry animations, layout transitions, and interactive hover states while utilizing React's `memo` and deferred values for optimized rendering.

## Project Structure

```text
T20-WorldCup-2024-EDA
│
├── T20_WorldCup_2024_EDA.ipynb  (Original EDA Notebook)
├── datasets/                    (Raw CSV data)
├── scorecards_generate.py       (Python script to generate JSON from CSVs)
├── react-dashboard/             (NEW: Modern Frontend App)
│   ├── src/                     (React Source Code)
│   │   ├── components/          (React UI Components: PlayerCard, MatchCard, etc.)
│   │   ├── pages/               (Dashboard.jsx Main Page Layout)
│   │   ├── index.css            (Tailwind & Custom CSS with glassmorphism)
│   │   ├── hooks.js             (Custom React hooks)
│   │   ├── utils.js             (Utility parsing & flag mappings)
│   │   └── data.json            (Aggregated Tournament Data)
│   ├── public/                  (Static assets: hero stadium image, svgs)
│   ├── tailwind.config.js       (Tailwind theme tokens and animations)
│   ├── vite.config.js           (Vite bundler config)
│   └── package.json             (NPM Dependencies)
├── README.md
└── prd.md                       (Product Requirements Document)
```

## How to Run the Dashboard

1. Clone the repository.
2. Open a terminal and navigate to the newly built React dashboard directory:
   ```bash
   cd react-dashboard
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the local development server:
   ```bash
   npm run dev
   ```
5. Open your web browser and navigate to the provided localhost URL (e.g., `http://localhost:5173`)

## Technologies Used
- **Frontend Framework:** React 18
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Data Visualization:** Recharts
- **Build Tool:** Vite
- **Data Processing:** Python, Pandas, Jupyter Notebook

---

## License

This project is created for educational and analytical purposes, utilizing strictly open-source match data.
