import { Prediction } from "@/types";

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
    predicted_at,
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

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
      <div className="container mx-auto px-4 py-32">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-accent to-accent/80 bg-clip-text text-transparent">
              Football Predictions
            </span>
          </h1>
          <p className="mb-8 text-xl text-primary-foreground/90 md:text-2xl">
            Mathematical football predictions /forebets/ and football statistics
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button className="rounded-lg bg-background px-8 py-3 font-semibold text-foreground transition-colors hover:bg-background/90">
              Get Started
            </button>
            <button className="rounded-lg border border-primary-foreground/20 px-8 py-3 font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
