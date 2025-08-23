export interface PredefinedLeague {
  league_id: number;
  name: string;
  country: string;
  count: number;
}

export const predefinedPopularLeagues: PredefinedLeague[] = [
  { league_id: 135, name: "Serie A", country: "Italy", count: 20 },
  { league_id: 140, name: "La Liga", country: "Spain", count: 20 },
  { league_id: 39, name: "Premier League", country: "England", count: 20 },
  { league_id: 88, name: "Eredivisie", country: "Netherlands", count: 18 },
  { league_id: 144, name: "Jupiler Pro League", country: "Belgium", count: 16 },
  { league_id: 61, name: "Ligue 1", country: "France", count: 20 },
  { league_id: 94, name: "Primeira Liga", country: "Portugal", count: 18 },
  { league_id: 307, name: "Pro League", country: "Saudi Arabia", count: 16 },
  { league_id: 78, name: "Bundesliga", country: "Germany", count: 18 },
  { league_id: 71, name: "Serie A", country: "Brazil", count: 20 },
  { league_id: 179, name: "Premiership", country: "Scotland", count: 12 },
];
