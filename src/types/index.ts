export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
}

// NextAuth type extensions
declare module "next-auth" {
  interface User {
    id: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface FormikHelpers<Values> {
  setSubmitting: (isSubmitting: boolean) => void;
  setErrors: (errors: Partial<Values>) => void;
  setStatus: (status?: unknown) => void;
}

// Football Prediction Types (Updated for real backend)
// Prediction Types UPdated to match the new backend structure
export interface Probabilities {
  Home: number;
  Draw: number;
  Away: number;
}

export interface ModelInfo {
  version: string;
  name: string;
}

export interface PredictionData {
  predicted_outcome: "Home" | "Away" | "Draw";
  confidence: number;

  probabilities: Probabilities;
  model_info: ModelInfo;
  predicted_at: string;
  error?: string;
}

export interface Prediction {
  match_id: number;
  league_name: string;
  home_team: string;
  away_team: string;
  home_odds: string;
  draw_odds: string;
  away_odds: string;
  match_date: string;
  match_status: "upcoming" | "live" | "completed";
  prediction: PredictionData;
}

export interface PaginationInfo {
  total_count: number;
  current_page: number;
  total_pages: number;
  has_next: boolean;
  has_previous: boolean;
}

export interface PredictionsResponse {
  predictions: Prediction[];
  pagination: PaginationInfo;
}

// League Types
export interface League {
  league_id: number;
  league_name: string;
  country: string;
  team_count: number;
  logo_url: string;
  season_name?: string | null;
}

export interface LeaguesResponse {
  leagues: League[];
  total_count: number;
}

// Helper types for better league data handling
export interface UniqueLeague {
  league_id: number;
  league_name: string;
  country: string;
  logo_url: string;
  seasons: LeagueSeason[];
}

export interface LeagueSeason {
  season_name: string | null;
  team_count: number;
}

// Team Types
export interface TeamLeague {
  league_id: number;
  league_name: string;
  country: string;
}

export interface Team {
  team_id: number;
  team_name: string;
  league: TeamLeague;
  logo_url: string;
}

export interface TeamsResponse {
  teams: Team[];
  total_count: number;
}

// Analytics Types
export interface AccuracyAnalytics {
  overall_accuracy: number;
  breakdown: Record<string, number | object>;
  timeframe: string;
}

export interface TrendsData {
  date: string;
  value: number;
}

export interface TrendsAnalytics {
  metric: string;
  period: string;
  data: TrendsData[];
  summary: {
    total_points: number;
    trend_direction: "up" | "down" | "stable";
    change_percentage: number;
  };
}

// Match Types
export interface Match {
  match_id: number;
  home_team: string;
  away_team: string;
  league_name: string;
  match_date: string;
  match_status: "upcoming" | "live" | "completed";
  home_score?: number;
  away_score?: number;
}

export interface MatchesResponse {
  matches: Match[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Head to Head Types
export interface HeadToHeadStats {
  total_matches: number;
  home_wins: number;
  away_wins: number;
  draws: number;
  recent_matches: Match[];
}

// Team Stats Types
export interface TeamStats {
  team_id: number;
  team_name: string;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  win_percentage: number;
  form: string[];
}

// Standings Types
export interface StandingTeam {
  team_id: number;
  team_name: string;
}

export interface Standing {
  position: number;
  team: StandingTeam;
  matches_played: number;
  wins: number;
  draws: number;
  losses: number;
  goals_scored: number;
  goals_conceded: number;
  goal_difference: number;
  points: number;
  form: string;
  points_per_match: number;
}

export interface StandingsLeague {
  league_id: number;
  league_name: string;
  country: string;
}

export interface StandingsData {
  league: StandingsLeague;
  standings: Standing[];
}

export interface StandingsResponse {
  success: boolean;
  timestamp: string;
  data: StandingsData;
}
