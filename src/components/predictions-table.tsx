"use client";

import { Prediction } from "@/types";
import {
  formatDateTimeAMPM,
} from "@/utils/date";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { predefinedPopularLeagues } from "@/constants/leagues";

interface AutoScaleProps {
  children: React.ReactNode;
}

function AutoScaleContainer({ children }: AutoScaleProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);
  const [scaledHeight, setScaledHeight] = useState<number | undefined>(
    undefined
  );

  const recomputeScale = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    // Temporarily reset transform to measure natural size
    const previousTransform = content.style.transform;
    content.style.transform = "scale(1)";

    const containerWidth = container.clientWidth;
    const naturalWidth = content.scrollWidth || content.clientWidth;
    const naturalHeight = content.scrollHeight || content.clientHeight;

    const nextScale = naturalWidth > 0 ? containerWidth / naturalWidth : 1;
    setScale(nextScale);
    setScaledHeight(Math.ceil(naturalHeight * nextScale));

    // Restore transform for visual update handled by state
    content.style.transform = previousTransform;
  };

  useLayoutEffect(() => {
    recomputeScale();
  }, []);

  useLayoutEffect(() => {
    const ro = new ResizeObserver(() => recomputeScale());
    if (containerRef.current) ro.observe(containerRef.current);
    if (contentRef.current) ro.observe(contentRef.current);
    window.addEventListener("resize", recomputeScale);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", recomputeScale);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full overflow-hidden"
      style={{ height: scaledHeight }}
    >
      <div
        ref={contentRef}
        className="inline-block"
        style={{ transform: `scale(${scale})`, transformOrigin: "top left" }}
      >
        {children}
      </div>
    </div>
  );
}

interface PredictionsTableProps {
  predictions: Prediction[];
  leagues?: { league_id: number; league_name: string; country: string }[];
}

