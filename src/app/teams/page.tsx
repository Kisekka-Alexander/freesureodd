"use client";

import { useState, useEffect } from "react";
import { Team, League } from "@/types";
import { teamsApi, leaguesApi } from "@/lib/axios";
import Link from "next/link";

export default function TeamsPage() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const teamsPerPage = 24;

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
    const fetchTeams = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = {
          limit: teamsPerPage * currentPage,
          offset: 0,
          ...(selectedLeague && { league_id: selectedLeague }),
          ...(searchTerm && { search: searchTerm }),
          sort_by: "name" as const,
          sort_order: "asc" as const,
        };

        const response = await teamsApi.getTeams(params);

        if (response.success) {
          setTeams(response.data.teams);
          setHasMore(response.data.teams.length === teamsPerPage * currentPage);
        } else {
          throw new Error(response.message || "Failed to fetch teams");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch teams";
        setError(errorMessage);
        console.error("Error fetching teams:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTeams();
  }, [selectedLeague, searchTerm, currentPage]);

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const handleReset = () => {
    setSelectedLeague(null);
    setSearchTerm("");
    setCurrentPage(1);
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-green-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              ⚽ Football Teams
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Explore teams from top leagues with detailed statistics and
              analysis
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search teams..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="text-gray-400">🔍</span>
                </div>
              </div>

              {/* League Filter */}
              <select
                value={selectedLeague || ""}
                onChange={(e) => {
                  setSelectedLeague(
                    e.target.value ? parseInt(e.target.value) : null
                  );
                  setCurrentPage(1);
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Leagues</option>
                {leagues.map((league) => (
                  <option key={league.league_id} value={league.league_id}>
                    {getCountryFlag(league.country)} {league.league_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Reset Button */}
            {(selectedLeague || searchTerm) && (
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Teams Grid */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && currentPage === 1 && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <span className="text-lg text-gray-600">Loading teams...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-medium text-lg mb-2">Failed to Load Teams</p>
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

          {!loading && !error && teams.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">⚽</div>
              <p className="text-gray-600 text-xl mb-4">No teams found.</p>
              <p className="text-gray-500">
                Try adjusting your search or filter criteria.
              </p>
            </div>
          )}

          {!loading && !error && teams.length > 0 && (
            <div>
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                  {selectedLeague
                    ? `Teams in ${
                        leagues.find((l) => l.league_id === selectedLeague)
                          ?.league_name
                      }`
                    : "All Teams"}
                </h2>
                <p className="text-gray-600">
                  {teams.length} teams found
                  {searchTerm && ` matching "${searchTerm}"`}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                {teams.map((team) => (
                  <Link
                    key={team.team_id}
                    href={`/teams/${team.team_id}`}
                    className="group"
                  >
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1 text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.team_name}
                            className="w-12 h-12 object-contain"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                              const nextElement = e.currentTarget
                                .nextElementSibling as HTMLElement;
                              if (nextElement) {
                                nextElement.style.display = "block";
                              }
                            }}
                          />
                        ) : null}
                        <span
                          className="text-2xl"
                          style={{ display: team.logo_url ? "none" : "block" }}
                        >
                          ⚽
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 text-sm">
                        {team.team_name}
                      </h3>

                      <div className="flex items-center justify-center space-x-1 text-xs text-gray-500">
                        <span>{getCountryFlag(team.league.country)}</span>
                        <span>{team.league.league_name}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Load More Button */}
              {hasMore && !loading && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold disabled:opacity-50"
                  >
                    {loading ? "Loading..." : "Load More Teams"}
                  </button>
                </div>
              )}

              {loading && currentPage > 1 && (
                <div className="text-center mt-8">
                  <div className="inline-flex items-center space-x-2 text-gray-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                    <span>Loading more teams...</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
