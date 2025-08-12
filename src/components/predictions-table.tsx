import { Prediction } from "@/types";
import { formatMatchDate, getRelativeTime, isMatchToday } from "@/utils/date";

interface PredictionsTableProps {
  predictions: Prediction[];
}

export function PredictionsTable({ predictions }: PredictionsTableProps) {

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-100 text-red-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPredictionNumber = (outcome: string) => {
    switch (outcome) {
      case "Home":
        return "1";
      case "Draw":
        return "X";
      case "Away":
        return "2";
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
        <table className="w-full min-w-[1000px]">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-4 font-semibold text-gray-700 min-w-[250px]">
                Home team
                <br />
                <span className="text-sm font-normal text-gray-500">
                  Away team
                </span>
              </th>

              <th className="text-center p-4 font-semibold text-gray-700 min-w-[120px]">
                Odds
                <br />
                <div className="flex justify-center space-x-4 text-sm font-normal text-gray-500 mt-1">
                  <span>1</span>
                  <span>X</span>
                  <span>2</span>
                </div>
              </th>

              <th className="text-center p-4 font-semibold text-gray-700 min-w-[120px]">
                Probability %<br />
                <div className="flex justify-center space-x-4 text-sm font-normal text-gray-500 mt-1">
                  <span>1</span>
                  <span>X</span>
                  <span>2</span>
                </div>
              </th>
              <th className="text-center p-4 font-semibold text-gray-700 min-w-[80px]">
                Pred
              </th>
              <th className="text-center p-4 font-semibold text-gray-700 min-w-[100px]">
                Confidence
              </th>
              {/* <th className="text-center p-4 font-semibold text-gray-700 min-w-[120px]">
                Model Info
              </th> */}
              <th className="text-center p-4 font-semibold text-gray-700 min-w-[80px]">
                Status
              </th>
              <th className="text-center p-4 font-semibold text-gray-700 min-w-[120px]">
                Date/Time
              </th>
            </tr>
          </thead>
          <tbody>
            {predictions.map((prediction, index) => (
              <tr
                key={prediction.match_id}
                className={`border-b hover:bg-gray-50 ${index % 2 === 0 ? "bg-white" : "bg-gray-25"
                  }`}
              >
                {/* Teams */}
                <td className="p-4">
                  <div className="flex items-start space-x-2">
                    <span className="text-lg">
                      {getLeagueIcon(prediction.league_name)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">
                        {prediction.home_team}
                      </div>
                      <div className="text-gray-600 text-sm">
                        {prediction.away_team}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {prediction.league_name}
                      </div>
                    </div>
                  </div>
                </td>
                {/* Odds */}
                <td className="p-4">
                  <div className="flex justify-center space-x-3 text-sm">
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {parseFloat(prediction.home_odds).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {parseFloat(prediction.draw_odds).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {parseFloat(prediction.away_odds).toFixed(2)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Probabilities */}
                <td className="p-4">
                  <div className="flex justify-center space-x-3 text-sm">
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {Math.round(
                          prediction.prediction.probabilities.Home * 100
                        )}
                      </div>
                    </div>
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {Math.round(
                          prediction.prediction.probabilities.Draw * 100
                        )}
                      </div>
                    </div>
                    <div className="text-center min-w-[30px]">
                      <div className="font-medium">
                        {Math.round(
                          prediction.prediction.probabilities.Away * 100
                        )}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Prediction */}
                <td className="p-4">
                  <div className="flex justify-center">
                    <span
                      className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${getPredictionColor(
                        prediction.prediction.predicted_outcome
                      )}`}
                    >
                      {getPredictionNumber(
                        prediction.prediction.predicted_outcome
                      )}
                    </span>
                  </div>
                </td>

                {/* Confidence */}
                <td className="p-4 text-center">
                  <div className="text-sm font-medium">
                    {Math.round(prediction.prediction.confidence * 100)}%
                  </div>
                  {prediction.prediction.error && (
                    <div className="text-xs text-yellow-600 mt-1">
                      ⚠️ Fallback
                    </div>
                  )}
                </td>

                {/* Model Info */}
                {/* <td className="p-4 text-center">
                  <div className="text-xs">
                    <div className="font-medium text-gray-900">
                      {prediction.prediction.model_info.name.replace("_", " ")}
                    </div>
                    <div className="text-gray-500">
                      v{prediction.prediction.model_info.version}
                    </div>
                  </div>
                </td> */}

                {/* Status */}
                <td className="p-4 text-center">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                      prediction.match_status
                    )}`}
                  >
                    {prediction.match_status}
                  </span>
                </td>

                {/* Date/Time */}
                <td className="p-4 text-center">
                  <div className="text-xs text-gray-600">
                    <div className="font-medium">
                      {formatMatchDate(prediction.match_date)}
                    </div>
                    {isMatchToday(prediction.match_date) && (
                      <div className="text-blue-600 font-semibold mt-1">
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
