"use client";

import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { PredictionsTable } from "@/components/predictions-table";
import { predictionsApi, leaguesApi } from "@/lib/axios";
import { Prediction, League } from "@/types";
import { useEffect, useState } from "react";
import Link from "next/link";
import { formatCompactDate, getRelativeTime, isMatchToday } from "@/utils/date";

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPredictions, setTotalPredictions] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const predictionsPerPage = 20;

  // Fetch leagues on component mount
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        // Get all leagues since the new API doesn't filter by season at the league level
        const response = await leaguesApi.getLeagues();
        if (response.success) {
          // With the new API structure, leagues don't have season or team count data
          // So we'll just use the leagues as they come from the API
          setLeagues(response.data.leagues);
        }
      } catch (err) {
        console.error("Error fetching leagues:", err);
        // Fallback to unique leagues if current season fails
        try {
          const fallbackResponse = await leaguesApi.getUniqueLeagues();
          if (fallbackResponse.success) {
            // Convert UniqueLeague to League format for compatibility
            const currentSeasonLeagues = fallbackResponse.data.leagues.map(
              (uniqueLeague) => {
                const currentSeason =
                  uniqueLeague.seasons.find(
                    (s) => s.season_name === "2024-2025"
                  ) || uniqueLeague.seasons[uniqueLeague.seasons.length - 1]; // Get latest season as fallback

                return {
                  league_id: uniqueLeague.league_id,
                  league_name: uniqueLeague.league_name,
                  country: uniqueLeague.country,
                  logo_url: uniqueLeague.logo_url,
                  season_name: currentSeason?.season_name || null,
                  team_count: currentSeason?.team_count || 0,
                };
              }
            );
            setLeagues(currentSeasonLeagues);
          }
        } catch (fallbackErr) {
          console.error("Error fetching fallback leagues:", fallbackErr);
        }
      }
    };

    fetchLeagues();
  }, []);

  // Fetch total predictions count on component mount
  useEffect(() => {
    const fetchInitialPredictions = async () => {
      try {
        // Get the first page to initialize pagination info
        const response = await predictionsApi.getAllPredictions({
          page: 1,
          page_size: predictionsPerPage,
          status: "NS",
          sort_by: "match_date",
          sort_order: "asc",
        });

        if (response.success) {
          setTotalPredictions(response.data.pagination.total_count);
          setTotalPages(response.data.pagination.total_pages);
        }
      } catch (err) {
        console.error("Error fetching initial predictions info:", err);
        // Keep the existing state if this fails
      }
    };

    fetchInitialPredictions();
  }, []);

  // Fetch predictions when filters change
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          page: currentPage,
          page_size: predictionsPerPage,
          ...(selectedLeague && { league_id: selectedLeague }),
          status: "NS" as const,
          sort_by: "match_date" as const,
          sort_order: "asc" as const,
        };

        console.log("Fetching predictions with params:", params);
        const response = await predictionsApi.getAllPredictions(params);
        console.log("Predictions fetched successfully");

        if (response.success) {
          setPredictions(response.data.predictions);
          setTotalPredictions(response.data.pagination.total_count);
          setTotalPages(response.data.pagination.total_pages);

          // If we're on a page that doesn't exist (e.g., after filtering), go to page 1
          if (
            currentPage > response.data.pagination.total_pages &&
            response.data.pagination.total_count > 0
          ) {
            setCurrentPage(1);
          }
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
  }, [currentPage, selectedLeague]);

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Netherlands: "🇳🇱",
      Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
    };
    return flags[country] || "🌍";
  };

  const handleLeagueFilter = (leagueId: number | null) => {
    setSelectedLeague(leagueId);
    setCurrentPage(1);
  };

  return (
    <main className="min-h-screen">
      <Hero predictions={predictions} />

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
                {predictions.length}
              </div>
              <div className="text-sm text-green-700">Today&apos;s Tips</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {predictions.length > 0
                  ? Math.round(
                      (predictions.reduce(
                        (sum, p) => sum + p.prediction.confidence,
                        0
                      ) /
                        predictions.length) *
                        100
                    )
                  : 0}
                %
              </div>
              <div className="text-sm text-blue-700">Avg Confidence</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {leagues.length}
              </div>
              <div className="text-sm text-purple-700">Leagues Covered</div>
            </div>
            <div className="text-center p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                {
                  predictions.filter((p) => p.prediction.confidence > 0.7)
                    .length
                }
              </div>
              <div className="text-sm text-orange-700">High Confidence</div>
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
            {/* All Leagues Button */}
            <button
              onClick={() => handleLeagueFilter(null)}
              className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 hover:border-blue-300 ${
                selectedLeague === null
                  ? "ring-2 ring-blue-500 border-blue-300"
                  : ""
              }`}
            >
              <div className="text-3xl mb-3">🌍</div>
              <div className="font-semibold text-gray-900 text-sm mb-1">
                All Leagues
              </div>
              <div className="text-xs text-gray-500">
                {totalPredictions} predictions
              </div>
            </button>

            {/* Dynamic League Buttons - Show first 5 leagues */}
            {leagues
              .slice(0, 5) // Just take the first 5 leagues since we don't have team count for sorting
              .map((league) => {
                return (
                  <Link
                    key={league.league_id}
                    href={`/leagues/${league.league_id}`}
                    className="group"
                  >
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        handleLeagueFilter(league.league_id);
                      }}
                      onDoubleClick={() =>
                        (window.location.href = `/leagues/${league.league_id}`)
                      }
                      className={`w-full bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all hover:-translate-y-1 border border-gray-200 hover:border-blue-300 group-hover:border-blue-300 ${
                        selectedLeague === league.league_id
                          ? "ring-2 ring-blue-500 border-blue-300"
                          : ""
                      }`}
                    >
                      <div className="text-3xl mb-3">
                        {getCountryFlag(league.country)}
                      </div>
                      <div className="font-semibold text-gray-900 text-sm mb-1">
                        {league.league_name}
                      </div>
                      <div className="text-xs text-blue-600 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        Double-click to view →
                      </div>
                    </button>
                  </Link>
                );
              })}
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
                    {
                      predictions.filter((p) => p.prediction.confidence > 0.7)
                        .length
                    }{" "}
                    tips
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>
                    Medium confidence:{" "}
                    {
                      predictions.filter(
                        (p) =>
                          p.prediction.confidence >= 0.5 &&
                          p.prediction.confidence <= 0.7
                      ).length
                    }{" "}
                    tips
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>
                    Lower confidence:{" "}
                    {
                      predictions.filter((p) => p.prediction.confidence < 0.5)
                        .length
                    }{" "}
                    tips
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
                  Loading today&apos;s predictions...
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
              {/* Filter and Pagination Info */}
              <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                <div className="text-sm text-gray-600 mb-4 md:mb-0">
                  {selectedLeague ? (
                    <>
                      Showing predictions for{" "}
                      <span className="font-medium">
                        {
                          leagues.find((l) => l.league_id === selectedLeague)
                            ?.league_name
                        }
                      </span>{" "}
                      (Page {currentPage} of {totalPages})
                    </>
                  ) : (
                    <>
                      Showing {predictions.length} of {totalPredictions}{" "}
                      predictions (Page {currentPage} of {totalPages})
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage <= 1 || loading}
                    className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    ← Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    {totalPredictions > 0
                      ? `${currentPage} / ${totalPages}`
                      : "0 / 0"}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={
                      currentPage >= totalPages ||
                      loading ||
                      totalPredictions === 0
                    }
                    className="px-3 py-1 rounded border border-gray-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next →
                  </button>
                </div>
              </div>

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
                          <div>{prediction.league_name}</div>
                          <div className="mt-1">
                            {formatCompactDate(prediction.match_date)}
                            {isMatchToday(prediction.match_date) && (
                              <span className="ml-2 text-blue-600 font-semibold">
                                {getRelativeTime(prediction.match_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            prediction.prediction.confidence > 0.7
                              ? "bg-green-100 text-green-800"
                              : prediction.prediction.confidence >= 0.5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {Math.round(prediction.prediction.confidence * 100)}%
                          confidence
                          {prediction.prediction.error && " (Fallback)"}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="text-lg font-semibold">
                            {prediction.home_team}
                          </div>
                          <div className="text-gray-400 font-bold">VS</div>
                          <div className="text-lg font-semibold">
                            {prediction.away_team}
                          </div>
                        </div>
                      </div>
                      <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                        <div className="text-sm text-gray-600 mb-1">
                          🎯 AI Prediction:
                        </div>
                        <div className="text-xl font-bold text-blue-600">
                          {prediction.prediction.predicted_outcome}
                        </div>
                        {/* <div className="text-xs text-gray-500 mt-1">
                          Model: {prediction.prediction.model_info.name} v
                          {prediction.prediction.model_info.version}
                        </div> */}
                      </div>
                      <div className="grid grid-cols-3 gap-3 text-sm">
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">
                            Home Win
                          </div>
                          <div className="font-bold text-lg">
                            {Math.round(
                              prediction.prediction.probabilities.home * 100
                            )}
                            %
                          </div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">Draw</div>
                          <div className="font-bold text-lg">
                            {Math.round(
                              prediction.prediction.probabilities.draw * 100
                            )}
                            %
                          </div>
                        </div>
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="text-xs text-gray-500 mb-1">
                            Away Win
                          </div>
                          <div className="font-bold text-lg">
                            {Math.round(
                              prediction.prediction.probabilities.away * 100
                            )}
                            %
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
