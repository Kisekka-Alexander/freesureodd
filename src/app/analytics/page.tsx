"use client";

import { useState, useEffect } from "react";
import { AccuracyAnalytics, TrendsAnalytics, League } from "@/types";
import { analyticsApi, leaguesApi } from "@/lib/axios";

// Import with type assertion to handle missing types
const { getCountryCode, flag } = require("country-flag-emoji") as {
  getCountryCode: (countryName: string) => string | undefined;
  flag: (countryCode: string) => string | undefined;
};

export default function AnalyticsPage() {
  const [accuracyData, setAccuracyData] = useState<AccuracyAnalytics | null>(
    null
  );
  const [trendsData, setTrendsData] = useState<TrendsAnalytics | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);

  const [selectedLeague, setSelectedLeague] = useState<number | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<
    "accuracy" | "predictions_count" | "avg_confidence"
  >("accuracy");
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7d" | "30d" | "90d" | "1y"
  >("30d");
  const [breakdown, setBreakdown] = useState<
    "league" | "outcome" | "date" | "overall"
  >("overall");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const fetchAnalyticsData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch accuracy analytics
        const accuracyResponse = await analyticsApi.getAccuracyAnalytics({
          breakdown_by: breakdown,
        });
        if (accuracyResponse.success) {
          setAccuracyData(accuracyResponse.data);
        }

        // Fetch trends analytics
        const trendsResponse = await analyticsApi.getTrends({
          metric: selectedMetric,
          period: selectedPeriod,
          ...(selectedLeague && { league_id: selectedLeague }),
          granularity:
            selectedPeriod === "7d"
              ? "daily"
              : selectedPeriod === "30d"
                ? "daily"
                : "weekly",
        });
        if (trendsResponse.success) {
          setTrendsData(trendsResponse.data);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to fetch analytics data";
        setError(errorMessage);
        console.error("Error fetching analytics data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [selectedLeague, selectedMetric, selectedPeriod, breakdown]);

  const getCountryFlag = (country: string) => {
    // Try to get the country code first
    const countryCode = getCountryCode(country);

    if (countryCode) {
      // Get flag emoji using country code
      const flagEmoji = flag(countryCode);
      if (flagEmoji) {
        return flagEmoji;
      }
    }

    // Fallback to manual mapping for special cases or if library fails
    const fallbackFlags: Record<string, string> = {
      England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
      Scotland: "�󠁧󠁢󠁳󠁣󠁴󠁿",
      Wales: "�󠁧󠁢󠁷󠁬󠁳󠁿",
      "Northern Ireland": "🏴󠁧󠁢���󠁿",
    };

    return fallbackFlags[country] || "🌍";
  };

  const getTrendDirection = (direction: "up" | "down" | "stable") => {
    switch (direction) {
      case "up":
        return { icon: "📈", color: "text-green-600", label: "Trending Up" };
      case "down":
        return { icon: "📉", color: "text-red-600", label: "Trending Down" };
      case "stable":
        return { icon: "➡️", color: "text-gray-600", label: "Stable" };
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-700 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              📊 Analytics Dashboard
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Deep insights into prediction performance and trends
            </p>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-white border-b border-gray-200 py-6">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* League Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                League
              </label>
              <select
                value={selectedLeague || ""}
                onChange={(e) =>
                  setSelectedLeague(
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Leagues</option>
                {leagues.map((league) => (
                  <option key={league.league_id} value={league.league_id}>
                    {getCountryFlag(league.country)} {league.league_name}
                  </option>
                ))}
              </select>
            </div>

            {/* Metric Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric
              </label>
              <select
                value={selectedMetric}
                onChange={(e) =>
                  setSelectedMetric(
                    e.target.value as
                    | "accuracy"
                    | "predictions_count"
                    | "avg_confidence"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="accuracy">Prediction Accuracy</option>
                <option value="predictions_count">Predictions Count</option>
                <option value="avg_confidence">Average Confidence</option>
              </select>
            </div>

            {/* Period Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time Period
              </label>
              <select
                value={selectedPeriod}
                onChange={(e) =>
                  setSelectedPeriod(
                    e.target.value as "7d" | "30d" | "90d" | "1y"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
                <option value="1y">Last Year</option>
              </select>
            </div>

            {/* Breakdown Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Breakdown
              </label>
              <select
                value={breakdown}
                onChange={(e) =>
                  setBreakdown(
                    e.target.value as "league" | "outcome" | "date" | "overall"
                  )
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="overall">Overall</option>
                <option value="league">By League</option>
                <option value="outcome">By Outcome</option>
                <option value="date">By Date</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
                <span className="text-lg text-gray-600">
                  Loading analytics data...
                </span>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6 max-w-md mx-auto">
                <div className="text-4xl mb-3">⚠️</div>
                <p className="font-medium text-lg mb-2">
                  Failed to Load Analytics
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

          {!loading && !error && (
            <div className="space-y-12">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {accuracyData && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Overall Accuracy
                      </h3>
                      <span className="text-2xl">🎯</span>
                    </div>
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      {(accuracyData.overall_accuracy * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">
                      Across all predictions
                    </div>
                  </div>
                )}

                {trendsData && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Trend Summary
                      </h3>
                      <span className="text-2xl">
                        {
                          getTrendDirection(trendsData.summary.trend_direction)
                            .icon
                        }
                      </span>
                    </div>
                    <div className="text-3xl font-bold text-purple-600 mb-2">
                      {trendsData.summary.change_percentage > 0 ? "+" : ""}
                      {trendsData.summary.change_percentage.toFixed(1)}%
                    </div>
                    <div
                      className={`text-sm ${getTrendDirection(trendsData.summary.trend_direction)
                          .color
                        }`}
                    >
                      {
                        getTrendDirection(trendsData.summary.trend_direction)
                          .label
                      }
                    </div>
                  </div>
                )}

                {trendsData && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Data Points
                      </h3>
                      <span className="text-2xl">📈</span>
                    </div>
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {trendsData.summary.total_points}
                    </div>
                    <div className="text-sm text-gray-600">
                      Total data points
                    </div>
                  </div>
                )}
              </div>

              {/* Trends Chart */}
              {trendsData && trendsData.data && trendsData.data.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    📊{" "}
                    {selectedMetric
                      .replace("_", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{" "}
                    Trends
                  </h3>

                  {/* Simple chart representation */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600 border-b border-gray-200 pb-2">
                      <span>Date</span>
                      <span>Value</span>
                    </div>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {trendsData.data.map((point, index) => {
                        const maxValue = Math.max(
                          ...trendsData.data.map((p) => p.value)
                        );
                        const percentage = (point.value / maxValue) * 100;

                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
                          >
                            <div className="text-sm text-gray-600">
                              {new Date(point.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="w-32 bg-gray-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full"
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                              <div className="text-sm font-medium w-16 text-right">
                                {selectedMetric === "accuracy" ||
                                  selectedMetric === "avg_confidence"
                                  ? `${(point.value * 100).toFixed(1)}%`
                                  : point.value.toFixed(0)}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Accuracy Breakdown */}
              {accuracyData && accuracyData.breakdown && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    🔍 Accuracy Breakdown{" "}
                    {breakdown !== "overall" && `(by ${breakdown})`}
                  </h3>

                  <div className="space-y-4">
                    {Object.entries(accuracyData.breakdown).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                        >
                          <div className="font-medium text-gray-900">
                            {key.charAt(0).toUpperCase() + key.slice(1)}
                          </div>
                          <div className="text-lg font-bold text-blue-600">
                            {typeof value === "number"
                              ? `${(value * 100).toFixed(1)}%`
                              : JSON.stringify(value)}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {!accuracyData && !trendsData && !loading && !error && (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📊</div>
                  <p className="text-gray-600 text-xl mb-4">
                    No analytics data available.
                  </p>
                  <p className="text-gray-500">
                    Try adjusting your filters or check back later.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
