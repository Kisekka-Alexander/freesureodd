import { Prediction } from "@/types";
import { formatMatchDate, getRelativeTime, isMatchToday } from "@/utils/date";

interface PredictionsTableProps {
  predictions: Prediction[];
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {
  const getStatusColor = (status: string) => {
    const liveStatuses = new Set(["LIVE", "1H", "2H", "HT", "ET", "P"]);
    const upcomingStatuses = new Set(["NS", "TBD"]);
    const completedStatuses = new Set(["FT"]);
    const canceledStatuses = new Set(["CANC", "PST", "A", "ABD", "INT"]);

    if (liveStatuses.has(status)) return "bg-red-100 text-red-800";
    if (upcomingStatuses.has(status)) return "bg-blue-100 text-blue-800";
    if (completedStatuses.has(status)) return "bg-gray-100 text-gray-800";
    if (canceledStatuses.has(status)) return "bg-gray-100 text-gray-800";
    return "bg-gray-100 text-gray-800";
  };

  const getPredictionNumber = (outcome: string) => {
    switch (outcome) {
      case "Home":
        return "1";
      case "Draw":
        return "X";
      case "Away":
        return "2";
      case "Home or Draw":
        return "1X";
      case "Away or Draw":
        return "X2";
      case "Home or Away":
        return "12";
      default:
        return "-";
    }
  };

  const getPredictionColor = (outcome: string) => {
    switch (outcome) {
      case "Home":
        return "bg-green-100 text-green-800";
      case "Draw":
        return "bg-yellow-100 text-yellow-800";
      case "Away":
        return "bg-red-100 text-red-800";
      case "Home or Draw":
      case "Away or Draw":
      case "Home or Away":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLeagueIcon = (league: string) => {
    if (league.includes("Champions") || league.includes("UCL")) return "⚽";
    if (league.includes("Premier")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (league.includes("La Liga")) return "🇪🇸";
    if (league.includes("Bundesliga")) return "🇩🇪";
    if (league.includes("Serie A")) return "🇮🇹";
    if (league.includes("Ligue 1")) return "🇫🇷";
    if (league.includes("Championship")) return "🏴󠁧󠁢󠁥󠁮󠁧󠁿";
    if (league.includes("Eredivisie")) return "🇳🇱";
    if (league.includes("Scottish")) return "🏴󠁧󠁢󠁳󠁣󠁴󠁿";
    return "⚽";
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 md:p-3 font-semibold text-gray-700 w-1/3">
                Home team
                <br />
                <span className="text-sm font-normal text-gray-500">
                  Away team
                </span>
              </th>

              <th className="text-center p-2 md:p-3 font-semibold text-gray-700">
                Odds
                <br />
                <div className="flex justify-center space-x-1 text-sm font-normal text-gray-500 mt-1">
                  <span className="text-center w-6">1</span>
                  <span className="text-center w-6">X</span>
                  <span className="text-center w-6">2</span>
                  <span className="text-center w-6">1X</span>
                  <span className="text-center w-6">X2</span>
                </div>
              </th>

              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-12 md:w-16">
                <span className="hidden md:inline">Pred</span>
                <span className="md:hidden">P</span>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-16 md:w-20">
                <span className="hidden md:inline">Status</span>
                <span className="md:hidden">St</span>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-12 md:w-16">
                <span className="hidden md:inline">Score</span>
                <span className="md:hidden">Sc</span>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-16 md:w-24">
                <span className="hidden md:inline">Date/Time</span>
                <span className="md:hidden">Date</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction, index) => (
              <tr
                key={prediction.match_id}
                className={`border-b hover:bg-gray-50 ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-25"
                }`}
              >
                {/* Teams */}
                <td className="p-2 md:p-3">
                  <div className="flex items-start space-x-1 md:space-x-2">
                    <div className="flex-shrink-0">
                      <img
                        src={prediction.league_logo}
                        alt={`${prediction.league_name} logo`}
                        className="w-4 h-4 md:w-6 md:h-6 object-contain"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                      <span className="text-lg hidden">
                        {getLeagueIcon(prediction.league_name)}
                      </span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center space-x-1 md:space-x-2 mb-1">
                        <img
                          src={prediction.home_team_logo}
                          alt={`${prediction.home_team} logo`}
                          className="w-3 h-3 md:w-4 md:h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-semibold text-gray-900 text-xs md:text-sm truncate">
                          {prediction.home_team}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 md:space-x-2 mb-1 md:mb-2">
                        <img
                          src={prediction.away_team_logo}
                          alt={`${prediction.away_team} logo`}
                          className="w-3 h-3 md:w-4 md:h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="text-gray-600 text-xs md:text-sm truncate">
                          {prediction.away_team}
                        </div>
                      </div>
                      <div className="text-xs text-gray-500 truncate hidden md:block">
                        {prediction.league_name}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Odds */}
                <td className="p-1 md:p-3">
                  <div className="flex justify-center space-x-1 text-sm">
                    <div className="text-center w-6">
                      <div className="font-medium text-xs">
                        {prediction.home_odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center w-6">
                      <div className="font-medium text-xs">
                        {prediction.draw_odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center w-6">
                      <div className="font-medium text-xs">
                        {prediction.away_odds.toFixed(2)}
                      </div>
                    </div>
                    {typeof prediction.home_or_draw_odds === "number" && (
                      <div className="text-center w-6">
                        <div className="font-medium text-xs">
                          {prediction.home_or_draw_odds.toFixed(2)}
                        </div>
                      </div>
                    )}
                    {typeof prediction.away_or_draw_odds === "number" && (
                      <div className="text-center w-6">
                        <div className="font-medium text-xs">
                          {prediction.away_or_draw_odds.toFixed(2)}
                        </div>
                      </div>
                    )}
                  </div>
                </td>

                {/* Prediction */}
                <td className="p-1 md:p-3">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-bold ${getPredictionColor(
                        prediction.prediction.predicted_outcome
                      )}`}
                    >
                      {getPredictionNumber(
                        prediction.prediction.predicted_outcome
                      )}
                    </span>
                  </div>
                </td>

                {/* Status */}
                <td className="p-1 md:p-3 text-center">
                  <span
                    className={`inline-flex px-1 md:px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                      prediction.match_status
                    )}`}
                  >
                    {prediction.match_status}
                  </span>
                </td>

                {/* Score */}
                <td className="p-1 md:p-3 text-center">
                  {prediction.fulltime_home_score !== undefined &&
                  prediction.fulltime_away_score !== undefined ? (
                    <div className="text-sm font-semibold text-gray-900">
                      {prediction.fulltime_home_score} -{" "}
                      {prediction.fulltime_away_score}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">-</div>
                  )}
                </td>

                {/* Date/Time */}
                <td className="p-1 md:p-3 text-center">
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">
                      <span className="hidden md:inline">
                        {formatMatchDate(prediction.match_date)}
                      </span>
                      <span className="md:hidden">
                        {formatMatchDate(prediction.match_date).split(" ")[0]}
                      </span>
                    </div>
                    {isMatchToday(prediction.match_date) && (
                      <div className="text-blue-600 font-semibold mt-1 hidden md:block">
                        {getRelativeTime(prediction.match_date)}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
