"use client";

import { Hero } from "@/components/hero";
import { Features } from "@/components/features";
import { PredictionsTable } from "@/components/predictions-table";
import { DateFilter } from "@/components/date-filter";
import { PopularLeaguesSidebar } from "@/components/popular-leagues-sidebar";
import { predictionsApi, leaguesApi } from "@/lib/axios";
import { Prediction, League } from "@/types";
import { useEffect, useState } from "react";
import Image from "next/image";
import {
  formatCompactDate,
  getRelativeTime,
  isMatchToday,
  prepareDateFilterForApi,
  getTodayLocalDate,
} from "@/utils/date";

export default function Home() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]); // Store all predictions for calendar indicators
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [allPredictionsLoading, setAllPredictionsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(
    getTodayLocalDate()
  );

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
                  country_flag: uniqueLeague.country_flag,
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

  // Fetch all predictions for calendar indicators (without date filter)
  useEffect(() => {
    const fetchAllPredictions = async () => {
      try {
        setAllPredictionsLoading(true);
        const params = {
          sort_by: "match_date" as const,
          sort_order: "asc" as const,
        };

        const response = await predictionsApi.getAllPredictions(params);
        if (response.success) {
          setAllPredictions(response.data.predictions);
        }
      } catch (err) {
        console.error("Error fetching all predictions for calendar:", err);
      } finally {
        setAllPredictionsLoading(false);
      }
    };

    fetchAllPredictions();
  }, []); // Only fetch once on mount - we want ALL predictions for calendar

  // Fetch predictions when component mounts or filters change
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true);
        setError(null);
        setPredictions([]); // Clear previous predictions immediately when filter changes

        // Prepare date filter parameters for server-side filtering
        const dateParams = prepareDateFilterForApi(selectedDate);

        const params = {
          ...(selectedLeague && { league_id: selectedLeague }),
          sort_by: "match_date" as const,
          sort_order: "asc" as const,
          ...dateParams, // Include match_date and timezone for server-side filtering
        };

        console.log("DEBUG: selectedLeague:", selectedLeague);
        console.log("DEBUG: selectedCountry:", selectedCountry);
        console.log("DEBUG: dateParams:", dateParams);
        console.log("Fetching predictions with server-side filtering:", params);
        const response = await predictionsApi.getAllPredictions(params);
        console.log(
          "Predictions fetched successfully from server",
          response.data?.predictions?.length || 0,
          "predictions"
        );

        if (response.success) {
          let predictions = response.data.predictions;

          // Apply client-side country filtering if country is selected but no specific league
          if (selectedCountry && !selectedLeague) {
            const countryLeagueIds = leagues
              .filter((league) => league.country === selectedCountry)
              .map((league) => league.league_id);

            predictions = predictions.filter((prediction) => {
              // Check if the prediction's league belongs to the selected country
              const leagueForPrediction = leagues.find(
                (league) => league.league_name === prediction.league_name
              );
              return (
                leagueForPrediction &&
                countryLeagueIds.includes(leagueForPrediction.league_id)
              );
            });
          }

          setPredictions(predictions);
        } else {
          throw new Error(response.message || "Failed to fetch predictions");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch predictions";
        setError(errorMessage);
        console.error("Error fetching predictions:", err);
        setPredictions([]); // Ensure predictions are cleared on error
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedLeague, selectedCountry, selectedDate, leagues]); // Now includes selectedCountry and leagues for client-side filtering

  // Note: These functions are kept for potential future use
  // const getCountryFlag = (country: string) => {
  //   const flags: Record<string, string> = {
  //     England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  //     Spain: "🇪🇸",
  //     Italy: "🇮🇹",
  //     Germany: "🇩🇪",
  //     France: "🇫🇷",
  //     Netherlands: "🇳🇱",
  //     Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
  //   };
  //   return flags[country] || "🌍";
  // };

  // const handleLeagueFilter = (leagueId: number | null) => {
  //   setSelectedLeague(leagueId);
  // };

  const handleDateFilter = (date: string | null) => {
    setSelectedDate(date);
  };

  const handleLeagueFilter = (leagueId: number | null) => {
    console.log("League filter changed:", leagueId);
    setSelectedLeague(leagueId);
  };

  const handleCountryFilter = (country: string | null) => {
    console.log("Country filter changed:", country);
    setSelectedCountry(country);

    // Only clear league selection when explicitly clearing country (country = null)
    // Don't clear when setting a country as part of league selection
    if (country === null) {
      setSelectedLeague(null);
    }
  };

  // Server-side filtering: predictions are already filtered
  // No need for client-side filtering anymore
  const filteredPredictions = predictions;

  return (
    <main className="min-h-screen">
      <Hero predictions={filteredPredictions} />

      {/* Predictions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ⚽ Latest Match Predictions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
              Get the edge with our AI-powered predictions. Each tip comes with
              detailed analysis, odds information, and statistical backing to
              help you make informed decisions.
            </p>
          </div>

          {/* Main Content Layout with Sidebar */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar - Popular Leagues */}
            <div className="w-full lg:w-64 flex-shrink-0">
              <PopularLeaguesSidebar
                leagues={leagues}
                selectedLeague={selectedLeague}
                selectedCountry={selectedCountry}
                onLeagueSelect={handleLeagueFilter}
                onCountrySelect={handleCountryFilter}
                predictions={allPredictions}
              />
            </div>

            {/* Right Content - Filters and Predictions */}
            <div className="flex-1 min-w-0">
              <div className="mb-6">
                <DateFilter
                  selectedDate={selectedDate}
                  onDateChange={handleDateFilter}
                  predictions={allPredictions}
                />
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

              {!allPredictionsLoading &&
                !error &&
                allPredictions.length === 0 && (
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

              {!loading &&
                !error &&
                filteredPredictions.length === 0 &&
                allPredictions.length > 0 && (
                  <div className="text-center py-20">
                    <div className="text-6xl mb-4">⚽</div>
                    <p className="text-gray-600 text-xl mb-4">
                      {selectedDate || selectedLeague || selectedCountry
                        ? "No predictions found for the selected filters."
                        : "No predictions available at the moment."}
                    </p>
                    <p className="text-gray-500">
                      {selectedDate || selectedLeague || selectedCountry
                        ? "Try adjusting your filters or check back later."
                        : "Check back later for today's fresh predictions and analysis."}
                    </p>
                    {(selectedDate || selectedLeague || selectedCountry) && (
                      <button
                        onClick={() => {
                          setSelectedDate(null);
                          setSelectedLeague(null);
                          setSelectedCountry(null);
                        }}
                        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}

              {!loading && !error && filteredPredictions.length > 0 && (
                <div>
                  {/* View Mode Toggle - Moved here for better UX */}
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="text-sm text-gray-600 mb-4 md:mb-0">
                      {selectedLeague || selectedCountry || selectedDate ? (
                        <>
                          Showing predictions
                          {selectedLeague && (
                            <>
                              {" "}
                              for{" "}
                              <span className="font-medium">
                                {
                                  leagues.find(
                                    (l) => l.league_id === selectedLeague
                                  )?.league_name
                                }
                              </span>
                            </>
                          )}
                          {selectedCountry && !selectedLeague && (
                            <>
                              {" "}
                              from{" "}
                              <span className="font-medium">
                                {selectedCountry}
                              </span>
                            </>
                          )}
                          {selectedDate && (
                            <>
                              {" "}
                              on{" "}
                              <span className="font-medium">
                                {new Date(
                                  selectedDate + "T00:00:00"
                                ).toLocaleDateString("en-US", {
                                  weekday: "short",
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            </>
                          )}
                        </>
                      ) : (
                        <>Showing {filteredPredictions.length} predictions</>
                      )}
                    </div>

                    {/* Enhanced View Toggle - Better positioned */}
                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 font-medium">
                        View as:
                      </span>
                      <div className="bg-gray-100 rounded-xl p-1 shadow-sm border">
                        <button
                          onClick={() => setViewMode("table")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            viewMode === "table"
                              ? "bg-blue-500 text-white shadow-md"
                              : "text-gray-600 hover:text-gray-800 hover:bg-white"
                          }`}
                        >
                          📊 Table
                        </button>
                        <button
                          onClick={() => setViewMode("cards")}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                            viewMode === "cards"
                              ? "bg-blue-500 text-white shadow-md"
                              : "text-gray-600 hover:text-gray-800 hover:bg-white"
                          }`}
                        >
                          📋 Cards
                        </button>
                      </div>
                    </div>
                  </div>

                  {viewMode === "table" ? (
                    <PredictionsTable predictions={filteredPredictions} />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredPredictions.map((prediction) => (
                        <div
                          key={prediction.match_id}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1"
                        >
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2">
                              <Image
                                src={prediction.league_logo}
                                alt={`${prediction.league_name} logo`}
                                width={20}
                                height={20}
                                className="w-5 h-5 object-contain"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                }}
                              />
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
                            </div>
                          </div>
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-2 min-w-0 flex-1">
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <Image
                                  src={prediction.home_team_logo}
                                  alt={`${prediction.home_team} logo`}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <div
                                  className="text-sm font-semibold truncate max-w-[100px]"
                                  title={prediction.home_team}
                                >
                                  {prediction.home_team}
                                </div>
                              </div>
                              <div className="text-gray-400 font-bold flex-shrink-0 text-sm">
                                VS
                              </div>
                              <div className="flex items-center space-x-2 min-w-0 flex-1">
                                <Image
                                  src={prediction.away_team_logo}
                                  alt={`${prediction.away_team} logo`}
                                  width={24}
                                  height={24}
                                  className="w-6 h-6 object-contain flex-shrink-0"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <div
                                  className="text-sm font-semibold truncate max-w-[100px]"
                                  title={prediction.away_team}
                                >
                                  {prediction.away_team}
                                </div>
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
                                {prediction.home_odds.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-xs text-gray-500 mb-1">
                                Draw
                              </div>
                              <div className="font-bold text-lg">
                                {prediction.draw_odds.toFixed(2)}
                              </div>
                            </div>
                            <div className="text-center p-2 bg-gray-50 rounded">
                              <div className="text-xs text-gray-500 mb-1">
                                Away Win
                              </div>
                              <div className="font-bold text-lg">
                                {prediction.away_odds.toFixed(2)}
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
          </div>
        </div>
      </section>

      <Features />
    </main>
  );
}
