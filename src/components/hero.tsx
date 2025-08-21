import { Prediction } from "@/types";
import { useEffect, useState } from "react";
import {
  formatCompactDate,
  getRelativeTime,
  isMatchToday,
  formatTimeOnly,
} from "@/utils/date";

// PredictionCard component
interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const {
    home_team,
    away_team,
    league_name,
    match_date,
    match_status,
    prediction: predictionData,
  } = prediction;

  const getStatusColor = (status: string) => {
    const liveStatuses = new Set(["LIVE", "1H", "2H", "HT", "ET", "P"]);
    const upcomingStatuses = new Set(["NS", "TBD"]);
    const completedStatuses = new Set(["FT"]);
    const canceledStatuses = new Set(["CANC", "PST", "A", "ABD", "INT"]);

    if (liveStatuses.has(status)) return "text-red-600 bg-red-100";
    if (upcomingStatuses.has(status)) return "text-blue-600 bg-blue-100";
    if (completedStatuses.has(status)) return "text-gray-600 bg-gray-100";
    if (canceledStatuses.has(status)) return "text-gray-600 bg-gray-100";
    return "text-gray-600 bg-gray-100";
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case "Home":
        return "text-blue-600";
      case "Away":
        return "text-purple-600";
      case "Draw":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {/* Match Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-sm text-gray-500">
            <div>{league_name}</div>
            <div className="mt-1">
              {formatCompactDate(match_date)}
              {isMatchToday(match_date) && (
                <span className="ml-2 text-blue-600 font-semibold">
                  {getRelativeTime(match_date)}
                </span>
              )}
            </div>
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              match_status
            )}`}
          >
            {match_status}
          </div>
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-semibold">{home_team}</div>
          <div className="text-gray-400">vs</div>
          <div className="text-lg font-semibold">{away_team}</div>
        </div>
      </div>

      {/* Prediction */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Predicted Outcome:</div>
        <div className="flex items-center space-x-4">
          <div
            className={`text-xl font-bold ${getOutcomeColor(
              predictionData.predicted_outcome
            )}`}
          >
            {predictionData.predicted_outcome}
          </div>
        </div>
      </div>

      {/* Probabilities */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-2">Probabilities:</div>
        <div className="flex space-x-4">
          <div className="text-center">
            <div className="text-xs text-gray-500">Home</div>
            <div className="font-medium">
              {Math.round(predictionData.probabilities.home * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Draw</div>
            <div className="font-medium">
              {Math.round(predictionData.probabilities.draw * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Away</div>
            <div className="font-medium">
              {Math.round(predictionData.probabilities.away * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="border-t pt-3">
        <div className="text-sm text-gray-600 mb-1">Model:</div>
        {predictionData.model_info && (
          <div className="text-sm text-gray-800 mb-2">
            {predictionData.model_info.name} v
            {predictionData.model_info.version}
          </div>
        )}
        {predictionData.error && (
          <div className="text-xs text-yellow-600">
            ⚠️ {predictionData.error}
          </div>
        )}
      </div>
    </div>
  );
}

interface HeroProps {
  predictions?: Prediction[];
}

export function Hero({ predictions = [] }: HeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);

  // Get top 3 predictions for cycling (by match date)
  const topPredictions = predictions
    .slice() // Create a copy to avoid mutating original array
    .sort(
      (a, b) =>
        new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
    )
    .slice(0, 3);

  const displayMatches = topPredictions;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const featuredTimer = setInterval(() => {
      if (displayMatches.length > 0) {
        setFeaturedIndex((prev) => (prev + 1) % displayMatches.length);
      }
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(featuredTimer);
    };
  }, [displayMatches.length]);

  // Reset featured index when predictions change or if it's out of bounds
  useEffect(() => {
    if (displayMatches.length === 0 || featuredIndex >= displayMatches.length) {
      setFeaturedIndex(0);
    }
  }, [displayMatches.length, featuredIndex]);

  // Convert real prediction data to match interface
  const getFeaturedMatch = () => {
    if (topPredictions.length > 0 && featuredIndex < topPredictions.length) {
      const prediction = topPredictions[featuredIndex];
      // Additional safety check to ensure prediction exists
      if (prediction && prediction.home_team && prediction.away_team) {
        return {
          homeTeam: prediction.home_team,
          awayTeam: prediction.away_team,
          league: prediction.league_name,
          time: formatTimeOnly(prediction.match_date),
          prediction: (() => {
            const o = prediction.prediction.predicted_outcome;
            if (o === "Home") return "1";
            if (o === "Draw") return "X";
            if (o === "Away") return "2";
            if (o === "Home or Draw") return "1X";
            if (o === "Away or Draw") return "X2";
            if (o === "Home or Away") return "12";
            return "?";
          })(),

          homeOdds: prediction.home_odds,
          drawOdds: prediction.draw_odds,
          awayOdds: prediction.away_odds,
        };
      }
    }

    // Return placeholder data when no predictions are available or invalid
    return {
      homeTeam: "No matches",
      awayTeam: "available",
      league: "Try adjusting filters",
      time: "--:--",
      prediction: "X",
      homeOdds: 0,
      drawOdds: 0,
      awayOdds: 0,
    };
  };

  const featuredMatch = getFeaturedMatch();

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 text-white">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/5 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-white/3 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-16 h-16 bg-white/4 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-white/3 rounded-full animate-bounce delay-500"></div>
      </div>

      <div className="container mx-auto px-4 py-20 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Main Content */}
          <div className="text-left">
            {/* Live indicator */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium bg-red-500/20 px-3 py-1 rounded-full">
                LIVE PREDICTIONS
              </span>
              <span className="text-sm text-white/80">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="mb-6 text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              <span className="block">Win More with</span>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Smart Football
              </span>
              <span className="block">Predictions ⚽</span>
            </h1>

            <p className="mb-8 text-lg md:text-xl text-white/90 max-w-2xl">
              Get AI-powered match predictions with up to{" "}
              <span className="font-bold text-yellow-300">85% accuracy</span>.
              Join thousands of football fans making smarter decisions.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-yellow-300">
                  98%
                </div>
                <div className="text-sm text-white/80">Accuracy Rate</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-300">
                  50K+
                </div>
                <div className="text-sm text-white/80">Happy Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-300">
                  15+
                </div>
                <div className="text-sm text-white/80">Leagues</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-8 py-4 rounded-lg font-bold text-lg hover:from-yellow-300 hover:to-orange-400 transition-all duration-300 transform hover:scale-105 shadow-lg">
                🎯 View Today&apos;s Tips
              </button>
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                📊 See Our Track Record
              </button>
            </div>
          </div>

          {/* Right Column - Featured Match Preview */}
          <div className="lg:text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">🔥 Featured Match</h3>
                <span className="text-sm bg-white/20 px-2 py-1 rounded">
                  {featuredMatch.league}
                </span>
              </div>

              <div className="text-center mb-6">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-right flex-1">
                    <div className="font-bold text-lg">
                      {featuredMatch.homeTeam}
                    </div>
                  </div>
                  <div className="mx-4">
                    <div className="text-2xl">VS</div>
                    <div className="text-sm text-white/70">
                      {featuredMatch.time}
                    </div>
                  </div>
                  <div className="text-left flex-1">
                    <div className="font-bold text-lg">
                      {featuredMatch.awayTeam}
                    </div>
                  </div>
                </div>
              </div>

              {/* Prediction showcase */}
              <div className="bg-white/20 rounded-lg p-4 mb-4">
                <div className="text-center mb-3">
                  <div className="text-sm text-white/80 mb-1">
                    AI Prediction
                  </div>
                  <div className="text-3xl font-bold text-yellow-300">
                    {featuredMatch.prediction === "1"
                      ? "HOME WIN"
                      : featuredMatch.prediction === "X"
                      ? "DRAW"
                      : featuredMatch.prediction === "1X"
                      ? "HOME OR DRAW"
                      : featuredMatch.prediction === "2X"
                      ? "AWAY OR DRAW"
                      : "AWAY WIN"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-white/70">Home</div>
                    <div className="font-bold">{featuredMatch.homeOdds}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Draw</div>
                    <div className="font-bold">{featuredMatch.drawOdds}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Away</div>
                    <div className="font-bold">{featuredMatch.awayOdds}</div>
                  </div>
                </div>
              </div>

              {/* Progress indicators */}
              {displayMatches.length > 0 && (
                <div className="flex justify-center space-x-2">
                  {displayMatches.map((_, index: number) => (
                    <div
                      key={index}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        index === featuredIndex
                          ? "bg-yellow-300"
                          : "bg-white/30"
                      }`}
                    ></div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick access buttons */}
            <div className="grid grid-cols-2 gap-4 mt-6">
              <button className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-1">🏆</div>
                <div className="text-sm font-medium">Top Leagues</div>
              </button>
              <button className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-colors">
                <div className="text-2xl mb-1">📱</div>
                <div className="text-sm font-medium">Live Scores</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
