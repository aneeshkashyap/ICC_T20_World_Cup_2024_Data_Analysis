export const teamFlags = {
  'India':                      'https://flagcdn.com/w40/in.png',
  'South Africa':               'https://flagcdn.com/w40/za.png',
  'Australia':                  'https://flagcdn.com/w40/au.png',
  'England':                    'https://flagcdn.com/w40/gb-eng.png',
  'West Indies':                '/ICC_T20_World_Cup_2024_Data_Analysis/flag-west-indies.svg',
  'Afghanistan':                'https://flagcdn.com/w40/af.png',
  'Bangladesh':                 'https://flagcdn.com/w40/bd.png',
  'Pakistan':                   'https://flagcdn.com/w40/pk.png',
  'New Zealand':                'https://flagcdn.com/w40/nz.png',
  'Sri Lanka':                  'https://flagcdn.com/w40/lk.png',
  'Ireland':                    'https://flagcdn.com/w40/ie.png',
  'Scotland':                   'https://flagcdn.com/w80/gb-sct.png',
  'Netherlands':                'https://flagcdn.com/w40/nl.png',
  'Canada':                     'https://flagcdn.com/w40/ca.png',
  'Uganda':                     'https://flagcdn.com/w40/ug.png',
  'Namibia':                    'https://flagcdn.com/w40/na.png',
  'Oman':                       'https://flagcdn.com/w40/om.png',
  'Nepal':                      'https://flagcdn.com/w40/np.png',
  'Papua New Guinea':           'https://flagcdn.com/w40/pg.png',
  'United States of America':   'https://flagcdn.com/w40/us.png',
};

const teamFlagCodes = {
  'India': 'in', 'South Africa': 'za', 'Australia': 'au', 'England': 'gb-eng',
  'West Indies': 'wi', 'Afghanistan': 'af', 'Bangladesh': 'bd', 'Pakistan': 'pk',
  'New Zealand': 'nz', 'Sri Lanka': 'lk', 'Ireland': 'ie', 'Scotland': 'gb-sct',
  'Netherlands': 'nl', 'Canada': 'ca', 'Uganda': 'ug', 'Namibia': 'na',
  'Oman': 'om', 'Nepal': 'np', 'Papua New Guinea': 'pg',
  'United States of America': 'us'
};

export const getFlag = (teamName) => teamFlags[teamName] || 'https://flagcdn.com/w40/un.png';

export const getFlagCode = (teamName) => teamFlagCodes[teamName] || 'un';

/**
 * Normalize a raw overs value (string or number) to a valid T20 overs string.
 *
 * Rules:
 *  - The decimal part represents balls (0–5). Balls ≥ 6 carry over:
 *      19.6 → 20.0    18.7 → 19.1
 *  - Total overs (after normalization) are capped at 20.0.
 *  - Returns '—' for null / undefined / NaN input.
 *
 * @param {string|number} raw
 * @returns {string}  e.g. '17.3', '20.0'
 */
export const formatOvers = (raw) => {
  const n = parseFloat(raw);
  if (isNaN(n) || raw == null) return '—';

  // Split into whole overs and balls (decimal digit)
  const wholeOvers = Math.floor(n);
  // Use one decimal digit: 13.14 → 1 ball, 19.6 → 6 balls
  const balls = Math.round((n - wholeOvers) * 10);

  // Convert total balls to overs + remainder
  const totalBalls = wholeOvers * 6 + balls;
  const normalizedOvers = Math.floor(totalBalls / 6);
  const normalizedBalls = totalBalls % 6;

  // Cap at 20.0
  if (normalizedOvers >= 20) return '20.0';

  return `${normalizedOvers}.${normalizedBalls}`;
};
