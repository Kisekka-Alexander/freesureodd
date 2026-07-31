"use client";

import dynamic from "next/dynamic";
import { Features } from "@/components/features";
import { PredictionsTable } from "@/components/predictions-table";
import { DateFilter } from "@/components/date-filter";
import { PopularLeaguesSidebar } from "@/components/popular-leagues-sidebar";

// Dynamic import for Hero component to prevent hydration issues
const Hero = dynamic(() => import("@/components/hero").then((mod) => ({ default: mod.Hero })), {
  ssr: false,
  loading: () => (
    <section className="bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 text-white py-2 lg:py-3">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="flex justify-center items-center h-32">
          <div className="text-white/80">Loading...</div>
        </div>
      </div>
    </section>
  )
});

import { predictionsApi, leaguesApi } from "@/lib/axios";
import { Prediction, League } from "@/types";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  formatCompactDate,
  prepareDateFilterForApi,
  getTodayLocalDate,
} from "@/utils/date";
import { parseLeagueParams } from "@/utils/slugs";

export default function LeaguePredictionsPage() {
  const router = useRouter();
  const params = useParams();
  
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [allPredictions, setAllPredictions] = useState<Prediction[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [selectedDate, setSelectedDate] = useState<string | null>(getTodayLocalDate());
  const [accuracyRate, setAccuracyRate] = useState<number | null>(null);

  // Parse URL parameters
  const { country: countryName, league: leagueName } = parseLeagueParams(
    params.country as string,
    params.league as string
  );
  const selectedCountry = countryName;

  // Find the league ID based on the league name
  const selectedLeague = leagues.find(
    (league) => league.league_name.toLowerCase() === leagueName.toLowerCase() && 
                league.country.toLowerCase() === countryName.toLowerCase()
  )?.league_id || null;

  // Fetch leagues and predictions logic (similar to main page)
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await leaguesApi.getLeagues();
        if (response.success) {
          setLeagues(response.data.leagues);
        }
      } catch (err) {
        console.error("Error fetching leagues:", err);
      }
    };
    fetchLeagues();
  }, []);

  useEffect(() => {
    const fetchAllPredictions = async () => {
      try {
        setLoading(true);
        const params = {
          sort_by: "correct" as const,
          sort_order: "asc" as const,
        };

        const response = await predictionsApi.getAllPredictions(params);
        if (response.success) {
          setAllPredictions(response.data.predictions);
        }
      } catch (err) {
        console.error("Error fetching all predictions for calendar:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllPredictions();
  }, []);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!selectedLeague) return;
      
      try {
        setLoading(true);
        setError(null);
        setPredictions([]);

        const dateParams = prepareDateFilterForApi(selectedDate);
        const params = {
          league_id: selectedLeague,
          sort_by: "correct" as const,
          sort_order: "asc" as const,
          ...dateParams,
        };

        const response = await predictionsApi.getAllPredictions(params);
        
        if (response.success) {
          const predictions = response.data.predictions;

          if (response.data.accuracy_percentage !== undefined) {
            setAccuracyRate(response.data.accuracy_percentage);
          }

          setPredictions(predictions);
        } else {
          throw new Error(response.message || "Failed to fetch predictions");
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch predictions";
        setError(errorMessage);
        console.error("Error fetching predictions:", err);
        setPredictions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [selectedLeague, selectedDate]);

  // Set responsive view mode
  useEffect(() => {
    const setInitialViewMode = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? "cards" : "table");
    };

    setInitialViewMode();

    const handleResize = () => {
      const isMobile = window.innerWidth < 768;
      setViewMode(isMobile ? "cards" : "table");
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update document title
  useEffect(() => {
    const title = `${leagueName} Predictions - SureWin`;
    document.title = title;
  }, [leagueName]);

  const handleDateFilter = (date: string | null) => {
    setSelectedDate(date);
  };

  const handleLeagueFilter = (leagueId: number | null) => {
    if (leagueId !== selectedLeague) {
      // Navigate to different league or country
      const league = leagues.find(l => l.league_id === leagueId);
      if (league) {
        const countrySlug = league.country.toLowerCase().replace(/\s+/g, '-');
        const leagueSlug = league.league_name.toLowerCase().replace(/\s+/g, '-');
        router.push(`/predictions/${countrySlug}/${leagueSlug}`);
      } else {
        router.push(`/predictions/${selectedCountry.toLowerCase().replace(/\s+/g, '-')}`);
      }
    }
  };

  const handleCountryFilter = (country: string | null) => {
    if (country !== selectedCountry) {
      if (country) {
        router.push(`/predictions/${country.toLowerCase().replace(/\s+/g, '-')}`);
      } else {
        router.push('/');
      }
    }
  };

  // Use predictions directly as returned by backend (already optimally sorted)
  const filteredPredictions = predictions;

  return (
    <main className="min-h-screen">
      <Hero />

      <section id="predictions" className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-6">
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
                      Loading {leagueName} predictions...
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
                    <p className="font-medium text-lg mb-2">Predictions Temporarily Unavailable</p>
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

              {!loading && !error && filteredPredictions.length === 0 && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">⚽</div>
                  <p className="text-gray-600 text-xl mb-4">
                    No predictions found for {leagueName}.
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              )}

              {!loading && !error && filteredPredictions.length > 0 && (
                <div>
                  <div className="flex flex-col md:flex-row justify-between items-center mb-6">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 md:mb-0">
                      <div className="text-sm text-gray-600">
                        Showing {filteredPredictions.length} predictions for{" "}
                        <span className="font-medium">{leagueName}</span>
                        {selectedDate && (
                          <>
                            {" "}on{" "}
                            <span className="font-medium">
                              {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", {
                                weekday: "short",
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          </>
                        )}
                      </div>
                      
                      {accuracyRate !== null && (
                        <div className="flex items-center space-x-2">
                          <div className="bg-gradient-to-r from-green-100 to-blue-100 border border-green-200 rounded-full px-3 py-1 flex items-center space-x-1">
                            <span className="text-xs">🎯</span>
                            <span className="text-xs font-medium text-green-700">
                              AI Accuracy: {accuracyRate.toFixed(1)}%
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-sm text-gray-500 font-medium">View as:</span>
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
                    <PredictionsTable predictions={filteredPredictions} leagues={leagues} />
                  ) : (
                    <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                      {filteredPredictions.map((prediction) => {
                        const getStatusColor = (status: string) => {
                          const liveStatuses = new Set(["LIVE", "1H", "2H", "HT", "ET", "P"]);
                          const upcomingStatuses = new Set(["NS", "TBD"]);
                          const completedStatuses = new Set(["FT"]);
                          const canceledStatuses = new Set(["CANC", "PST", "A", "ABD", "INT"]);

                          if (liveStatuses.has(status)) return "bg-red-100 text-red-800";
                          if (upcomingStatuses.has(status)) return "bg-blue-100 text-blue-800";
                          if (completedStatuses.has(status)) return "bg-gray-100 text-gray-800";
                          if (canceledStatuses.has(status)) return "bg-gray-100 text-gray-800";
                          return "bg-gray-100 text-gray-800";
                        };

                        return (
                          <div
                            key={prediction.match_id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 sm:p-4 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1 group"
                          >
                            <div className="flex items-center justify-between mb-2 transition-transform duration-300 ease-in-out transform group-hover:scale-105">
                              <div className="flex items-center space-x-1 flex-1">
                                <Image
                                  src={prediction.league_logo}
                                  alt={`${prediction.league_name} logo`}
                                  width={16}
                                  height={16}
                                  className="w-3 h-3 sm:w-4 sm:h-4 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.style.display = "none";
                                  }}
                                />
                                <div className="text-xs sm:text-sm text-gray-500 flex-1">
                                  <div className="truncate text-xs">{prediction.league_name}</div>
                                  <div className="text-xs">
                                    {formatCompactDate(prediction.match_date)}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-1">
                                <span
                                  className={`inline-flex px-1 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                                    prediction.match_status
                                  )}`}
                                >
                                  {prediction.match_status}
                                </span>
                                {prediction.fulltime_home_score !== undefined &&
                                prediction.fulltime_away_score !== undefined ? (
                                  <div className="text-xs sm:text-sm font-bold text-gray-900">
                                    {prediction.fulltime_home_score}-{prediction.fulltime_away_score}
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-400">-</div>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-center mb-2 transition-transform duration-300 ease-in-out transform group-hover:scale-110">
                              <div className="flex items-center justify-center space-x-1 w-full">
                                <div className="flex flex-col items-center flex-1 min-w-0">
                                  <Image
                                    src={prediction.home_team_logo}
                                    alt={`${prediction.home_team} logo`}
                                    width={20}
                                    height={20}
                                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain mb-1"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <div className="text-xs font-semibold text-center truncate w-full">
                                    {prediction.home_team}
                                  </div>
                                </div>
                                <div className="text-gray-400 font-bold text-xs px-1">
                                  VS
                                </div>
                                <div className="flex flex-col items-center flex-1 min-w-0">
                                  <Image
                                    src={prediction.away_team_logo}
                                    alt={`${prediction.away_team} logo`}
                                    width={20}
                                    height={20}
                                    className="w-4 h-4 sm:w-5 sm:h-5 object-contain mb-1"
                                    onError={(e) => {
                                      e.currentTarget.style.display = "none";
                                    }}
                                  />
                                  <div className="text-xs font-semibold text-center truncate w-full">
                                    {prediction.away_team}
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg transition-transform duration-300 ease-in-out transform group-hover:scale-115 relative">
                              <div className="text-xs text-gray-600 mb-1">🎯 Prediction:</div>
                              <div className="flex items-center justify-between">
                                <div className="text-sm sm:text-lg font-bold text-blue-600 truncate">
                                  {prediction.prediction.predicted_outcome}
                                </div>
                                {/* Prediction Accuracy Indicator */}
                                {prediction.prediction.correct && (
                                  <div className="flex items-center space-x-1">
                                    {prediction.prediction.correct === "y" ? (
                                      <div className="bg-green-500 text-white rounded-full p-1 flex items-center justify-center">
                                        <span className="text-xs font-bold">✓</span>
                                      </div>
                                    ) : (
                                      <div className="bg-red-500 text-white rounded-full p-1 flex items-center justify-center">
                                        <span className="text-xs font-bold">✗</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            
                            <div className="space-y-2 text-xs transition-transform duration-300 ease-in-out transform group-hover:scale-108">
                              {/* Main betting options */}
                              <div className="grid grid-cols-3 gap-1">
                                <div className="text-center p-1 rounded">
                                  <div className={`${
                                    prediction.prediction.predicted_outcome === "Home"
                                      ? "bg-green-100 border border-green-300 rounded p-1"
                                      : "bg-gray-50 p-1"
                                  }`}>
                                    <div className="text-xs text-gray-500 mb-0.5">Home</div>
                                    <div className={`font-bold text-sm ${
                                      prediction.prediction.predicted_outcome === "Home"
                                        ? "text-green-800"
                                        : ""
                                    }`}>
                                      {prediction.home_odds.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center p-1 rounded">
                                  <div className={`${
                                    prediction.prediction.predicted_outcome === "Draw"
                                      ? "bg-green-100 border border-green-300 rounded p-1"
                                      : "bg-gray-50 p-1"
                                  }`}>
                                    <div className="text-xs text-gray-500 mb-0.5">Draw</div>
                                    <div className={`font-bold text-sm ${
                                      prediction.prediction.predicted_outcome === "Draw"
                                        ? "text-green-800"
                                        : ""
                                    }`}>
                                      {prediction.draw_odds.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center p-1 rounded">
                                  <div className={`${
                                    prediction.prediction.predicted_outcome === "Away"
                                      ? "bg-green-100 border border-green-300 rounded p-1"
                                      : "bg-gray-50 p-1"
                                  }`}>
                                    <div className="text-xs text-gray-500 mb-0.5">Away</div>
                                    <div className={`font-bold text-sm ${
                                      prediction.prediction.predicted_outcome === "Away"
                                        ? "text-green-800"
                                        : ""
                                    }`}>
                                      {prediction.away_odds.toFixed(2)}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Double chance options - only show on larger screens */}
                              <div className="hidden sm:grid sm:grid-cols-2 gap-2">
                                <div className="text-center p-1 rounded border border-blue-100">
                                  <div className={`${
                                    prediction.prediction.predicted_outcome === "Home or Draw"
                                      ? "bg-green-100 border border-green-300 rounded p-1"
                                      : "bg-blue-50 p-1"
                                  }`}>
                                    <div className="text-xs text-blue-600 mb-0.5">1X</div>
                                    <div className={`font-bold text-sm ${
                                      prediction.prediction.predicted_outcome === "Home or Draw"
                                        ? "text-green-800"
                                        : "text-blue-700"
                                    }`}>
                                      {prediction.home_or_draw_odds ? prediction.home_or_draw_odds.toFixed(2) : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-center p-1 rounded border border-blue-100">
                                  <div className={`${
                                    prediction.prediction.predicted_outcome === "Away or Draw"
                                      ? "bg-green-100 border border-green-300 rounded p-1"
                                      : "bg-blue-50 p-1"
                                  }`}>
                                    <div className="text-xs text-blue-600 mb-0.5">X2</div>
                                    <div className={`font-bold text-sm ${
                                      prediction.prediction.predicted_outcome === "Away or Draw"
                                        ? "text-green-800"
                                        : "text-blue-700"
                                    }`}>
                                      {prediction.away_or_draw_odds ? prediction.away_or_draw_odds.toFixed(2) : 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
