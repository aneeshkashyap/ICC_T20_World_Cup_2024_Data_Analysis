import pandas as pd
import json
import math
import numpy as np

class NpEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, (np.integer,)): return int(obj)
        if isinstance(obj, (np.floating,)): return float(obj) if not math.isnan(obj) else None
        if isinstance(obj, np.ndarray): return obj.tolist()
        return super().default(obj)

del_df = pd.read_csv('deliveries.csv')
mat_df = pd.read_csv('matches.csv')

# Build scorecards keyed by match_number
scorecards = {}

for _, match in mat_df.iterrows():
    mn = int(match['match_number'])
    # deliveries.csv match_id is 0-indexed (match_id 0 = match_number 1)
    mdf = del_df[del_df['match_id'] == (mn - 1)]
    
    innings_scorecards = []

    for inning_num in sorted(mdf['innings'].unique()):
        idf = mdf[mdf['innings'] == inning_num]
        if idf.empty:
            continue

        batting_team = idf['batting_team'].iloc[0]
        bowling_team = idf['bowling_team'].iloc[0]

        # ---- BATTING SCORECARD ----
        batters = {}
        for _, ball in idf.iterrows():
            striker = ball['striker']
            if striker not in batters:
                batters[striker] = {'runs': 0, 'balls': 0, 'fours': 0, 'sixes': 0,
                                    'how_out': 'not out', 'bowler': '', 'order': len(batters)+1}
            robs = ball['runs_off_bat'] if not pd.isna(ball['runs_off_bat']) else 0
            batters[striker]['runs'] += int(robs)
            wides = ball['wides'] if not pd.isna(ball['wides']) else 0
            if wides == 0:
                batters[striker]['balls'] += 1
            if int(robs) == 4:
                batters[striker]['fours'] += 1
            if int(robs) == 6:
                batters[striker]['sixes'] += 1
            # Wicket
            if not pd.isna(ball['wicket_type']) and ball['player_dismissed'] == striker:
                wtype = ball['wicket_type']
                bowler = ball['bowler']
                if wtype in ('caught','bowled','lbw','caught and bowled','stumped'):
                    batters[striker]['how_out'] = f"{wtype} b {bowler}"
                    batters[striker]['bowler'] = bowler
                elif wtype == 'run out':
                    batters[striker]['how_out'] = 'run out'
                else:
                    batters[striker]['how_out'] = wtype

        batting_list = sorted(batters.items(), key=lambda x: x[1]['order'])
        batting_rows = []
        for name, b in batting_list:
            sr = round((b['runs'] / b['balls']) * 100, 1) if b['balls'] > 0 else 0.0
            batting_rows.append({
                'name': name,
                'runs': b['runs'],
                'balls': b['balls'],
                'fours': b['fours'],
                'sixes': b['sixes'],
                'sr': sr,
                'how_out': b['how_out'],
            })

        # Extras & Total
        extras = int(idf['extras'].fillna(0).sum())
        total_runs = int(idf['runs_off_bat'].fillna(0).sum()) + extras
        wickets = int(idf[~idf['wicket_type'].isna()].shape[0])
        balls_bowled = len(idf[idf['wides'].fillna(0) == 0])
        overs_str = f"{balls_bowled // 6}.{balls_bowled % 6}"

        # ---- BOWLING SCORECARD ----
        bowlers = {}
        for _, ball in idf.iterrows():
            bwlr = ball['bowler']
            if bwlr not in bowlers:
                bowlers[bwlr] = {'balls': 0, 'runs': 0, 'wickets': 0, 'wides': 0, 'noballs': 0, 'maidens': 0}
            wides = ball['wides'] if not pd.isna(ball['wides']) else 0
            nb = ball['noballs'] if not pd.isna(ball['noballs']) else 0
            if wides == 0:
                bowlers[bwlr]['balls'] += 1
            bowlers[bwlr]['runs'] += int(ball['runs_off_bat'] or 0) + int(wides) + int(nb)
            bowlers[bwlr]['wides'] += int(wides)
            bowlers[bwlr]['noballs'] += int(nb)
            if not pd.isna(ball['wicket_type']) and ball['wicket_type'] not in ('run out', 'retired hurt', 'obstructing the field'):
                bowlers[bwlr]['wickets'] += 1

        # Calculate maidens per over
        for bwlr in bowlers:
            bdf = idf[idf['bowler'] == bwlr]
            maiden_count = 0
            for ov in bdf['ball'].apply(lambda b: int(str(b).split('.')[0])).unique():
                over_balls = bdf[bdf['ball'].apply(lambda b: int(str(b).split('.')[0])) == ov]
                if over_balls['runs_off_bat'].fillna(0).sum() + over_balls['extras'].fillna(0).sum() == 0:
                    maiden_count += 1
            bowlers[bwlr]['maidens'] = maiden_count

        bowling_rows = []
        for name, b in bowlers.items():
            balls = b['balls']
            overs_dec = f"{balls // 6}.{balls % 6}"
            econ = round(b['runs'] / (balls / 6), 2) if balls > 0 else 0.0
            bowling_rows.append({
                'name': name,
                'overs': overs_dec,
                'maidens': b['maidens'],
                'runs': b['runs'],
                'wickets': b['wickets'],
                'wides': b['wides'],
                'noballs': b['noballs'],
                'economy': econ,
            })

        innings_scorecards.append({
            'innings': inning_num,
            'batting_team': batting_team,
            'bowling_team': bowling_team,
            'batting': batting_rows,
            'bowling': bowling_rows,
            'total_runs': total_runs,
            'total_wickets': wickets,
            'overs': overs_str,
            'extras': extras,
        })

    scorecards[mn] = innings_scorecards

# Write output
out = json.dumps(scorecards, cls=NpEncoder)
with open('react-dashboard/src/scorecards.json', 'w', encoding='utf-8') as f:
    f.write(out)

print(f'Done! Generated scorecards for {len(scorecards)} matches.')
print(f'Sample match 1 innings: {len(scorecards[1])} innings')
print(f'Sample batting row: {scorecards[1][0]["batting"][0]}')
