"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Team, TeamStats, Match, Prediction } from "@/types";
import { teamsApi, predictionsApi } from "@/lib/axios";
import Link from "next/link";
import Image from "next/image";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = parseInt(params.id as string);

  const [team, setTeam] = useState<Team | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats | null>(null);
  const [recentMatches, setRecentMatches] = useState<Match[]>([]);
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);

  const [activeTab, setActiveTab] = useState<
    "overview" | "matches" | "predictions"
  >("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all teams to find the current one
        const teamsResponse = await teamsApi.getTeams({ limit: 1000 });
        let foundTeam: Team | undefined;
        if (teamsResponse.success) {
          foundTeam = teamsResponse.data.teams.find(
            (t) => t.team_id === teamId
          );
          if (foundTeam) {
            setTeam(foundTeam);
          }
        }

        // Try to fetch team stats
        try {
          const statsResponse = await teamsApi.getTeamStats(teamId);
          if (statsResponse.success) {
            setTeamStats(statsResponse.data);
          }
        } catch {
          console.log("Team stats not available");
        }

        // Try to fetch recent and upcoming matches
        try {
          const recentResponse = await teamsApi.getTeamMatches(teamId, {
            limit: 10,
            status: "completed",
          });
          if (recentResponse.success && recentResponse.data.matches) {
            setRecentMatches(recentResponse.data.matches);
          }

          const upcomingResponse = await teamsApi.getTeamMatches(teamId, {
            limit: 10,
            status: "upcoming",
          });
          if (upcomingResponse.success && upcomingResponse.data.matches) {
            setUpcomingMatches(upcomingResponse.data.matches);
          }
        } catch {
          console.log("Team matches not available");
        }

        // Try to fetch predictions involving this team
        try {
          const predictionsResponse = await predictionsApi.getAllPredictions({
            limit: 50,
            status: "upcoming",
          });
          if (predictionsResponse.success) {
            // Filter predictions that involve this team
            const teamPredictions = predictionsResponse.data.predictions.filter(
              (p) =>
                p.home_team === foundTeam?.team_name ||
                p.away_team === foundTeam?.team_name
            );
            setPredictions(teamPredictions);
          }
        } catch {
          console.log("Predictions not available");
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch team data";
        setError(errorMessage);
        console.error("Error fetching team data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchTeamData();
    }
  }, [teamId]);

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

  const getMatchResult = (match: Match, teamName: string) => {
    if (
      match.match_status !== "completed" ||
      !match.home_score ||
      !match.away_score
    ) {
      return null;
    }

    const isHome = match.home_team === teamName;
    const teamScore = isHome ? match.home_score : match.away_score;
    const opponentScore = isHome ? match.away_score : match.home_score;

    if (teamScore > opponentScore) return "W";
    if (teamScore < opponentScore) return "L";
    return "D";
  };

  const getResultColor = (result: string | null) => {
    switch (result) {
      case "W":
        return "bg-green-100 text-green-800";
      case "L":
        return "bg-red-100 text-red-800";
      case "D":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <span className="text-lg text-gray-600">Loading team data...</span>
        </div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
            <div className="text-4xl mb-3">⚠️</div>
            <p className="font-medium text-lg mb-2">Team Not Found</p>
            <p className="text-sm">
              {error || "The requested team could not be found."}
            </p>
          </div>
          <Link
            href="/teams"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            ← Back to Teams
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <section className="bg-gradient-to-r from-green-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <nav className="mb-8">
            <Link
              href="/teams"
              className="text-blue-200 hover:text-white transition-colors"
            >
              ← Back to Teams
            </Link>
          </nav>

          <div className="flex items-center space-x-6">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center">
              {team.logo_url ? (
                <Image
                  src={team.logo_url}
                  alt={team.team_name}
                  width={80}
                  height={80}
                  className="object-contain"
                />
              ) : (
                <div className="w-20 h-20 flex items-center justify-center text-4xl text-gray-400">
                  ⚽
                </div>
              )}
            </div>
            <div>
              <h1 className="text-4xl md:text-6xl font-bold mb-2">
                {team.team_name}
              </h1>
              <p className="text-xl opacity-90 mb-4">
                {getCountryFlag(team.league.country)} {team.league.league_name}
              </p>
              <div className="flex items-center space-x-6">
                {teamStats && (
                  <>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {teamStats.matches_played}
                      </div>
                      <div className="text-sm opacity-75">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{teamStats.wins}</div>
                      <div className="text-sm opacity-75">Wins</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {Math.round(teamStats.win_percentage)}%
                      </div>
                      <div className="text-sm opacity-75">Win Rate</div>
                    </div>
                  </>
                )}
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
              { id: "matches", label: "Matches", icon: "⚽" },
              { id: "predictions", label: "Predictions", icon: "🎯" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id as "overview" | "matches" | "predictions")
                }
                className={`flex items-center space-x-2 px-4 py-4 border-b-2 transition-colors ${activeTab === tab.id
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
              {/* Stats Grid */}
              {teamStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {teamStats.matches_played}
                    </div>
                    <div className="text-sm text-gray-600">Matches Played</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {teamStats.wins}
                    </div>
                    <div className="text-sm text-gray-600">Wins</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-yellow-600 mb-2">
                      {teamStats.draws}
                    </div>
                    <div className="text-sm text-gray-600">Draws</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-red-600 mb-2">
                      {teamStats.losses}
                    </div>
                    <div className="text-sm text-gray-600">Losses</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {teamStats.goals_for}
                    </div>
                    <div className="text-sm text-gray-600">Goals For</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-orange-600 mb-2">
                      {teamStats.goals_against}
                    </div>
                    <div className="text-sm text-gray-600">Goals Against</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-indigo-600 mb-2">
                      {teamStats.goal_difference > 0 ? "+" : ""}
                      {teamStats.goal_difference}
                    </div>
                    <div className="text-sm text-gray-600">Goal Difference</div>
                  </div>
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="text-3xl font-bold text-pink-600 mb-2">
                      {Math.round(teamStats.win_percentage)}%
                    </div>
                    <div className="text-sm text-gray-600">Win Percentage</div>
                  </div>
                </div>
              )}

              {/* Recent Form */}
              {teamStats && teamStats.form && teamStats.form.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    📈 Recent Form
                  </h3>
                  <div className="flex items-center space-x-2">
                    {teamStats.form.slice(-10).map((result, index) => (
                      <div
                        key={index}
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getResultColor(
                          result
                        )}`}
                      >
                        {result}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Most recent results (W = Win, D = Draw, L = Loss)
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <div className="space-y-8">
              {/* Upcoming Matches */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  🔜 Upcoming Matches
                </h3>
                {upcomingMatches.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-4xl mb-2">📅</div>
                    <p className="text-gray-600">
                      No upcoming matches scheduled.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {upcomingMatches.map((match) => (
                      <div
                        key={match.match_id}
                        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="text-center">
                              <div className="font-semibold">
                                {match.home_team}
                              </div>
                              <div className="text-sm text-gray-500">vs</div>
                              <div className="font-semibold">
                                {match.away_team}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {match.league_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(match.match_date).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(match.match_date).toLocaleTimeString(
                                [],
                                { hour: "2-digit", minute: "2-digit" }
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent Matches */}
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  📊 Recent Matches
                </h3>
                {recentMatches.length === 0 ? (
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                    <div className="text-4xl mb-2">📊</div>
                    <p className="text-gray-600">
                      No recent match data available.
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {recentMatches.map((match) => {
                      const result = getMatchResult(match, team.team_name);
                      return (
                        <div
                          key={match.match_id}
                          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              {result && (
                                <div
                                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${getResultColor(
                                    result
                                  )}`}
                                >
                                  {result}
                                </div>
                              )}
                              <div className="text-center">
                                <div className="font-semibold">
                                  {match.home_team}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {match.home_score} - {match.away_score}
                                </div>
                                <div className="font-semibold">
                                  {match.away_team}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">
                                {match.league_name}
                              </div>
                              <div className="text-sm text-gray-500">
                                {new Date(
                                  match.match_date
                                ).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "predictions" && (
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 Upcoming Predictions
              </h3>
              {predictions.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-gray-600">
                    No upcoming predictions for this team.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {predictions.map((prediction) => (
                    <div
                      key={prediction.match_id}
                      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                          {prediction.league_name} •{" "}
                          {new Date(prediction.match_date).toLocaleDateString()}
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-xs font-medium ${prediction.prediction.confidence > 0.7
                            ? "bg-green-100 text-green-800"
                            : prediction.prediction.confidence >= 0.5
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-red-100 text-red-800"
                            }`}
                        >
                          {Math.round(prediction.prediction.confidence * 100)}%
                          confidence
                        </div>
                      </div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-semibold">
                            {prediction.home_team}
                          </div>
                          <div className="text-gray-400 font-bold">VS</div>
                          <div className="text-lg font-semibold">
                            {prediction.away_team}
                          </div>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full font-medium ${prediction.prediction.predicted_outcome === "Home"
                            ? "bg-green-100 text-green-800"
                            : prediction.prediction.predicted_outcome ===
                              "Away"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                            }`}
                        >
                          {prediction.prediction.predicted_outcome}
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            Home Win
                          </div>
                          <div className="font-bold">
                            {Math.round(
                              prediction.prediction.probabilities.Home * 100
                            )}
                            %
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">Draw</div>
                          <div className="font-bold">
                            {Math.round(
                              prediction.prediction.probabilities.Draw * 100
                            )}
                            %
                          </div>
                        </div>
                        <div className="text-center p-3 bg-gray-50 rounded-lg">
                          <div className="text-xs text-gray-500 mb-1">
                            Away Win
                          </div>
                          <div className="font-bold">
                            {Math.round(
                              prediction.prediction.probabilities.Away * 100
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
    </div>
  );
}
