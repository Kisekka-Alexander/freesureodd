import { Prediction, League } from "@/types";
import { useCallback, useEffect, useState } from "react";
import {
  formatTimeOnly,
  addDays,
  getTodayLocalDate,
  prepareDateFilterForApi,
} from "@/utils/date";
import { predefinedPopularLeagues } from "@/constants/leagues";
import { predictionsApi, leaguesApi } from "@/lib/axios";
import Image from "next/image";

export function Hero() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [displayMatches, setDisplayMatches] = useState<Prediction[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [accuracyRate, setAccuracyRate] = useState<number | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Ensure we're on the client side before doing time-based operations
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Determine if a league is popular using fuzzy name matching to accommodate API naming differences
  const isPopularLeague = useCallback((leagueName: string) => {
    const normalizedLeagueName = leagueName.toLowerCase();
    return predefinedPopularLeagues.some((league) => {
      const normalizedPredefinedName = league.name.toLowerCase();
      return (
        normalizedLeagueName.includes(normalizedPredefinedName) ||
        normalizedPredefinedName.includes(normalizedLeagueName)
      );
    });
  }, []);

  // Filter predictions to only include popular leagues (by name, not ID) and future matches
  const filterPopularLeaguePredictions = (preds: Prediction[]) => {
    return preds.filter((prediction) => {
      // Check if league is popular
      const isPopular = isPopularLeague(prediction.league_name);
      
      // Only do time filtering on client side to avoid hydration issues
      if (!isClient) {
        return isPopular;
      }
      
      // Check if match is in the future
      const matchDate = new Date(prediction.match_date);
      const now = new Date();
      const isFuture = matchDate > now;
      
      return isPopular && isFuture;
    });
  };

  // Fetch predictions for a specific date
  const fetchPredictionsForDate = useCallback(
    async (date: string) => {
      try {
        const params = {
          ...prepareDateFilterForApi(date),
          sort_by: "correct" as const,
          sort_order: "asc" as const,
        };
        const response = await predictionsApi.getAllPredictions(params);
        if (response.success) {
          return filterPopularLeaguePredictions(response.data.predictions);
        }
        return [];
      } catch (error) {
        console.error("Error fetching predictions:", error);
        return [];
      }
    },
    [isPopularLeague, isClient]
  );

  // Load predictions for multiple days until we find enough matches
  const loadPredictionsUntilEnough = useCallback(async () => {
    try {
      let currentDate = getTodayLocalDate();
      let allPredictions: Prediction[] = [];
      let daysChecked = 0;

      while (allPredictions.length < 3 && daysChecked < 7) {
        const predictions = await fetchPredictionsForDate(currentDate);
        allPredictions = [...allPredictions, ...predictions];
        if (allPredictions.length < 3) {
          currentDate = addDays(currentDate, 1);
          daysChecked++;
        }
      }

      // Take the first 3 predictions (backend provides them optimally sorted)
      const topPredictions = allPredictions.slice(0, 3);

      setDisplayMatches(topPredictions);
    } catch (error) {
      console.error("Error loading predictions:", error);
    }
  }, [fetchPredictionsForDate]);

  // Fetch leagues data
  useEffect(() => {
    const fetchLeagues = async () => {
      try {
        const response = await leaguesApi.getLeagues();
        if (response.success) {
          setLeagues(response.data.leagues);
        }
      } catch (error) {
        console.error("Error fetching leagues:", error);
      }
    };
    fetchLeagues();
  }, []);

  // Fetch overall accuracy from all predictions (no date filter)
  useEffect(() => {
    const fetchAccuracy = async () => {
      try {
        const response = await predictionsApi.getAllPredictions({
          sort_by: "correct" as const,
          sort_order: "asc" as const,
        });
        if (response.success && response.data.accuracy_percentage) {
          setAccuracyRate(response.data.accuracy_percentage);
        }
      } catch (error) {
        console.error("Error fetching accuracy:", error);
      }
    };
    fetchAccuracy();
  }, []);

  // Load predictions when component mounts or predictions change
  useEffect(() => {
    loadPredictionsUntilEnough();
  }, [loadPredictionsUntilEnough]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    const featuredTimer = setInterval(() => {
      if (displayMatches.length > 0) {
        setFeaturedIndex((prev) => (prev + 1) % displayMatches.length);
      }
    }, 6000);

    return () => {
      clearInterval(timer);
      clearInterval(featuredTimer);
    };
  }, [displayMatches.length]);

  useEffect(() => {
    if (displayMatches.length === 0 || featuredIndex >= displayMatches.length) {
      setFeaturedIndex(0);
    }
  }, [displayMatches.length, featuredIndex]);

  const getFeaturedMatch = () => {
    if (displayMatches.length > 0 && featuredIndex < displayMatches.length) {
      const prediction = displayMatches[featuredIndex];
      if (prediction && prediction.home_team && prediction.away_team) {
        // Find the country for this league
        const league = leagues.find(l => l.league_name === prediction.league_name);
        const country = league?.country || '';
        const leagueDisplayName = country ? `${country} - ${prediction.league_name}` : prediction.league_name;
        
        return {
          homeTeam: prediction.home_team,
          awayTeam: prediction.away_team,
          homeTeamLogo: prediction.home_team_logo,
          awayTeamLogo: prediction.away_team_logo,
          league: leagueDisplayName,
          time: formatTimeOnly(prediction.match_date),
          prediction: (() => {
            const o = prediction.prediction.predicted_outcome;
            if (o === "Home") return "1";
            if (o === "Draw") return "X";
            if (o === "Away") return "2";
            if (o === "Home or Draw") return "1X";
            if (o === "Away or Draw") return "2X";
            if (o === "Home or Away") return "12";
            return "?";
          })(),
          homeOdds: prediction.home_odds,
          drawOdds: prediction.draw_odds,
          awayOdds: prediction.away_odds,
        };
      }
    }
    return {
      homeTeam: "No matches",
      awayTeam: "available",
      homeTeamLogo: "",
      awayTeamLogo: "",
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
    <section className="bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 text-white py-2 lg:py-3">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid lg:grid-cols-[2fr,auto,2fr] gap-2 items-center">
          <div className="text-left">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium bg-red-500/20 px-1.5 py-0.5 rounded-full">
                LIVE
              </span>
              <span className="text-xs text-white/80">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="mb-2 text-xl lg:text-2xl xl:text-3xl font-bold leading-tight">
              <span className="inline lg:block">Win More with </span>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent font-extrabold">
                Smart Predictions
              </span>
              <span className="inline lg:block">⚽</span>
            </h1>
          </div>

          <div className="hidden lg:flex flex-col gap-3 py-3 px-5 bg-white/10 rounded-2xl backdrop-blur-sm self-center border border-white/20 shadow-lg shadow-white/5">
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent mb-0.5">
                {accuracyRate !== null ? `${Math.round(accuracyRate)}%` : "—"}
              </div>
              <div className="text-xs font-medium text-white/90">Accuracy</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-green-300">50K+</div>
              <div className="text-xs font-medium text-white/90">Users</div>
            </div>
            <div className="text-center transform hover:scale-105 transition-transform">
              <div className="text-2xl font-extrabold text-blue-300">
                {leagues.length > 0 ? `${leagues.length}+` : "—"}
              </div>
              <div className="text-xs font-medium text-white/90">Leagues</div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/20 shadow-lg shadow-white/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                  🔥 Featured Match
                </span>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-medium truncate max-w-[120px]" title={featuredMatch.league}>
                  {featuredMatch.league}
                </span>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="text-right flex-1 flex items-center justify-end space-x-2">
                  {featuredMatch.homeTeamLogo && (
                    <Image
                      src={featuredMatch.homeTeamLogo}
                      alt={`${featuredMatch.homeTeam} logo`}
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                  <div className="text-xs font-bold">
                    {featuredMatch.homeTeam}
                  </div>
                </div>
                <div className="mx-3">
                  <div className="text-xs font-semibold bg-white/20 px-2 py-0.5 rounded text-center">
                    VS
                  </div>
                  <div className="text-xs text-white/80 text-center mt-0.5">
                    {featuredMatch.time}
                  </div>
                </div>
                <div className="text-left flex-1 flex items-center space-x-2">
                  <div className="text-xs font-bold">
                    {featuredMatch.awayTeam}
                  </div>
                  {featuredMatch.awayTeamLogo && (
                    <Image
                      src={featuredMatch.awayTeamLogo}
                      alt={`${featuredMatch.awayTeam} logo`}
                      width={16}
                      height={16}
                      className="w-4 h-4 object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="bg-white/20 rounded-xl p-2 mb-2">
                <div className="text-center">
                  <div className="text-xs text-white/90 font-medium mb-0.5">
                    AI Prediction
                  </div>
                  <div className="text-base font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-400 bg-clip-text text-transparent">
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

                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="text-center transform hover:scale-105 transition-transform">
                    <div className="text-white/90 font-medium">Home</div>
                    <div className="font-bold text-xs">
                      {featuredMatch.homeOdds}
                    </div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-transform">
                    <div className="text-white/90 font-medium">Draw</div>
                    <div className="font-bold text-xs">
                      {featuredMatch.drawOdds}
                    </div>
                  </div>
                  <div className="text-center transform hover:scale-105 transition-transform">
                    <div className="text-white/90 font-medium">Away</div>
                    <div className="font-bold text-xs">
                      {featuredMatch.awayOdds}
                    </div>
                  </div>
                </div>
              </div>

              {displayMatches.length > 0 && (
                <div className="flex justify-center space-x-1">
                  {displayMatches.map((_, index) => (
                    <div
                      key={index}
                      className={`w-1 h-1 rounded-full ${
                        index === featuredIndex
                          ? "bg-yellow-300"
                          : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
