import axios from "axios";
import toast from "react-hot-toast";

// In production, the API calls will be proxied through Vercel
// In development, we'll use the direct URL
const baseURL =
  process.env.NODE_ENV === "production"
    ? "" // Empty string means use relative URLs, which will be handled by Vercel rewrites
    : process.env.NEXT_PUBLIC_API_URL || "http://3.135.230.49:8000";

export const api = axios.create({
  baseURL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/auth/signin";
      }
    }

    // Show error toast
    const message =
      error.response?.data?.message || error.message || "An error occurred";
    toast.error(message);

    return Promise.reject(error);
  }
);

// API functions
import {
  ApiResponse,
  Prediction,
  PredictionsResponse,
  LeaguesResponse,
  TeamsResponse,
  MatchesResponse,
  AccuracyAnalytics,
  TrendsAnalytics,
  HeadToHeadStats,
  TeamStats,
} from "@/types";

export const predictionsApi = {
  // Get all predictions with pagination
  getAllPredictions: async (params?: {
    limit?: number;
    offset?: number;
    league_id?: number;
    status?: "upcoming" | "live" | "completed";
    confidence_threshold?: number;
    sort_by?: "date" | "confidence" | "league";
    sort_order?: "asc" | "desc";
  }): Promise<ApiResponse<PredictionsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.league_id)
      queryParams.append("league_id", params.league_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.confidence_threshold)
      queryParams.append(
        "confidence_threshold",
        params.confidence_threshold.toString()
      );
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await api.get(
      `/v1/predictions/all?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get single prediction by ID
  getPrediction: async (id: string): Promise<ApiResponse<Prediction>> => {
    const response = await api.get(`/v1/predictions/${id}`);
    return response.data;
  },

  // Get bulk predictions
  getBulkPredictions: async (
    matchIds: number[]
  ): Promise<ApiResponse<PredictionsResponse>> => {
    const response = await api.post("/v1/predictions/bulk", {
      match_ids: matchIds,
      include_probabilities: true,
    });
    return response.data;
  },
};

export const leaguesApi = {
  // Get all leagues
  getLeagues: async (): Promise<ApiResponse<LeaguesResponse>> => {
    const response = await api.get("/v1/leagues");
    return response.data;
  },

  // Get league standings
  getLeagueStandings: async (
    leagueId: number
  ): Promise<ApiResponse<object>> => {
    const response = await api.get(`/v1/leagues/${leagueId}/standings`);
    return response.data;
  },

  // Get league top performers
  getLeagueTopPerformers: async (
    leagueId: number,
    metric: string = "goals"
  ): Promise<ApiResponse<object>> => {
    const response = await api.get(
      `/v1/leagues/${leagueId}/top-performers?metric=${metric}`
    );
    return response.data;
  },
};

export const teamsApi = {
  // Get all teams with pagination
  getTeams: async (params?: {
    limit?: number;
    offset?: number;
    league_id?: number;
    search?: string;
    sort_by?: "name" | "league";
    sort_order?: "asc" | "desc";
  }): Promise<ApiResponse<TeamsResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.offset) queryParams.append("offset", params.offset.toString());
    if (params?.league_id)
      queryParams.append("league_id", params.league_id.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    const response = await api.get(`/v1/teams?${queryParams.toString()}`);
    return response.data;
  },

  // Get single team stats
  getTeamStats: async (teamId: number): Promise<ApiResponse<TeamStats>> => {
    const response = await api.get(`/v1/teams/${teamId}/stats`);
    return response.data;
  },

  // Get team matches
  getTeamMatches: async (
    teamId: number,
    params?: {
      limit?: number;
      venue?: "home" | "away" | "all";
      status?: "upcoming" | "live" | "completed" | "all";
    }
  ): Promise<ApiResponse<MatchesResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.venue) queryParams.append("venue", params.venue);
    if (params?.status) queryParams.append("status", params.status);

    const response = await api.get(
      `/v1/teams/${teamId}/matches?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get head-to-head comparison
  getHeadToHead: async (
    team1Id: number,
    team2Id: number
  ): Promise<ApiResponse<HeadToHeadStats>> => {
    const response = await api.get(
      `/v1/teams/${team1Id}/head-to-head/${team2Id}`
    );
    return response.data;
  },
};

export const matchesApi = {
  // Get matches with pagination (Note: endpoint might be /v1/fixtures or similar)
  getMatches: async (params?: {
    page?: number;
    limit?: number;
    league_id?: number;
    status?: "upcoming" | "live" | "completed";
    team_id?: number;
    date_from?: string;
    date_to?: string;
    sort_by?: "date" | "league";
    sort_order?: "asc" | "desc";
  }): Promise<ApiResponse<MatchesResponse>> => {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.league_id)
      queryParams.append("league_id", params.league_id.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.team_id)
      queryParams.append("team_id", params.team_id.toString());
    if (params?.date_from) queryParams.append("date_from", params.date_from);
    if (params?.date_to) queryParams.append("date_to", params.date_to);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    // Try different possible endpoints based on the API structure
    try {
      const response = await api.get(`/v1/matches?${queryParams.toString()}`);
      return response.data;
    } catch {
      // Fallback to fixtures endpoint if matches doesn't work
      const response = await api.get(`/v1/fixtures?${queryParams.toString()}`);
      return response.data;
    }
  },

  // Get single match
  getMatch: async (matchId: number): Promise<ApiResponse<object>> => {
    const response = await api.get(`/v1/matches/${matchId}`);
    return response.data;
  },
};

export const analyticsApi = {
  // Get prediction accuracy analytics
  getAccuracyAnalytics: async (params?: {
    breakdown_by?: "league" | "outcome" | "date" | "overall";
  }): Promise<ApiResponse<AccuracyAnalytics>> => {
    const queryParams = new URLSearchParams();
    if (params?.breakdown_by)
      queryParams.append("breakdown_by", params.breakdown_by);

    const response = await api.get(
      `/v1/analytics/accuracy?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get performance trends
  getTrends: async (params?: {
    metric?: "accuracy" | "predictions_count" | "avg_confidence";
    period?: "7d" | "30d" | "90d" | "1y";
    league_id?: number;
    granularity?: "daily" | "weekly" | "monthly";
  }): Promise<ApiResponse<TrendsAnalytics>> => {
    const queryParams = new URLSearchParams();
    if (params?.metric) queryParams.append("metric", params.metric);
    if (params?.period) queryParams.append("period", params.period);
    if (params?.league_id)
      queryParams.append("league_id", params.league_id.toString());
    if (params?.granularity)
      queryParams.append("granularity", params.granularity);

    const response = await api.get(
      `/v1/analytics/trends?${queryParams.toString()}`
    );
    return response.data;
  },
};

export const systemApi = {
  // Get system health
  getHealth: async (): Promise<ApiResponse<object>> => {
    const response = await api.get("/v1/health");
    return response.data;
  },

  // Get WebSocket stats
  getWebSocketStats: async (): Promise<ApiResponse<object>> => {
    const response = await api.get("/ws/stats");
    return response.data;
  },
};

export default api;
