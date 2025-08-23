import { Prediction, League } from "@/types";
import { useEffect, useState } from "react";
import {
  formatTimeOnly,
  isMatchToday,
  addDays,
  getTodayLocalDate,
  prepareDateFilterForApi,
} from "@/utils/date";
import { predefinedPopularLeagues } from "@/constants/leagues";
import { predictionsApi, leaguesApi } from "@/lib/axios";

interface HeroProps {
  predictions?: Prediction[];
}

export function Hero({ predictions = [] }: HeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [featuredIndex, setFeaturedIndex] = useState(0);

  const [displayMatches, setDisplayMatches] = useState<Prediction[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [leagues, setLeagues] = useState<League[]>([]);

  // Fetch leagues on component mount
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

  // Filter predictions to only include popular leagues
  const filterPopularLeaguePredictions = (preds: Prediction[]) => {
    const popularLeagueIds = predefinedPopularLeagues.map(
      (league) => league.league_id
    );
    return preds.filter((prediction) => {
      const league = leagues.find(
        (l: League) => l.league_name === prediction.league_name
      );
      return league && popularLeagueIds.includes(league.league_id);
    });
  };

  // Fetch predictions for a specific date
  const fetchPredictionsForDate = async (date: string) => {
    try {
      const params = {
        ...prepareDateFilterForApi(date),
        sort_by: "match_date" as const,
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
  };

  // Load predictions for multiple days until we find enough matches
  const loadPredictionsUntilEnough = async () => {
    setIsLoadingMore(true);
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

      // Sort by date and take the first 3
      const sortedPredictions = allPredictions
        .sort(
          (a, b) =>
            new Date(a.match_date).getTime() - new Date(b.match_date).getTime()
        )
        .slice(0, 3);

      setDisplayMatches(sortedPredictions);
    } catch (error) {
      console.error("Error loading predictions:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Load predictions when component mounts or predictions change
  useEffect(() => {
    loadPredictionsUntilEnough();
  }, []);

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
    <section className="bg-gradient-to-br from-green-600 via-blue-700 to-purple-800 text-white py-4 lg:py-6">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="grid lg:grid-cols-2 gap-4 items-center">
          <div className="text-left">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium bg-red-500/20 px-1.5 py-0.5 rounded-full">
                LIVE
              </span>
              <span className="text-xs text-white/80">
                {currentTime.toLocaleTimeString()}
              </span>
            </div>

            <h1 className="mb-3 text-2xl lg:text-3xl font-bold leading-tight">
              <span className="inline lg:block">Win More with </span>
              <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
                Smart Football
              </span>
              <span className="inline lg:block"> Predictions ⚽</span>
            </h1>

            <div className="grid grid-cols-3 gap-2 mb-3 text-center">
              <div>
                <div className="text-lg font-bold text-yellow-300">98%</div>
                <div className="text-xs text-white/80">Accuracy</div>
              </div>
              <div>
                <div className="text-lg font-bold text-green-300">50K+</div>
                <div className="text-xs text-white/80">Users</div>
              </div>
              <div>
                <div className="text-lg font-bold text-blue-300">15+</div>
                <div className="text-xs text-white/80">Leagues</div>
              </div>
            </div>

            <button
              onClick={() =>
                document
                  .getElementById("predictions")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              className="lg:hidden text-white/90 hover:text-white text-sm underline underline-offset-4"
            >
              ⬇️ View Predictions
            </button>
          </div>

          <div className="hidden lg:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 border border-white/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold">🔥 Featured Match</span>
                <span className="text-xs bg-white/20 px-1.5 py-0.5 rounded">
                  {featuredMatch.league}
                </span>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div className="text-right flex-1">
                  <div className="text-sm font-bold">
                    {featuredMatch.homeTeam}
                  </div>
                </div>
                <div className="mx-2">
                  <div className="text-sm">VS</div>
                  <div className="text-xs text-white/70">
                    {featuredMatch.time}
                  </div>
                </div>
                <div className="text-left flex-1">
                  <div className="text-sm font-bold">
                    {featuredMatch.awayTeam}
                  </div>
                </div>
              </div>

              <div className="bg-white/20 rounded p-2 mb-2">
                <div className="text-center">
                  <div className="text-xs text-white/80">AI Prediction</div>
                  <div className="text-lg font-bold text-yellow-300">
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

                <div className="grid grid-cols-3 gap-2 text-xs mt-1.5">
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
