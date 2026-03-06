# ICC Men's T20 World Cup 2024 – Exploratory Data Analysis

## Project Overview
This project performs a comprehensive Exploratory Data Analysis (EDA) of the ICC Men's T20 World Cup 2024 using Python. The aim of the project is to analyze player and team performance using statistical methods and visualizations.

The analysis helps identify important patterns such as top-performing batsmen, effective bowlers, and overall match trends throughout the tournament.

---

## Objectives

The main objectives of this project are:

- Analyze batting performance across the tournament
- Identify the top run scorers and players with high strike rates
- Evaluate bowling performance using wickets, economy rate, and dot balls
- Compare player performance using statistical metrics
- Visualize patterns and trends using graphs and charts
- Generate meaningful insights from match data

---

## Dataset

The analysis uses two main datasets.

### Deliveries Dataset
This dataset contains ball-by-ball details of every match played in the tournament.

Important attributes include:
- Match ID
- Batter
- Bowler
- Runs scored
- Ball number
- Extras
- Boundaries
- Dot balls

### Matches Dataset
This dataset contains match-level information such as:
- Match ID
- Teams
- Venue
- Match date
- Toss result
- Match winner

---

## Technologies Used

- Python
- Pandas
- NumPy
- Matplotlib
- Seaborn
- Plotly
- Jupyter Notebook

---

## Data Cleaning and Preprocessing

Before performing analysis, several preprocessing steps were carried out:

- Handling missing values
- Removing unnecessary columns
- Converting date columns into proper formats
- Creating aggregated statistics for players and matches

---

## Batting Performance Analysis

The batting analysis focuses on key metrics such as:

- Total runs scored
- Batting averages
- Strike rates
- Number of boundaries
- Balls faced

This helps identify the most consistent and aggressive batsmen in the tournament.

---

## Bowling Performance Analysis

Bowling performance is analyzed using:

- Total wickets taken
- Economy rate
- Runs conceded
- Balls bowled
- Dot balls

This helps identify bowlers who maintained strong control during matches.

---

## Visualizations

The project includes multiple visualizations to better understand the data:

- Bar charts
- Player comparison graphs
- Boundary distribution plots
- Wicket leaderboards
- Economy rate analysis

These visualizations reveal trends and patterns in the tournament.

---

## Key Insights

The analysis identifies:

- Top run scorers in the tournament
- Bowlers with the highest wickets
- Players with the best strike rates
- Boundary scoring patterns
- Bowlers with strong economy rates

---

## Project Structure

```
T20-WorldCup-2024-EDA
│
├── T20_WorldCup_2024_EDA.ipynb
├── datasets/
│   ├── deliveries.csv
│   └── matches.csv
└── README.md
```

---

## How to Run the Project

1. Clone the repository

```
git clone https://github.com/yourusername/T20-WorldCup-EDA.git
```

2. Install required libraries

```
pip install pandas numpy matplotlib seaborn plotly jupyter
```

3. Launch Jupyter Notebook

```
jupyter notebook
```

4. Open and run:

```
T20_WorldCup_2024_EDA.ipynb
```

---

## Future Improvements

Possible extensions of this project include:

- Predicting match outcomes using machine learning
- Player performance prediction
- Team win probability analysis
- Interactive dashboards using Streamlit or Power BI

---

## License

This project is created for educational and analytical purposes.
