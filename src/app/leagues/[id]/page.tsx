"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { League, Prediction, Standing, StandingsResponse } from "@/types";
import { leaguesApi, predictionsApi } from "@/lib/axios";
import { PredictionsTable } from "@/components/predictions-table";
import Link from "next/link";
import { formatCompactDate } from "@/utils/date";

export default function LeagueDetailPage() {
  const params = useParams();
  const leagueId = parseInt(params.id as string);

  const [league, setLeague] = useState<League | null>(null);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [standings, setStandings] = useState<Standing[]>([]);
  const [season, setSeason] = useState<string>("2023-2024"); // Default season
  const [availableSeasons, setAvailableSeasons] = useState<string[]>([
    "2023-2024",
    "2022-2023",
    "2021-2022",
  ]);
  const [seasonsLoading, setSeasonsLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<
    "overview" | "predictions" | "standings"
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
            (l: League) => l.league_id === leagueId
          );
          if (foundLeague) {
            setLeague(foundLeague);
          }
        }

        // Fetch predictions for this league
        const predictionsResponse = await predictionsApi.getAllPredictions({
          league_id: leagueId,
        });
        if (predictionsResponse.success) {
          setPredictions(predictionsResponse.data.predictions);
        }

        // Try to fetch standings
        try {
          const standingsResponse = (await leaguesApi.getLeagueStandings(
            leagueId,
            season
          )) as StandingsResponse;

          if (standingsResponse.success) {
            setStandings(standingsResponse.data.standings);
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
      } catch (err: unknown) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch league data";
        setError(errorMessage);
        console.error("Error fetching league data:", err);
      } finally {
        setLoading(false);
      }
    };

    // Fetch available seasons separately
    const fetchAvailableSeasons = async () => {
      if (leagueId) {
        try {
          setSeasonsLoading(true);
          const seasons = await leaguesApi.getAvailableSeasons(leagueId);
          setAvailableSeasons(seasons);

          // If current season is not in available seasons, use the first available one
          if (seasons.length > 0 && !seasons.includes(season)) {
            setSeason(seasons[0]);
          }
        } catch {
          console.log("Could not fetch available seasons, using defaults");
        } finally {
          setSeasonsLoading(false);
        }
      }
    };

    if (leagueId) {
      fetchAvailableSeasons();
      fetchLeagueData();
    }
  }, [leagueId, season]);

  const getCountryFlag = (country: string) => {
    const flags: Record<string, string> = {
      England: "🏴",
      Spain: "🇪🇸",
      Italy: "🇮🇹",
      Germany: "🇩🇪",
      France: "🇫🇷",
      Netherlands: "🇳🇱",
      Scotland: "🏴",
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
              { id: "predictions", label: "Predictions", icon: "🎯" },
              { id: "standings", label: "Standings", icon: "🏆" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id as "overview" | "predictions" | "standings"
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                          <div>{formatCompactDate(prediction.match_date)}</div>
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
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  League Standings
                </h2>
                <div className="flex items-center space-x-2">
                  <label
                    htmlFor="season"
                    className="text-sm font-medium text-gray-700"
                  >
                    Season:
                  </label>
                  <select
                    id="season"
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    disabled={seasonsLoading}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    {availableSeasons.map((seasonOption) => (
                      <option key={seasonOption} value={seasonOption}>
                        {seasonOption}
                      </option>
                    ))}
                  </select>
                  {seasonsLoading && (
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  )}
                </div>
              </div>
              {standings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-gray-600">
                    Standings data not available for this league and season.
                  </p>
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead className="bg-gray-50">
                        <tr className="text-gray-600 border-b">
                          <th className="py-3 px-4 text-xs font-medium uppercase">
                            #
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase">
                            Team
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            P
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            W
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            D
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            L
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            GF
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            GA
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            GD
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            Pts
                          </th>
                          <th className="py-3 px-4 text-xs font-medium uppercase text-center">
                            Form
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {standings.map((standing) => (
                          <tr
                            key={standing.team.team_id}
                            className={`hover:bg-gray-50 border-b border-gray-100 ${
                              standing.position <= 4
                                ? "border-l-4 border-l-green-500"
                                : standing.position >= 18
                                ? "border-l-4 border-l-red-500"
                                : standing.position >= 5 &&
                                  standing.position <= 6
                                ? "border-l-4 border-l-blue-500"
                                : ""
                            }`}
                          >
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {standing.position}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <span className="w-6 h-6 mr-3 bg-gray-200 rounded-full flex items-center justify-center text-xs">
                                  {standing.team.team_name
                                    .substring(0, 2)
                                    .toUpperCase()}
                                </span>
                                <span className="font-medium">
                                  {standing.team.team_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                              {standing.matches_played}
                            </td>
                            <td className="py-3 px-4 text-center text-green-600 font-medium">
                              {standing.wins}
                            </td>
                            <td className="py-3 px-4 text-center text-yellow-600 font-medium">
                              {standing.draws}
                            </td>
                            <td className="py-3 px-4 text-center text-red-600 font-medium">
                              {standing.losses}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                              {standing.goals_scored}
                            </td>
                            <td className="py-3 px-4 text-center text-gray-600">
                              {standing.goals_conceded}
                            </td>
                            <td className="py-3 px-4 text-center font-medium">
                              <span
                                className={
                                  standing.goal_difference >= 0
                                    ? "text-green-600"
                                    : "text-red-600"
                                }
                              >
                                {standing.goal_difference > 0 ? "+" : ""}
                                {standing.goal_difference}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-center font-bold text-gray-900">
                              {standing.points}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex space-x-1 justify-center">
                                {standing.form
                                  .split("")
                                  .slice(-5)
                                  .map((result, idx) => (
                                    <span
                                      key={idx}
                                      className={`w-5 h-5 rounded-full text-xs font-bold flex items-center justify-center text-white ${
                                        result === "W"
                                          ? "bg-green-500"
                                          : result === "D"
                                          ? "bg-yellow-500"
                                          : "bg-red-500"
                                      }`}
                                    >
                                      {result}
                                    </span>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 text-xs text-gray-600">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                        <span>Champions League</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-blue-500 rounded mr-2"></div>
                        <span>Europa League</span>
                      </div>
                      <div className="flex items-center">
                        <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                        <span>Relegation</span>
                      </div>
                    </div>
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
