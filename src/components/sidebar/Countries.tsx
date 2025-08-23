import { useState } from "react";
import Image from "next/image";
import { CountriesProps } from "./types";

export function Countries({
  leagues,
  selectedCountry,
  expandedCountry,
  selectedCountryLeague,
  onExpandCountry,
  onCountrySelect,
  onLeagueSelect,
  onCountryLeagueSelect,
}: CountriesProps) {
  const [isExpanded, setIsExpanded] = useState(false);

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

  const handleCountryClick = (country: string) => {
    if (expandedCountry === country) {
      // If the same country is clicked, collapse it
      onExpandCountry(null);
      if (selectedCountry === country) {
        onCountrySelect(null);
        onLeagueSelect(null); // Clear any league selection when deselecting country
      }
    } else {
      // Just expand the country without selecting it
      onExpandCountry(country);
      // Don't call onCountrySelect here - only call it when a league is selected
    }
  };

  const handleCountryLeagueClick = (leagueId: number) => {
    console.log("Country league clicked:", leagueId);
    // If the same league is clicked, deselect it
    if (selectedCountryLeague === leagueId) {
      console.log("Deselecting league:", leagueId);
      onCountryLeagueSelect(null);
      onLeagueSelect(null);
      onCountrySelect(null); // Clear country selection when deselecting league
    } else {
      console.log("Selecting league:", leagueId);
      onCountryLeagueSelect(leagueId);
      onLeagueSelect(leagueId);

      // Find the country for this league and select it
      const league = leagues.find((l) => l.league_id === leagueId);
      console.log("Found league for country selection:", league);
      if (league && league.country) {
        console.log("Setting country:", league.country);
        onCountrySelect(league.country);
      }
    }
  };

  const handleClearCountryFilter = () => {
    onCountrySelect(null);
    onLeagueSelect(null); // Also clear league selection
    onCountryLeagueSelect(null);
    onExpandCountry(null);
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
            Countries
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

      {/* Countries List */}
      <div
        className={`overflow-y-auto max-h-80 lg:block ${
          isExpanded ? "block" : "hidden"
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
                  className={`w-full px-2 py-2 flex items-center justify-between text-left transition-colors duration-200 ${
                    isSelected
                      ? "bg-gray-100 text-gray-800"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-xs font-medium">{country}</span>
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
                          className={`w-full px-4 py-1.5 flex items-center space-x-2 text-left transition-colors duration-200 ${
                            isLeagueSelected
                              ? "bg-blue-500 text-white"
                              : "text-gray-600 hover:bg-gray-100"
                          }`}
                        >
                          {/* League Logo */}
                          <Image
                            src={league.logo_url}
                            alt={`${league.league_name} logo`}
                            width={14}
                            height={14}
                            className="w-3.5 h-3.5 object-contain flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.style.display = "none";
                            }}
                          />

                          {/* League Name */}
                          <div className="flex-1 min-w-0">
                            <div className="text-xs truncate leading-tight">
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
          className={`p-2 border-t border-gray-200 lg:block ${
            isExpanded ? "block" : "hidden"
          }`}
        >
          <button
            onClick={handleClearCountryFilter}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white py-1.5 px-2 rounded-lg transition-colors duration-200 text-xs font-medium shadow-sm"
          >
            Clear Country Filter
          </button>
        </div>
      )}
    </div>
  );
}