export function PredictionsTable({ predictions, leagues }: PredictionsTableProps) {
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

  const getPredictionColor = (outcome: string, correct?: "y" | "n" | null) => {
    // If we have a correctness indicator, override the color
    if (correct === "y") {
      return "bg-green-500 text-white border-2 border-green-600";
    }
    if (correct === "n") {
      return "bg-red-500 text-white border-2 border-red-600";
    }
    
    // Default colors for predictions without results
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

  const deriveLeagueLabel = (prediction: Prediction) => {
    const leagueName = (prediction.league_name || "")
      .replace(/\s*-\s*\d{4}[-\/]\d{4}$/i, "")
      .replace(/\s*\(\d{4}[-\/]\d{4}\)$/i, "")
      .trim();

    // Extract league_id from logo URL for precise matching
    const logoUrl = prediction.league_logo || "";
    const idMatch = logoUrl.match(/\/leagues\/(\d+)\.png(?:\?.*)?$/);
    const leagueId = idMatch ? Number(idMatch[1]) : null;

    if (leagues && leagueId !== null) {
      const match = leagues.find((l) => l.league_id === leagueId);
      if (match?.country) return `${match.country} \u00b7 ${leagueName}`;
    }

    // Fall back to predefined list
    if (leagueId !== null) {
      const mapped = predefinedPopularLeagues.find((l) => l.league_id === leagueId);
      if (mapped) return `${mapped.country} \u00b7 ${leagueName}`;
    }

    return leagueName;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-1.5 py-2 font-semibold text-gray-700 w-[35%]">
                <div className="text-xs">
                  <div className="font-semibold text-gray-900 leading-tight">
                    Home team
                  </div>
                  <div className="text-gray-600 leading-tight">Away team</div>
                </div>
              </th>
              <th className="text-center px-1 py-2 font-semibold text-gray-700 w-[33%]">
                <div className="text-xs">Odds</div>
              </th>
              <th className="text-center px-1 py-2 font-semibold text-gray-700 w-[10%]">
                <span className="text-xs">Pred</span>
              </th>
              <th className="text-center px-1 py-2 font-semibold text-gray-700 w-[11%]">
                <span className="text-xs">&nbsp;</span>
              </th>
              <th className="text-center px-1 py-2 font-semibold text-gray-700 w-[11%]">
                <span className="text-xs">Score</span>
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
                <td className="px-1.5 py-2 w-[35%]">
                  <div className="min-w-0">
                    <div className="text-[10px] font-medium text-gray-400 leading-tight truncate mb-0.5">
                      {deriveLeagueLabel(prediction)}
                    </div>
                      {/* Home team */}
                      <div className="flex items-center space-x-1 mb-1">
                        <Image
                          src={prediction.home_team_logo}
                          alt={`${prediction.home_team} logo`}
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-semibold text-blue-700 text-xs leading-tight truncate">
                          {prediction.home_team}
                        </div>
                      </div>
                      {/* Away team */}
                      <div className="flex items-center space-x-1 mb-1">
                        <Image
                          src={prediction.away_team_logo}
                          alt={`${prediction.away_team} logo`}
                          width={16}
                          height={16}
                          className="w-4 h-4 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="text-blue-500 text-xs leading-tight truncate">
                          {prediction.away_team}
                        </div>
                      </div>
                      <div className="text-[10px] text-gray-400 leading-tight truncate">
                        {formatDateTimeAMPM(prediction.match_date)}
                      </div>
                  </div>
                </td>
                {/* Odds — labels and values per row so double-chance rows self-label correctly */}
                <td className="px-1 py-2 w-[33%]">
                  {(() => {
                    const outcome = prediction.prediction.predicted_outcome;
                    const isDoubleChance = outcome === "Home or Draw" || outcome === "Away or Draw";
                    const odds = isDoubleChance
                      ? [
                          { label: "1X", value: prediction.home_or_draw_odds, highlight: outcome === "Home or Draw" },
                          { label: "X",  value: prediction.draw_odds,         highlight: false },
                          { label: "X2", value: prediction.away_or_draw_odds, highlight: outcome === "Away or Draw" },
                        ]
                      : [
                          { label: "1", value: prediction.home_odds, highlight: outcome === "Home" },
                          { label: "X", value: prediction.draw_odds, highlight: outcome === "Draw" },
                          { label: "2", value: prediction.away_odds, highlight: outcome === "Away" },
                        ];
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        {odds.map((odd, i) => (
                          <div key={i} className="text-center">
                            <div className="text-[9px] text-gray-500 font-semibold leading-none mb-0.5">{odd.label}</div>
                            <div className={`w-full text-center font-medium text-xs rounded font-mono py-0.5 border ${
                              odd.highlight
                                ? "bg-green-100 text-green-800 border-green-300 font-bold"
                                : "bg-gray-50 border-transparent"
                            }`}>
                              {typeof odd.value === "number" ? odd.value.toFixed(2) : "-"}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </td>

                {/* Prediction */}
                <td className="pl-4 pr-1 py-2 text-center w-[10%]">
                  <span
                    className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${getPredictionColor(
                      prediction.prediction.predicted_outcome,
                      prediction.prediction.correct
                    )}`}
                  >
                    {getPredictionNumber(
                      prediction.prediction.predicted_outcome
                    )}
                  </span>
                </td>

                {/* Status */}
                <td className="pl-5 pr-1 py-2 text-center w-[11%]">
                  <span
                    className={`inline-flex px-1 py-0.5 rounded-full text-[10px] font-medium uppercase ${getStatusColor(
                      prediction.match_status
                    )}`}
                  >
                    {prediction.match_status}
                  </span>
                </td>

                {/* Score */}
                <td className="px-1 py-2 text-center w-[11%]">
                  {prediction.fulltime_home_score !== undefined &&
                  prediction.fulltime_away_score !== undefined ? (
                    <div className="text-xs font-semibold text-gray-900">
                      {prediction.fulltime_home_score}-
                      {prediction.fulltime_away_score}
                    </div>
                  ) : (
                    <div className="text-xs text-gray-400">-</div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
    </div>
  );
}
