import { useState } from "react";
import Image from "next/image";
import { PopularLeaguesProps, PredefinedLeague } from "./types";

const predefinedPopularLeagues: PredefinedLeague[] = [
  { league_id: 135, name: "Serie A", country: "Italy", count: 20 },
  { league_id: 140, name: "La Liga", country: "Spain", count: 20 },
  { league_id: 39, name: "Premier League", country: "England", count: 20 },
  { league_id: 88, name: "Eredivisie", country: "Netherlands", count: 18 },
  {
    league_id: 144,
    name: "Jupiler Pro League",
    country: "Belgium",
    count: 16,
  },
  { league_id: 61, name: "Ligue 1", country: "France", count: 20 },
  { league_id: 94, name: "Primeira Liga", country: "Portugal", count: 18 },
  { league_id: 307, name: "Pro League", country: "Saudi Arabia", count: 16 },
  { league_id: 78, name: "Bundesliga", country: "Germany", count: 18 },
  { league_id: 71, name: "Serie A", country: "Brazil", count: 20 },
  { league_id: 179, name: "Premiership", country: "Scotland", count: 12 },
];

export function PopularLeagues({
  leagues,
  selectedPopularLeague,
  onPopularLeagueSelect,
  onClearPopularLeague,
}: PopularLeaguesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Match the predefined leagues with actual league data
  const getPopularLeagues = () => {
    if (!leagues || leagues.length === 0) {
      // Return predefined leagues with placeholder data if no real leagues available
      return predefinedPopularLeagues.map((league) => ({
        league_id: league.league_id,
        league_name: league.name,
        country: league.country,
        logo_url: "/placeholder-logo.png",
        matchCount: league.count,
      }));
    }

    // Try to match predefined leagues with real league data
    const matchedLeagues = predefinedPopularLeagues.map((predefined) => {
      // Find matching league in the real data by league_id first (exact match only)
      const realLeague = leagues.find(
        (league) => league.league_id === predefined.league_id
      );

      if (realLeague) {
        return {
          ...realLeague,
          // Override with our predefined country to ensure consistency
          country: predefined.country,
          matchCount: predefined.count,
        };
      }

      // If no match found, use the predefined data (real league IDs)
      return {
        league_id: predefined.league_id,
        league_name: predefined.name,
        country: predefined.country,
        logo_url: `https://media.api-sports.io/football/leagues/${predefined.league_id}.png`,
        matchCount: predefined.count,
      };
    });

    return matchedLeagues;
  };

  const popularLeagues = getPopularLeagues();

  // Debug logging to understand what leagues are being used
  console.log(
    "Popular leagues loaded:",
    popularLeagues.map((l) => ({
      id: l.league_id,
      name: l.league_name,
      logo_url: l.logo_url,
    }))
  );

  // Get the background color for selection
  const getBackgroundColor = (isSelected: boolean) => {
    if (isSelected) {
      return "bg-blue-500 text-white shadow-md";
    }
    return "bg-white text-gray-700 hover:bg-gray-50 border-b border-gray-100";
  };

  const handleLeagueClick = (leagueId: number) => {
    // If the same league is clicked, deselect it
    if (selectedPopularLeague === leagueId) {
      onClearPopularLeague();
    } else {
      onPopularLeagueSelect(leagueId);
    }
  };

  return (
    <div className="bg-white w-full lg:w-64 h-fit rounded-lg overflow-hidden shadow-sm border border-gray-200">
      {/* Header */}
      <div className="bg-gray-50 border-b border-gray-200 px-2 py-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left lg:cursor-default"
        >
          <h3 className="text-sm font-semibold text-gray-700 tracking-wide">
            Popular Leagues
          </h3>
          <svg
            className={`w-5 h-5 text-gray-600 transition-transform duration-200 lg:hidden ${
              isExpanded ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </div>

      {/* League List */}
      <div className={`lg:block ${isExpanded ? "block" : "hidden"}`}>
        {popularLeagues.length === 0 ? (
          <div className="px-4 py-6 text-center text-gray-500">
            <div className="text-sm">No leagues available</div>
          </div>
        ) : (
          popularLeagues.map((league) => {
            const isSelected = selectedPopularLeague === league.league_id;
            return (
              <button
                key={league.league_id}
                onClick={() => handleLeagueClick(league.league_id)}
                className={`w-full px-2 py-2 flex items-center space-x-2 transition-colors duration-200 ${getBackgroundColor(
                  isSelected
                )}`}
              >
                {/* League Logo */}
                <Image
                  src={league.logo_url}
                  alt={`${league.league_name} logo`}
                  width={16}
                  height={16}
                  className="w-4 h-4 object-contain flex-shrink-0"
                  onError={(e) => {
                    console.warn(
                      `Failed to load logo for ${league.league_name}:`,
                      league.logo_url
                    );
                    e.currentTarget.src = "/placeholder-logo.png";
                  }}
                  onLoad={() => {
                    console.log(
                      `Successfully loaded logo for ${league.league_name}:`,
                      league.logo_url
                    );
                  }}
                />

                {/* League Name and Country */}
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-left truncate">
                    {league.league_name}
                  </div>
                  <div className="text-xs text-gray-500 text-left truncate">
                    {league.country}
                  </div>
                </div>
              </button>
            );
          })
        )}
      </div>

      {/* Clear Filter Button */}
      {selectedPopularLeague && (
        <div
          className={`p-2 border-t border-gray-200 lg:block ${
            isExpanded ? "block" : "hidden"
          }`}
        >
          <button
            onClick={onClearPopularLeague}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2 rounded-lg transition-colors duration-200 text-xs font-medium shadow-sm"
          >
            Clear League Filter
          </button>
        </div>
      )}
    </div>
  );
}
