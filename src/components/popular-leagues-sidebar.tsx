import { League } from "@/types";
import { useState, useEffect } from "react";

interface PopularLeaguesSidebarProps {
  leagues: League[];
  selectedLeague: number | null;
  selectedCountry: string | null;
  onLeagueSelect: (leagueId: number | null) => void;
  onCountrySelect: (country: string | null) => void;
  predictions?: any[]; // For calculating match counts
}

export function PopularLeaguesSidebar({
  leagues,
  selectedLeague,
  selectedCountry,
  onLeagueSelect,
  onCountrySelect,
  predictions = [],
}: PopularLeaguesSidebarProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);
  const [isPopularLeaguesExpanded, setIsPopularLeaguesExpanded] =
    useState(false);
  const [isCountriesExpanded, setIsCountriesExpanded] = useState(false);

  // Separate selection states for each section
  const [selectedPopularLeague, setSelectedPopularLeague] = useState<
    number | null
  >(null);
  const [selectedCountryLeague, setSelectedCountryLeague] = useState<
    number | null
  >(null);

  // Sync internal states when selectedLeague changes from parent (e.g., clear filters)
  useEffect(() => {
    if (selectedLeague === null) {
      setSelectedPopularLeague(null);
      setSelectedCountryLeague(null);
    }
  }, [selectedLeague]);

  // Define popular leagues using real league data
  const predefinedPopularLeagues = [
    {
      league_id: 128,
      name: "Liga Profesional Argentina",
      country: "Argentina",
      count: 7,
    },
    { league_id: 186, name: "Ligue 1", country: "Algeria", count: 12 },
    { league_id: 188, name: "A-League", country: "Australia", count: 24 },
    { league_id: 310, name: "Superliga", country: "Albania", count: 10 },
    { league_id: 311, name: "1st Division", country: "Albania", count: 10 },
    { league_id: 312, name: "1a Divisió", country: "Andorra", count: 9 },
    { league_id: 342, name: "Premier League", country: "Armenia", count: 10 },
    { league_id: 397, name: "Girabola", country: "Angola", count: 9 },
    { league_id: 421, name: "Division di Honor", country: "Aruba", count: 8 },
    {
      league_id: 129,
      name: "Primera Nacional",
      country: "Argentina",
      count: 10,
    },
    { league_id: 130, name: "Copa Argentina", country: "Argentina", count: 8 },
    { league_id: 187, name: "Ligue 2", country: "Algeria", count: 6 },
    { league_id: 313, name: "2a Divisió", country: "Andorra", count: 5 },
  ];

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
      // Find matching league in the real data by league_id first, then by name
      const realLeague = leagues.find(
        (league) =>
          league.league_id === predefined.league_id ||
          league.league_name
            .toLowerCase()
            .includes(predefined.name.toLowerCase()) ||
          predefined.name
            .toLowerCase()
            .includes(league.league_name.toLowerCase())
      );

      if (realLeague) {
        return {
          ...realLeague,
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

  // Extract unique countries from leagues
  const getUniqueCountries = () => {
    if (!leagues || leagues.length === 0) return [];

    const countries = Array.from(
      new Set(leagues.map((league) => league.country))
    )
      .filter(Boolean)
      .sort();

    return countries;
  };

  // Get leagues for a specific country
  const getLeaguesByCountry = (country: string) => {
    if (!leagues || leagues.length === 0) return [];

    return leagues
      .filter((league) => league.country === country)
      .sort((a, b) => a.league_name.localeCompare(b.league_name));
  };

  const uniqueCountries = getUniqueCountries();

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
      setSelectedPopularLeague(null);
      onLeagueSelect(null);
    } else {
      setSelectedPopularLeague(leagueId);
      setSelectedCountryLeague(null); // Clear country league selection
      onLeagueSelect(leagueId);
    }
  };

  const handleCountryClick = (country: string) => {
    if (expandedCountry === country) {
      // If the same country is clicked, collapse it
      setExpandedCountry(null);
      setSelectedCountryLeague(null); // Clear country league selection when collapsing
      if (selectedCountry === country) {
        onCountrySelect(null);
        onLeagueSelect(null); // Clear any league selection when deselecting country
      }
    } else {
      // Just expand the country without selecting it
      setExpandedCountry(country);
      // Don't call onCountrySelect here - only call it when a league is selected
    }
  };

  const handleCountryLeagueClick = (leagueId: number) => {
    // If the same league is clicked, deselect it
    if (selectedCountryLeague === leagueId) {
      setSelectedCountryLeague(null);
      onLeagueSelect(null);
      onCountrySelect(null); // Clear country selection when deselecting league
    } else {
      setSelectedCountryLeague(leagueId);
      setSelectedPopularLeague(null); // Clear popular league selection
      onLeagueSelect(leagueId);

      // Find the country for this league and select it
      const league = leagues.find((l) => l.league_id === leagueId);
      if (league && league.country) {
        onCountrySelect(league.country);
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Popular Leagues Section */}
      <div className="bg-white w-full lg:w-80 h-fit rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
          <button
            onClick={() =>
              setIsPopularLeaguesExpanded(!isPopularLeaguesExpanded)
            }
            className="w-full flex items-center justify-between text-left lg:cursor-default"
          >
            <h3 className="text-base font-semibold text-gray-700 tracking-wide">
              Popular Leagues
            </h3>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 lg:hidden ${
                isPopularLeaguesExpanded ? "rotate-180" : ""
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
        <div
          className={`lg:block ${
            isPopularLeaguesExpanded ? "block" : "hidden"
          }`}
        >
          {popularLeagues.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <div className="text-sm">No leagues available</div>
            </div>
          ) : (
            popularLeagues.map((league, index) => {
              const isSelected = selectedPopularLeague === league.league_id;
              return (
                <button
                  key={league.league_id}
                  onClick={() => handleLeagueClick(league.league_id)}
                  className={`w-full px-3 py-2 flex items-center space-x-3 transition-colors duration-200 ${getBackgroundColor(
                    isSelected
                  )}`}
                >
                  {/* League Logo */}
                  <img
                    src={league.logo_url}
                    alt={`${league.league_name} logo`}
                    className="w-5 h-5 object-contain flex-shrink-0"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />

                  {/* League Name */}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-left truncate">
                      {league.league_name}
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
            className={`p-3 border-t border-gray-200 lg:block ${
              isPopularLeaguesExpanded ? "block" : "hidden"
            }`}
          >
            <button
              onClick={() => {
                setSelectedPopularLeague(null);
                onLeagueSelect(null);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              Clear League Filter
            </button>
          </div>
        )}
      </div>

      {/* Countries Section */}
      <div className="bg-white w-full lg:w-80 h-fit rounded-lg overflow-hidden shadow-sm border border-gray-200">
        {/* Header */}
        <div className="bg-gray-50 border-b border-gray-200 px-3 py-2">
          <button
            onClick={() => setIsCountriesExpanded(!isCountriesExpanded)}
            className="w-full flex items-center justify-between text-left lg:cursor-default"
          >
            <h3 className="text-base font-semibold text-gray-700 tracking-wide">
              Countries
            </h3>
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform duration-200 lg:hidden ${
                isCountriesExpanded ? "rotate-180" : ""
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

        {/* Countries List */}
        <div
          className={`overflow-y-auto max-h-80 lg:block ${
            isCountriesExpanded ? "block" : "hidden"
          }`}
        >
          {uniqueCountries.length === 0 ? (
            <div className="px-4 py-6 text-center text-gray-500">
              <div className="text-sm">No countries available</div>
            </div>
          ) : (
            uniqueCountries.map((country) => {
              const isExpanded = expandedCountry === country;
              const isSelected = selectedCountry === country;
              const countryLeagues = getLeaguesByCountry(country);

              return (
                <div
                  key={country}
                  className="border-b border-gray-100 last:border-b-0"
                >
                  {/* Country Header */}
                  <button
                    onClick={() => handleCountryClick(country)}
                    className={`w-full px-3 py-2 flex items-center justify-between text-left transition-colors duration-200 ${
                      isSelected
                        ? "bg-gray-100 text-gray-800"
                        : "text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <span className="text-sm font-medium">{country}</span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${
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

                  {/* Country Leagues - Show when expanded */}
                  {isExpanded && (
                    <div className="bg-gray-50">
                      {countryLeagues.map((league) => {
                        const isLeagueSelected =
                          selectedCountryLeague === league.league_id;
                        return (
                          <button
                            key={league.league_id}
                            onClick={() =>
                              handleCountryLeagueClick(league.league_id)
                            }
                            className={`w-full px-6 py-2 flex items-center space-x-3 text-left transition-colors duration-200 ${
                              isLeagueSelected
                                ? "bg-blue-500 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {/* League Logo */}
                            <img
                              src={league.logo_url}
                              alt={`${league.league_name} logo`}
                              className="w-4 h-4 object-contain flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />

                            {/* League Name */}
                            <div className="flex-1 min-w-0">
                              <div className="text-xs truncate">
                                {league.league_name}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Clear Country Filter Button */}
        {selectedCountry && (
          <div
            className={`p-3 border-t border-gray-200 lg:block ${
              isCountriesExpanded ? "block" : "hidden"
            }`}
          >
            <button
              onClick={() => {
                onCountrySelect(null);
                onLeagueSelect(null); // Also clear league selection
                setSelectedCountryLeague(null);
                setExpandedCountry(null);
              }}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg transition-colors duration-200 text-sm font-medium shadow-sm"
            >
              Clear Country Filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
