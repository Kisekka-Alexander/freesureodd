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
        selectedLeague={selectedLeague}
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
