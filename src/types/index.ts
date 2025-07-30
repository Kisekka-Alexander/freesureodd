export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: string;
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
export interface MatchInfo {
  home_team: string;
  away_team: string;
  league: string;
  match_date: string;
  match_status: "upcoming" | "live" | "completed";
}

export interface ModelInfo {
  model_version: string;
  model_name: string;
  training_accuracy: number;
  last_trained: string;
}

export interface Probabilities {
  home: number;
  draw: number;
  away: number;
}

export interface Prediction {
  match_id: number;
  predicted_outcome: "Home" | "Away" | "Draw";
  confidence: number; // 0-1 range
  probabilities: Probabilities;
  match_info: MatchInfo;
  model_info: ModelInfo;
  features_used: string[];
  predicted_at: string;
}

export interface PredictionsResponse {
  predictions: Prediction[];
  total_returned: number;
  total_available: number;
  limited: boolean;
  limit_applied: number;
}
