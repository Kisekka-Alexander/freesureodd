"use client";

import { useState, useEffect } from "react";
import { League } from "@/types";
import { leaguesApi } from "@/lib/axios";
import Link from "next/link";

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await leaguesApi.getLeagues();

        if (response.success) {
          // Filter leagues to keep only unique league_id entries
          const uniqueLeagues = response.data.leagues.reduce((acc, current) => {
            const leagueExists = acc.find((item) => item.league_id === current.league_id);
            if (!leagueExists) {
              return [...acc, current];
            }
            return acc;
          }, [] as League[]);
          setLeagues(uniqueLeagues);
        } else {
          throw new Error(response.message || "Failed to fetch leagues");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch leagues";
        setError(errorMessage);
        console.error("Error fetching leagues:", err);
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
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-medium text-lg mb-2">
                  Failed to Load Leagues
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
              <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  Available Leagues
                </h2>
                <p className="text-xl text-gray-600">
                  Click on any league to view detailed statistics, standings,
                  and predictions
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {leagues.map((league) => (
                  <Link
                    key={league.league_id}
                    href={`/leagues/${league.league_id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1 group-hover:shadow-lg">
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-3xl">
                          {getCountryFlag(league.country)}
                        </div>
                        <div
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            getLeagueCategory(league.league_name) === "Top Tier"
                              ? "bg-gold-100 text-gold-800 border border-gold-200"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {getLeagueCategory(league.league_name)}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                          {league.league_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {league.country}
                        </p>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                              {league.team_count}
                            </div>
                            <div className="text-xs text-gray-500">Teams</div>
                          </div>
                        </div>
                        <div className="text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <svg
                            className="w-5 h-5"
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

                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">View Details</span>
                          <span className="text-blue-600 font-medium">
                            Standings • Stats • Predictions →
                          </span>
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