import { useState, useEffect } from "react";
import { PopularLeagues } from "./sidebar/PopularLeagues";
import { Countries } from "./sidebar/Countries";
import { SidebarComponentProps } from "./sidebar/types";

export function PopularLeaguesSidebar({
  leagues,
  selectedLeague,
  selectedCountry,
  onLeagueSelect,
  onCountrySelect,
  predictions,
}: SidebarComponentProps) {
  const [expandedCountry, setExpandedCountry] = useState<string | null>(null);

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

  // Handler functions for Popular Leagues
  const handlePopularLeagueSelect = (leagueId: number | null) => {
    setSelectedPopularLeague(leagueId);
    setSelectedCountryLeague(null); // Clear country league selection
    onLeagueSelect(leagueId);
  };

  const handleClearPopularLeague = () => {
    setSelectedPopularLeague(null);
    onLeagueSelect(null);
  };

  // Handler functions for Countries
  const handleCountryLeagueSelect = (leagueId: number | null) => {
    setSelectedCountryLeague(leagueId);
    setSelectedPopularLeague(null); // Clear popular league selection
    onLeagueSelect(leagueId); // This is the missing call that triggers the API request
  };

  return (
    <div className="space-y-4">
      {/* View All Predictions Section */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">🌍 All Predictions</h3>
        </div>
        <button
          onClick={() => {
            setSelectedPopularLeague(null);
            setSelectedCountryLeague(null);
            onLeagueSelect(null);
            onCountrySelect(null);
            window.location.href = '/predictions/all';
          }}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors duration-200 ${
            selectedLeague === null && selectedCountry === null
              ? "bg-blue-100 text-blue-700 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          }`}
        >
          <div className="flex items-center justify-between">
            <span>View All Predictions</span>
            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
              {predictions?.length || 0}
            </span>
          </div>
        </button>
      </div>

      <PopularLeagues
        leagues={leagues}
        selectedLeague={selectedLeague}
        selectedPopularLeague={selectedPopularLeague}
        onLeagueSelect={onLeagueSelect}
        onPopularLeagueSelect={handlePopularLeagueSelect}
        onClearPopularLeague={handleClearPopularLeague}
        predictions={predictions}
      />

      <Countries
        leagues={leagues}
        selectedCountry={selectedCountry}
        expandedCountry={expandedCountry}
        selectedCountryLeague={selectedCountryLeague}
        onExpandCountry={setExpandedCountry}
        onCountrySelect={onCountrySelect}
        onLeagueSelect={onLeagueSelect}
        onCountryLeagueSelect={handleCountryLeagueSelect}
        predictions={predictions}
      />
    </div>
  );
}
