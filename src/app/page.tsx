"use client";

import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { PredictionsTable } from "@/components/predictions-table";
import { predictionsApi } from "@/lib/axios";
import { Prediction } from "@/types";
import { useEffect, useState } from "react";

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

  const leagues = [
    { name: "Premier League", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", matches: 10 },
    { name: "La Liga", flag: "🇪🇸", matches: 8 },
    { name: "Serie A", flag: "🇮🇹", matches: 9 },
    { name: "Bundesliga", flag: "🇩🇪", matches: 7 },
    { name: "Champions League", flag: "⚽", matches: 6 },
    { name: "Ligue 1", flag: "🇫🇷", matches: 8 },
  ];

  return (
    <main className="min-h-screen">
      <Hero />

      {/* Quick Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              📊 Today&apos;s Football Intelligence
            </h2>
            <p className="text-gray-600">
              Real-time statistics and insights from the world of football
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {predictions.length || 24}
              </div>
              <div className="text-sm text-green-700">Today&apos;s Tips</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">87%</div>
              <div className="text-sm text-blue-700">Win Rate This Week</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">15</div>
              <div className="text-sm text-purple-700">Leagues Covered</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2">🔥</div>
              <div className="text-sm text-orange-700">Hot Streak</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Leagues Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              🏆 Featured Leagues
            </h2>
            <p className="text-gray-600">
              Choose your favorite league and get instant predictions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {leagues.map((league, index) => (
              <button
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 hover:border-blue-300"
              >
                <div className="text-3xl mb-3">{league.flag}</div>
                <div className="font-semibold text-gray-900 text-sm mb-1">
                  {league.name}
                </div>
                <div className="text-xs text-gray-500">
                  {league.matches} matches today
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Predictions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ⚽ Latest Match Predictions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Get the edge with our AI-powered predictions. Each tip comes with
              detailed analysis, confidence levels, and statistical backing to
              help you make informed decisions.
            </p>

            {/* Enhanced View Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-gray-100 rounded-xl p-1 shadow-sm border">
                <button
                  onClick={() => setViewMode("table")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "table"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white"
                  }`}
                >
                  📊 Detailed Table
                </button>
                <button
                  onClick={() => setViewMode("cards")}
                  className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                    viewMode === "cards"
                      ? "bg-blue-500 text-white shadow-md"
                      : "text-gray-600 hover:text-gray-800 hover:bg-white"
                  }`}
                >
                  📋 Quick Cards
                </button>
              </div>
            </div>

            {/* Prediction stats */}
            {!loading && !error && predictions.length > 0 && (
              <div className="flex justify-center space-x-8 text-sm text-gray-600 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>
                    High confidence:{" "}
                    {predictions.filter((p) => p.confidence > 0.7).length} tips
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>
                    Medium confidence:{" "}
                    {
                      predictions.filter(
                        (p) => p.confidence >= 0.5 && p.confidence <= 0.7
                      ).length
                    }{" "}
                    tips
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>
                    Lower confidence:{" "}
                    {predictions.filter((p) => p.confidence < 0.5).length} tips
                  </span>
                </div>
              </div>
            )}
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <span className="text-lg text-gray-600">
                  Loading today's predictions...
                </span>
                <div className="text-sm text-gray-500 mt-2">
                  Analyzing team stats, injuries, and form...
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-medium text-lg mb-2">
                  Predictions Temporarily Unavailable
                </p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
              >
                🔄 Try Again
              </button>
            </div>
          )}

          {!loading && !error && predictions.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-gray-600 text-xl mb-4">
                No predictions available at the moment.
              </p>
              <p className="text-gray-500">
                Check back later for today&apos;s fresh predictions and
                analysis.
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
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {prediction.match_info.league} •{" "}
                          {new Date(
                            prediction.match_info.match_date
                          ).toLocaleDateString()}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            prediction.confidence > 0.7
                              ? "bg-green-100 text-green-800"
                              : prediction.confidence >= 0.5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {Math.round(prediction.confidence * 100)}% confidence
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold">
                            {prediction.match_info.home_team}
                          </div>
                          <div className="text-gray-400 font-bold">VS</div>
                          <div className="text-lg font-semibold">
                            {prediction.match_info.away_team}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          🎯 AI Prediction:
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {prediction.predicted_outcome}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">
                            Home Win
                          </div>
                          <div className="font-bold text-lg">
                            {Math.round(prediction.probabilities.home * 100)}%
                          </div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">Draw</div>
                          <div className="font-bold text-lg">
                            {Math.round(prediction.probabilities.draw * 100)}%
                          </div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">
                            Away Win
                          </div>
                          <div className="font-bold text-lg">
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
