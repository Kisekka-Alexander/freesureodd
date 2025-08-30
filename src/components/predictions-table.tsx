"use client";

import { Prediction } from "@/types";
import {
  formatDateTimeAMPM,
  isMatchToday,
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

  const getLeagueIcon = (league: string) => {
    if (league.includes("Champions") || league.includes("UCL")) return "⚽";
    if (league.includes("Premier")) return "🏴";
    if (league.includes("La Liga")) return "🇪🇸";
    if (league.includes("Bundesliga")) return "🇩🇪";
    if (league.includes("Serie A")) return "🇮🇹";
    if (league.includes("Ligue 1")) return "🇫🇷";
    if (league.includes("Championship")) return "🏴";
    if (league.includes("Eredivisie")) return "🇳🇱";
    if (league.includes("Scottish")) return "🏴";
    return "⚽";
  };

  const deriveLeagueName = (prediction: Prediction) => {
    const logoUrl = prediction.league_logo || "";
    const idMatch = logoUrl.match(/\/leagues\/(\d+)\.png(?:\?.*)?$/);
    if (idMatch) {
      const leagueId = Number(idMatch[1]);
      const mapped = predefinedPopularLeagues.find(
        (l) => l.league_id === leagueId
      );
      if (mapped) return mapped.name;
    }
    // Fallback: remove common season suffixes if present
    return (prediction.league_name || "")
      .replace(/\s*-\s*\d{4}[-\/]\d{4}$/i, "")
      .replace(/\s*\(\d{4}[-\/]\d{4}\)$/i, "")
      .trim();
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <AutoScaleContainer>
        <table className="min-w-[1040px] table-fixed">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left p-2 md:p-3 font-semibold text-gray-700 w-[260px]">
                <div className="text-xs">
                  <div className="font-semibold text-gray-900 leading-tight">
                    Home team
                  </div>
                  <div className="text-gray-600 leading-tight">Away team</div>
                </div>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-[540px]">
                <div className="text-xs">Odds</div>
                <div className="grid grid-cols-5 gap-1 text-xs font-normal text-gray-500 mt-1">
                  <span className="text-center">1</span>
                  <span className="text-center">X</span>
                  <span className="text-center">2</span>
                  <span className="text-center">1X</span>
                  <span className="text-center">X2</span>
                </div>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-[70px]">
                <span className="text-xs">Pred</span>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-[110px]">
                <span className="text-xs">Status</span>
              </th>
              <th className="text-center p-2 md:p-3 font-semibold text-gray-700 w-[60px]">
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
                <td className="p-2 md:p-3 w-[260px]">
                  <div className="flex items-start space-x-2">
                    <div className="flex-shrink-0">
                      <Image
                        src={prediction.league_logo}
                        alt={`${prediction.league_name} logo`}
                        title={deriveLeagueName(prediction)}
                        width={24}
                        height={24}
                        className="w-6 h-6 object-contain cursor-help"
                        onError={(e) => {
                          // Fallback to emoji if image fails to load
                          e.currentTarget.style.display = "none";
                          e.currentTarget.nextElementSibling?.classList.remove(
                            "hidden"
                          );
                        }}
                      />
                      <span
                        className="text-sm hidden cursor-help"
                        title={deriveLeagueName(prediction)}
                      >
                        {getLeagueIcon(prediction.league_name)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Home team */}
                      <div className="flex items-center space-x-2 mb-1.5">
                        <Image
                          src={prediction.home_team_logo}
                          alt={`${prediction.home_team} logo`}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="font-semibold text-gray-900 text-xs leading-tight truncate">
                          {prediction.home_team}
                        </div>
                      </div>
                      {/* Away team */}
                      <div className="flex items-center space-x-2 mb-1.5">
                        <Image
                          src={prediction.away_team_logo}
                          alt={`${prediction.away_team} logo`}
                          width={20}
                          height={20}
                          className="w-5 h-5 object-contain flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                        <div className="text-gray-600 text-xs leading-tight truncate">
                          {prediction.away_team}
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 leading-tight">
                        <div className="truncate">
                          {formatDateTimeAMPM(prediction.match_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                {/* Odds */}
                <td className="p-2 md:p-3 w-[540px]">
                  <div className="grid grid-cols-5 gap-1 text-sm">
                    <div className="text-center">
                      <div className={`font-medium text-xs rounded px-1 py-1 ${
                        prediction.prediction.predicted_outcome === "Home" 
                          ? "bg-green-100 text-green-800 border border-green-300 font-bold" 
                          : "bg-gray-50"
                      }`}>
                        {prediction.home_odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`font-medium text-xs rounded px-1 py-1 ${
                        prediction.prediction.predicted_outcome === "Draw" 
                          ? "bg-green-100 text-green-800 border border-green-300 font-bold" 
                          : "bg-gray-50"
                      }`}>
                        {prediction.draw_odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className={`font-medium text-xs rounded px-1 py-1 ${
                        prediction.prediction.predicted_outcome === "Away" 
                          ? "bg-green-100 text-green-800 border border-green-300 font-bold" 
                          : "bg-gray-50"
                      }`}>
                        {prediction.away_odds.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-center">
                      {typeof prediction.home_or_draw_odds === "number" ? (
                        <div className={`font-medium text-xs rounded px-1 py-1 ${
                          prediction.prediction.predicted_outcome === "Home or Draw" 
                            ? "bg-green-100 text-green-800 border border-green-300 font-bold" 
                            : "bg-gray-50"
                        }`}>
                          {prediction.home_or_draw_odds.toFixed(2)}
                        </div>
                      ) : (
                        <div className="font-medium text-xs text-gray-400">
                          -
                        </div>
                      )}
                    </div>
                    <div className="text-center">
                      {typeof prediction.away_or_draw_odds === "number" ? (
                        <div className={`font-medium text-xs rounded px-1 py-1 ${
                          prediction.prediction.predicted_outcome === "Away or Draw" 
                            ? "bg-green-100 text-green-800 border border-green-300 font-bold" 
                            : "bg-gray-50"
                        }`}>
                          {prediction.away_or_draw_odds.toFixed(2)}
                        </div>
                      ) : (
                        <div className="font-medium text-xs text-gray-400">
                          -
                        </div>
                      )}
                    </div>
                  </div>
                </td>

                {/* Prediction */}
                <td className="p-2 md:p-3 text-center w-[70px]">
                  <div className="flex flex-col items-center space-y-1">
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
                    {prediction.prediction.correct && (
                      <div className="text-xs">
                        {prediction.prediction.correct === "y" ? (
                          <span className="text-green-600 font-bold">✓</span>
                        ) : (
                          <span className="text-red-600 font-bold">✗</span>
                        )}
                      </div>
                    )}
                  </div>
                </td>

                {/* Status */}
                <td className="p-2 md:p-3 text-center w-[110px]">
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium uppercase ${getStatusColor(
                      prediction.match_status
                    )}`}
                  >
                    {prediction.match_status}
                  </span>
                </td>

                {/* Score */}
                <td className="p-2 md:p-3 text-center w-[60px]">
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
      </AutoScaleContainer>
    </div>
  );
}
