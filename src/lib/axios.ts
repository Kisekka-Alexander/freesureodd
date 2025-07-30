import axios from "axios";
import toast from "react-hot-toast";

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

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

// Prediction API functions
import { ApiResponse, Prediction, PredictionsResponse } from "@/types";

export const predictionsApi = {
  // Get all predictions
  getAllPredictions: async (): Promise<ApiResponse<PredictionsResponse>> => {
    const response = await api.get("/v1/predictions/all");
    return response.data;
  },

  // Get single prediction by ID
  getPrediction: async (id: string): Promise<ApiResponse<Prediction>> => {
    const response = await api.get(`/v1/predictions/${id}`);
    return response.data;
  },
};

export default api;
