# ICC Men's T20 World Cup 2024 – Exploratory Data Analysis & Interactive Dashboard

## Project Overview
This project performs a comprehensive Exploratory Data Analysis (EDA) of the ICC Men's T20 World Cup 2024 using Python, and presents the findings in a production-ready, interactive web dashboard built with HTML, CSS, Vanilla JavaScript, and Chart.js.

The platform provides a professional, ICC-style interface that allows users to explore tournament statistics, visualize data trends, and analyze individual player and team performances.

---

## Features

- **Interactive Web Dashboard:** A sleek, fully responsive web application styled with authentic ICC branding (Navy/Gold palette).
- **Match Centre:** Filterable grid displaying the outcome and statistics of all 52 tournament matches.
- **Dynamic Player Profiles:** Automatically fetches and displays real player profile photos using the Wikipedia API. Includes a smart initial-badge fallback system.
- **National Flags Integration:** Uses an optimized CDN (`flagcdn.com`) to consistently display high-quality circular national flags for all 20 participating teams.
- **Data Visualizations:** Interactive Bar, Doughnut, and Line charts powered by Chart.js representing strike rates, economy rates, win distributions, and toss decisions.
- **Top Performers Showcase:** Highlights leading run-scorers and wicket-takers in a curated display grid.
- **Performance Optimized:** Uses `loading="lazy"`, object-fit bounding, and minified data mappings to ensure lightning-fast page loading and interaction.

## Project Structure

```text
T20-WorldCup-2024-EDA
│
├── T20_WorldCup_2024_EDA.ipynb (Original EDA Notebook)
├── datasets/
│   ├── deliveries.csv
│   └── matches.csv
├── website/
│   ├── index.html       (Main Dashboard UI)
│   ├── style.css        (Custom Design System)
│   ├── main.js          (Dashboard Logic & Chart Rendering)
│   ├── data.js          (Generated JSON Data mapped from EDA)
│   ├── playerPhotos.js  (Wikipedia Image Mappings)
│   └── images/          (Locally cached high-res assets)
├── README.md
└── prd.md               (Product Requirements Document)
```

## How to Run the Dashboard

1. Clone the repository.
2. Open a terminal and navigate to the project root directory.
3. Start a local Python server:
   ```bash
   python -m http.server 8765 --directory website
   ```
4. Open your web browser and navigate to `http://localhost:8765`

## Technologies Used
- **Frontend Dashboard:** HTML5, CSS3, Vanilla JS (ES6+), Chart.js
- **APIs:** Wikipedia PageImages API, FlagCDN
- **EDA Analytics:** Python, Pandas, Matplotlib, Jupyter Notebook

---

## License

This project is created for educational and analytical purposes, utilizing strictly open-source match data.
