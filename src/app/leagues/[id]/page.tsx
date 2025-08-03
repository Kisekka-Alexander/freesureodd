"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { League, Team, Prediction } from "@/types";
import { leaguesApi, teamsApi, predictionsApi } from "@/lib/axios";
import { PredictionsTable } from "@/components/predictions-table";
import Link from "next/link";

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = parseInt(params.id as string);

  const [league, setLeague] = useState<League | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [standings, setStandings] = useState<object | null>(null);

  const [activeTab, setActiveTab] = useState<
    "overview" | "teams" | "predictions" | "standings"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeagueData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all leagues to find the current one
        const leaguesResponse = await leaguesApi.getLeagues();
        if (leaguesResponse.success) {
          const foundLeague = leaguesResponse.data.leagues.find(
            (l) => l.league_id === leagueId
          );
          if (foundLeague) {
            setLeague(foundLeague);
          }
        }

        // Fetch teams for this league
        const teamsResponse = await teamsApi.getTeams({
          league_id: leagueId,
          limit: 50,
        });
        if (teamsResponse.success) {
          setTeams(teamsResponse.data.teams);
        }

        // Fetch predictions for this league
        const predictionsResponse = await predictionsApi.getAllPredictions({
          league_id: leagueId,
          limit: 20,
          status: "upcoming",
        });
        if (predictionsResponse.success) {
          setPredictions(predictionsResponse.data.predictions);
        }

        // Try to fetch standings
        try {
          const standingsResponse = await leaguesApi.getLeagueStandings(
            leagueId
          );
          if (standingsResponse.success) {
            setStandings(standingsResponse.data);
          }
        } catch {
          console.log("Standings not available for this league");
        }

        // Try to fetch top performers
        try {
          await leaguesApi.getLeagueTopPerformers(leagueId, "goals");
        } catch {
          console.log("Top performers not available for this league");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch league data";
        setError(errorMessage);
        console.error("Error fetching league data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (leagueId) {
      fetchLeagueData();
    }
  }, [leagueId]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <span className="text-lg text-gray-600">Loading league data...</span>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-medium text-lg mb-2">League Not Found</p>
            <p className="text-sm">
              {error || "The requested league could not be found."}
            </p>
          </div>
          <Link
            href="/leagues"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            ← Back to Leagues
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="mb-8">
            <Link
              href="/leagues"
              className="text-blue-200 hover:text-white transition-colors"
            >
              ← Back to Leagues
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <div className="text-6xl">{getCountryFlag(league.country)}</div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                {league.league_name}
              </h1>
              <p className="text-xl opacity-90 mb-4">{league.country}</p>
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <div className="text-2xl font-bold">{league.team_count}</div>
                  <div className="text-sm opacity-75">Teams</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">{predictions.length}</div>
                  <div className="text-sm opacity-75">Upcoming Predictions</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-6">
          <div className="flex space-x-8">
            {[
              { id: "overview", label: "Overview", icon: "📊" },
              { id: "teams", label: "Teams", icon: "🏟️" },
              { id: "predictions", label: "Predictions", icon: "🎯" },
              { id: "standings", label: "Standings", icon: "🏆" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "overview" | "teams" | "predictions" | "standings"
                  )
                }
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600 font-semibold"
                    : "border-transparent text-gray-600 hover:text-gray-800"
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {activeTab === "overview" && (
            <div className="space-y-12">
              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {league.team_count}
                  </div>
                  <div className="text-sm text-gray-600">Total Teams</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {predictions.length}
                  </div>
                  <div className="text-sm text-gray-600">Upcoming Matches</div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {
                      predictions.filter((p) => p.prediction.confidence > 0.7)
                        .length
                    }
                  </div>
                  <div className="text-sm text-gray-600">
                    High Confidence Tips
                  </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {getCountryFlag(league.country)}
                  </div>
                  <div className="text-sm text-gray-600">{league.country}</div>
                </div>
              </div>

              {/* Recent Predictions Preview */}
              {predictions.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    🎯 Latest Predictions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {predictions.slice(0, 6).map((prediction) => (
                      <div
                        key={prediction.match_id}
                        className="p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="text-sm text-gray-500 mb-2">
                          {new Date(prediction.match_date).toLocaleDateString()}
                        </div>
                        <div className="font-semibold text-gray-900 mb-1">
                          {prediction.home_team} vs {prediction.away_team}
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              prediction.prediction.predicted_outcome === "Home"
                                ? "bg-green-100 text-green-800"
                                : prediction.prediction.predicted_outcome ===
                                  "Away"
                                ? "bg-red-100 text-red-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}
                          >
                            {prediction.prediction.predicted_outcome}
                          </span>
                          <span className="text-sm text-gray-600">
                            {Math.round(prediction.prediction.confidence * 100)}
                            %
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <button
                      onClick={() => setActiveTab("predictions")}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All Predictions →
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "teams" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Teams in {league.league_name}
              </h2>
              {teams.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏟️</div>
                  <p className="text-gray-600">
                    No teams data available for this league.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {teams.map((team) => (
                    <Link
                      key={team.team_id}
                      href={`/teams/${team.team_id}`}
                      className="group"
                    >
                      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all hover:-translate-y-1">
                        <div className="text-center">
                          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            {team.logo_url ? (
                              <img
                                src={team.logo_url}
                                alt={team.team_name}
                                className="w-12 h-12 object-contain"
                              />
                            ) : (
                              <span className="text-2xl">⚽</span>
                            )}
                          </div>
                          <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {team.team_name}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "predictions" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Predictions for {league.league_name}
              </h2>
              {predictions.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🎯</div>
                  <p className="text-gray-600">
                    No predictions available for this league.
                  </p>
                </div>
              ) : (
                <PredictionsTable predictions={predictions} />
              )}
            </div>
          )}

          {activeTab === "standings" && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                League Standings
              </h2>
              {!standings ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-gray-600">
                    Standings data not available for this league.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <pre className="text-sm">
                    {JSON.stringify(standings, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
