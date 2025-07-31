import { Prediction } from "@/types";
import { useEffect, useState } from "react";

// PredictionCard component
interface PredictionCardProps {
  prediction: Prediction;
}

export function PredictionCard({ prediction }: PredictionCardProps) {
  const {
    match_info,
    predicted_outcome,
    confidence,
    probabilities,
    model_info,
    features_used,
  } = prediction;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "text-red-600 bg-red-100";
      case "upcoming":
        return "text-blue-600 bg-blue-100";
      case "completed":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getConfidenceColor = (confidence: number) => {
    const confidencePercent = confidence * 100; // Convert from 0-1 to 0-100
    if (confidencePercent >= 70) return "text-green-600 bg-green-100";
    if (confidencePercent >= 50) return "text-yellow-600 bg-yellow-100";
    return "text-red-600 bg-red-100";
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
            {match_info.league} • {formatDate(match_info.match_date)}
          </div>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(
              match_info.match_status
            )}`}
          >
            {match_info.match_status}
          </div>
        </div>
        <div
          className={`px-2 py-1 rounded text-xs font-medium ${getConfidenceColor(
            confidence
          )}`}
        >
          {Math.round(confidence * 100)}% confidence
        </div>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-lg font-semibold">{match_info.home_team}</div>
          <div className="text-gray-400">vs</div>
          <div className="text-lg font-semibold">{match_info.away_team}</div>
        </div>
      </div>

      {/* Prediction */}
      <div className="mb-4">
        <div className="text-sm text-gray-600 mb-1">Predicted Outcome:</div>
        <div className="flex items-center space-x-4">
          <div
            className={`text-xl font-bold ${getOutcomeColor(
              predicted_outcome
            )}`}
          >
            {predicted_outcome}
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
              {Math.round(probabilities.home * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Draw</div>
            <div className="font-medium">
              {Math.round(probabilities.draw * 100)}%
            </div>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-500">Away</div>
            <div className="font-medium">
              {Math.round(probabilities.away * 100)}%
            </div>
          </div>
        </div>
      </div>

      {/* Model Info */}
      <div className="border-t pt-3">
        <div className="text-sm text-gray-600 mb-1">Model:</div>
        <div className="text-sm text-gray-800 mb-2">
          {model_info.model_name} v{model_info.model_version}{" "}
          <span className="text-gray-500">
            (Accuracy: {Math.round(model_info.training_accuracy * 100)}%)
          </span>
        </div>
        <div className="text-xs text-gray-500">
          Features: {features_used.join(", ")}
        </div>
      </div>
    </div>
  );
}

// Mock featured matches for hero - in real app, these would come from props or API
const mockFeaturedMatches = [
  {
    homeTeam: "Manchester City",
    awayTeam: "Liverpool",
    league: "Premier League",
    time: "15:30",
    prediction: "1",
    confidence: 78,
    homeOdds: 45,
    drawOdds: 28,
    awayOdds: 27,
  },
  {
    homeTeam: "Real Madrid",
    awayTeam: "Barcelona",
    league: "La Liga",
    time: "18:00",
    prediction: "X",
    confidence: 65,
    homeOdds: 38,
    drawOdds: 32,
    awayOdds: 30,
  },
  {
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    league: "Bundesliga",
    time: "20:30",
    prediction: "1",
    confidence: 72,
    homeOdds: 52,
    drawOdds: 25,
    awayOdds: 23,
  },
];

export function Hero() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    const featuredTimer = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % mockFeaturedMatches.length);
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(featuredTimer);
    };
  }, []);

  const featuredMatch = mockFeaturedMatches[featuredIndex];

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
                      : "AWAY WIN"}
                  </div>
                  <div className="text-lg text-green-300 font-semibold">
                    {featuredMatch.confidence}% Confidence
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div className="text-center">
                    <div className="text-white/70">Home</div>
                    <div className="font-bold">{featuredMatch.homeOdds}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Draw</div>
                    <div className="font-bold">{featuredMatch.drawOdds}%</div>
                  </div>
                  <div className="text-center">
                    <div className="text-white/70">Away</div>
                    <div className="font-bold">{featuredMatch.awayOdds}%</div>
                  </div>
                </div>
              </div>

              {/* Progress indicators */}
              <div className="flex justify-center space-x-2">
                {mockFeaturedMatches.map((_, index) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === featuredIndex ? "bg-yellow-300" : "bg-white/30"
                    }`}
                  ></div>
                ))}
              </div>
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
