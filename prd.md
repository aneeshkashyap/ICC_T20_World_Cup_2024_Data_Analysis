# Product Requirements Document (PRD)

**Project:** ICC Men's T20 World Cup 2024 Interactive Dashboard

## 1. Objective
Transform standard CSV tournament data into a visually striking, professional web dashboard that emulates the look, feel, and functionality of the official ICC cricket portals.

## 2. Design & UI/UX Requirements
- **Theme:** Clean, premium sports UI matching ICC branding (Deep Navy `#0a1628`, Gold `#c9a227`, and White accents).
- **Typography:** Professional fonts (e.g., Barlow Condensed, Inter) for bold headings and readable data tables.
- **Interactivity:** Fluid hover animations, subtle drop-shadows on cards, and tooltip overlays for data points.
- **Responsiveness:** Ensure layout scales flawlessly across Mobile, Tablet, and Desktop without image distortion or layout shift.

## 3. Core Features
- **Hero Section:** Split layout highlighting key tournament aggregates alongside background ICC watermark and cricket-themed geometric accents.
- **Stats Dashboard:** Card-based metrics showcasing Total Matches (52), Total Runs, Wickets, Boundaries, and the Champion (India).
- **Match Centre:** A dynamic grid of matches natively filterable by tournament stage (Group, Semi-Final, Final) and fully searchable by typing.
- **Rankings & Insights:** Data storytelling segments tracking Win/Loss percentages, Toss Strategies, and Team Win Tallies via Doughnut and Bar charts.
- **Batting & Bowling Hubs:** Detailed tabular data sorting players by Runs, Strike Rate, Wickets, dots, and Economy Rate. Incorporates interactive line-charts for Strike Rates mapped against Run totals.

## 4. Media & API Integration
### National Flags (Mandatory)
- Map internal team representations to strict ISO country codes.
- Utilize highly optimized CDN links (`https://flagcdn.com/w40/{country_code}.png`).
- Implement 32x24px rounded rectangles with custom drop-shadows.
- Implement explicit fallback handling (`onerror="..."`) to prevent broken links.

### Player Portraits
- Connect to the Wikipedia Media API to dynamically hydrate the dashboard with high-resolution professional player portraits.
- Format strictly as circular avatars alongside data tables.
- **Fallback System:** If a player is absent from Wikipedia databases, map cleanly to a dynamic badge matching their underlying team's hex color, incorporating their properly parsed initials (e.g., `A. Nortje` -> `AN`).

## 5. Performance
- Native execution without bloated frontend libraries—stick strictly to Vanilla Javascript, manual DOM intersection observers, and CSS variables.
- Implement `loading="lazy"` across all dynamically generated media components to heavily reduce initial render overhead.
- Handle memory limits dynamically; Ensure Chart.js instances are completely destroyed and re-initialized gracefully during data sorting interactions to prevent performance deterioration.

## 6. Target Audience
Cricket analysts, fans, and data enthusiasts looking for a highly polished exploratory representation of the 2024 T20 World Cup far beyond raw spreadsheet data.
