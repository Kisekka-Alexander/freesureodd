"use client";

import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { PredictionsTable } from "@/components/predictions-table";
import { predictionsApi } from "@/lib/axios";
import { Prediction } from "@/types";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await predictionsApi.getAllPredictions();

        if (response.success) {
          setPredictions(response.data.predictions); // Extract predictions from nested data
          toast.success(
            `${response.data.total_returned} predictions loaded successfully!`
          );
        } else {
          throw new Error(response.message || "Failed to fetch predictions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch predictions";
        setError(errorMessage);
        console.error("Error fetching predictions:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  return (
    <main className="min-h-screen">
      <Hero />

      {/* Predictions Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Latest Predictions
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Get the most accurate football predictions based on mathematical
              analysis and statistical data.
            </p>

            {/* View Toggle */}
            <div className="flex justify-center mb-6">
              <div className="bg-white rounded-lg p-1 shadow-sm border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📊 Table View
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === "cards"
                      ? "bg-blue-500 text-white"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  📋 Card View
                </button>
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading predictions...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 max-w-md mx-auto">
                <p className="font-medium">Error loading predictions</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && predictions.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No predictions available at the moment.
              </p>
            </div>
          )}

          {!loading && !error && predictions.length > 0 && (
            <div>
              {viewMode === "table" ? (
                <PredictionsTable predictions={predictions} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.match_id}
                      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {prediction.match_info.league} •{" "}
                          {new Date(
                            prediction.match_info.match_date
                          ).toLocaleDateString()}
                        </div>
                        <div className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          {Math.round(prediction.confidence * 100)}% confidence
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold">
                            {prediction.match_info.home_team}
                          </div>
                          <div className="text-gray-400">vs</div>
                          <div className="text-lg font-semibold">
                            {prediction.match_info.away_team}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4">
                        <div className="text-sm text-gray-600 mb-1">
                          Predicted Outcome:
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {prediction.predicted_outcome}
                        </div>
                      </div>
                      <div className="flex space-x-4 text-sm">
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Home</div>
                          <div className="font-medium">
                            {Math.round(prediction.probabilities.home * 100)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Draw</div>
                          <div className="font-medium">
                            {Math.round(prediction.probabilities.draw * 100)}%
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-xs text-gray-500">Away</div>
                          <div className="font-medium">
                            {Math.round(prediction.probabilities.away * 100)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Features />
    </main>
  );
}
