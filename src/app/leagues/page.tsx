"use client";

import { useState, useEffect } from "react";
import { League } from "@/types";
import { leaguesApi } from "@/lib/axios";
import Link from "next/link";

interface LeagueWithSeasons extends League {
  seasons: {
    season_name: string | null | undefined;
    team_count: number;
  }[];
  currentSeason?: {
    season_name: string | null | undefined;
    team_count: number;
  };
  totalSeasons: number;
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<LeagueWithSeasons[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string>("all");
  const [showSeasonDetails, setShowSeasonDetails] = useState<{
    [key: number]: boolean;
  }>({});

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await leaguesApi.getLeagues();

        if (response.success) {
          console.log("Full API response:", response);

          // Validate response structure
          if (
            !response.data ||
            !response.data.leagues ||
            !Array.isArray(response.data.leagues)
          ) {
            throw new Error(
              `Invalid response structure. Expected leagues array, got: ${JSON.stringify(
                response.data
              )}`
            );
          }

          // Process leagues with season data
          const leaguesMap = new Map<number, LeagueWithSeasons>();

          response.data.leagues.forEach((current) => {
            // Validate each league object
            if (
              !current.league_id ||
              !current.league_name ||
              !current.country
            ) {
              console.warn("Invalid league object:", current);
              return;
            }

            const leagueId = current.league_id;

            if (!leaguesMap.has(leagueId)) {
              // Create new league entry
              leaguesMap.set(leagueId, {
                ...current,
                seasons: [],
                totalSeasons: 0,
              });
            }

            const league = leaguesMap.get(leagueId)!;

            // Add season data
            league.seasons.push({
              season_name: current.season_name,
              team_count: current.team_count,
            });

            // Update current season (prefer most recent or null season)
            if (
              !league.currentSeason ||
              (current.season_name &&
                current.season_name >
                  (league.currentSeason.season_name || "")) ||
              (!league.currentSeason.season_name && current.season_name)
            ) {
              league.currentSeason = {
                season_name: current.season_name,
                team_count: current.team_count,
              };
              // Update the main league data with current season info
              league.team_count = current.team_count;
            }
          });

          // Convert map to array and calculate total seasons
          const processedLeagues = Array.from(leaguesMap.values()).map(
            (league) => ({
              ...league,
              totalSeasons: league.seasons.length,
              seasons: league.seasons.sort((a, b) => {
                if (!a.season_name) return 1;
                if (!b.season_name) return -1;
                return b.season_name.localeCompare(a.season_name);
              }),
            })
          );

          console.log(
            `Processed ${processedLeagues.length} unique leagues with season data from ${response.data.leagues.length} total entries`
          );
          setLeagues(processedLeagues);
        } else {
          throw new Error(response.message || "Failed to fetch leagues");
        }
      } catch (err: any) {
        console.error("Detailed error fetching leagues:", {
          error: err,
          message: err?.message,
          code: err?.code,
          response: err?.response,
        });

        let errorMessage = "Failed to fetch leagues";
        if (
          err?.code === "ECONNRESET" ||
          err?.message?.includes("Network Error")
        ) {
          errorMessage =
            "Network connection issue. The server may be experiencing high load or the response was too large. Please try refreshing the page.";
        } else if (err?.code === "ECONNABORTED") {
          errorMessage =
            "Request timed out. Please check your connection and try again.";
        } else if (err?.response?.status) {
          errorMessage = `Server error (${err.response.status}): ${
            err?.response?.data?.message || err.message
          }`;
        } else {
          errorMessage = err instanceof Error ? err.message : errorMessage;
        }

        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchLeagues();
  }, []);

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

  const getLeagueCategory = (leagueName: string) => {
    if (leagueName.includes("Premier League")) return "Top Tier";
    if (leagueName.includes("La Liga")) return "Top Tier";
    if (leagueName.includes("Serie A")) return "Top Tier";
    if (leagueName.includes("Bundesliga")) return "Top Tier";
    if (leagueName.includes("Ligue 1")) return "Top Tier";
    if (leagueName.includes("Championship")) return "Second Tier";
    if (leagueName.includes("League One")) return "Third Tier";
    if (leagueName.includes("League Two")) return "Fourth Tier";
    return "Professional";
  };

  const getUniqueCountries = () => {
    const countries = leagues.map((league) => league.country);
    return [...new Set(countries)].sort();
  };

  const filteredLeagues =
    selectedCountry === "all"
      ? leagues
      : leagues.filter((league) => league.country === selectedCountry);

  const getTierBadgeColor = (category: string) => {
    switch (category) {
      case "Top Tier":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0";
      case "Second Tier":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0";
      case "Third Tier":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white border-0";
      case "Fourth Tier":
        return "bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0";
      default:
        return "bg-gray-100 text-gray-600 border border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              🏆 Football Leagues
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Explore leagues from around the world with detailed statistics and
              predictions
            </p>
          </div>
        </div>
      </section>

      {/* Leagues Grid */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <span className="text-lg text-gray-600">
                  Loading leagues...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-2xl mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-medium text-lg mb-3">
                  Failed to Load Leagues
                </p>
                <p className="text-sm mb-4 leading-relaxed">{error}</p>
                <div className="text-xs text-red-600 bg-red-100 p-3 rounded-lg">
                  <p className="font-medium mb-1">Troubleshooting Tips:</p>
                  <ul className="text-left space-y-1">
                    <li>• Check your internet connection</li>
                    <li>• Try refreshing the page</li>
                    <li>• The server might be temporarily overloaded</li>
                    <li>• Check browser console for more details</li>
                  </ul>
                </div>
              </div>
              <div className="space-x-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={() => {
                    setError(null);
                    setLoading(true);
                    setTimeout(() => {
                      const fetchLeagues = async () => {
                        try {
                          const response = await leaguesApi.getLeagues();
                          if (response.success) {
                            // Process leagues with season data (same logic as main fetch)
                            const leaguesMap = new Map<
                              number,
                              LeagueWithSeasons
                            >();

                            response.data.leagues.forEach((current) => {
                              if (
                                !current.league_id ||
                                !current.league_name ||
                                !current.country
                              ) {
                                return;
                              }

                              const leagueId = current.league_id;

                              if (!leaguesMap.has(leagueId)) {
                                leaguesMap.set(leagueId, {
                                  ...current,
                                  seasons: [],
                                  totalSeasons: 0,
                                });
                              }

                              const league = leaguesMap.get(leagueId)!;

                              league.seasons.push({
                                season_name: current.season_name,
                                team_count: current.team_count,
                              });

                              if (
                                !league.currentSeason ||
                                (current.season_name &&
                                  current.season_name >
                                    (league.currentSeason.season_name || "")) ||
                                (!league.currentSeason.season_name &&
                                  current.season_name)
                              ) {
                                league.currentSeason = {
                                  season_name: current.season_name,
                                  team_count: current.team_count,
                                };
                                league.team_count = current.team_count;
                              }
                            });

                            const processedLeagues = Array.from(
                              leaguesMap.values()
                            ).map((league) => ({
                              ...league,
                              totalSeasons: league.seasons.length,
                              seasons: league.seasons.sort((a, b) => {
                                if (!a.season_name) return 1;
                                if (!b.season_name) return -1;
                                return b.season_name.localeCompare(
                                  a.season_name
                                );
                              }),
                            }));

                            setLeagues(processedLeagues);
                          } else {
                            throw new Error(
                              response.message || "Failed to fetch leagues"
                            );
                          }
                        } catch (err: any) {
                          setError(
                            "Retry failed. Please check your connection and try again."
                          );
                        } finally {
                          setLoading(false);
                        }
                      };
                      fetchLeagues();
                    }, 1000);
                  }}
                  className="bg-gray-600 text-white px-8 py-3 rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                >
                  🔄 Retry Now
                </button>
              </div>
            </div>
          )}

          {!loading && !error && leagues.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏟️</div>
              <p className="text-gray-600 text-xl mb-4">
                No leagues available.
              </p>
              <p className="text-gray-500">
                Check back later for league updates.
              </p>
            </div>
          )}

          {!loading && !error && leagues.length > 0 && (
            <div>
              {/* Statistics Overview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
                  <div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {leagues.length}
                    </div>
                    <div className="text-sm text-gray-600">Total Leagues</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {getUniqueCountries().length}
                    </div>
                    <div className="text-sm text-gray-600">Countries</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {leagues.reduce(
                        (sum, league) => sum + league.totalSeasons,
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Seasons</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-orange-600 mb-1">
                      {leagues.reduce(
                        (sum, league) =>
                          sum + (league.currentSeason?.team_count || 0),
                        0
                      )}
                    </div>
                    <div className="text-sm text-gray-600">Total Teams</div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-8">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Football Leagues Database
                </h2>
                <p className="text-xl text-gray-600 mb-6">
                  Comprehensive statistics and predictions across multiple
                  seasons
                </p>

                {/* Country Filter */}
                <div className="flex justify-center mb-6">
                  <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex">
                    <button
                      onClick={() => setSelectedCountry("all")}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedCountry === "all"
                          ? "bg-blue-600 text-white"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      All Countries
                    </button>
                    {getUniqueCountries().map((country) => (
                      <button
                        key={country}
                        onClick={() => setSelectedCountry(country)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                          selectedCountry === country
                            ? "bg-blue-600 text-white"
                            : "text-gray-600 hover:text-gray-800"
                        }`}
                      >
                        <span>{getCountryFlag(country)}</span>
                        <span>{country}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredLeagues.map((league) => (
                  <Link
                    key={league.league_id}
                    href={`/leagues/${league.league_id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1 group-hover:shadow-lg">
                      {/* Header with Country Flag and Tier Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">
                          {getCountryFlag(league.country)}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getTierBadgeColor(
                            getLeagueCategory(league.league_name)
                          )}`}
                        >
                          {getLeagueCategory(league.league_name)}
                        </div>
                      </div>

                      {/* League Info */}
                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {league.league_name}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center">
                          <span>{league.country}</span>
                          {league.currentSeason?.season_name && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">
                                {league.currentSeason.season_name}
                              </span>
                            </>
                          )}
                        </p>
                      </div>

                      {/* Statistics Grid */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">
                            {league.currentSeason?.team_count || 0}
                          </div>
                          <div className="text-xs text-gray-500">Teams</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">
                            {league.totalSeasons}
                          </div>
                          <div className="text-xs text-gray-500">Seasons</div>
                        </div>
                      </div>

                      {/* Season Toggle */}
                      <div className="mb-4">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setShowSeasonDetails((prev) => ({
                              ...prev,
                              [league.league_id]: !prev[league.league_id],
                            }));
                          }}
                          className="w-full text-xs text-gray-600 hover:text-blue-600 flex items-center justify-center space-x-1 py-2 rounded border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <span>View All Seasons</span>
                          <svg
                            className={`w-4 h-4 transform transition-transform ${
                              showSeasonDetails[league.league_id]
                                ? "rotate-180"
                                : ""
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>

                        {showSeasonDetails[league.league_id] && (
                          <div className="mt-3 space-y-2 max-h-32 overflow-y-auto">
                            {league.seasons.map((season, index) => (
                              <div
                                key={index}
                                className="flex justify-between items-center text-xs bg-gray-50 p-2 rounded"
                              >
                                <span className="font-medium">
                                  {season.season_name || "Unknown Season"}
                                </span>
                                <span className="text-gray-600">
                                  {season.team_count} teams
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Action Area */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">View Analytics</span>
                          <div className="flex items-center space-x-1 text-blue-600 font-medium group-hover:text-blue-700">
                            <span>Explore League</span>
                            <svg
                              className="w-4 h-4 transition-transform group-hover:translate-x-1"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
