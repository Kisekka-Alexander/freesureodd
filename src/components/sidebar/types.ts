import { League } from "@/types";

export interface SidebarComponentProps {
  leagues: League[];
  selectedLeague: number | null;
  selectedCountry: string | null;
  onLeagueSelect: (leagueId: number | null) => void;
  onCountrySelect: (country: string | null) => void;
  predictions?: Array<{ league_name: string; match_date: string }>;
}

export interface PopularLeaguesProps
  extends Omit<SidebarComponentProps, "selectedCountry" | "onCountrySelect"> {
  selectedPopularLeague: number | null;
  onPopularLeagueSelect: (leagueId: number | null) => void;
  onClearPopularLeague: () => void;
}

export interface CountriesProps
  extends Omit<SidebarComponentProps, "selectedLeague"> {
  expandedCountry: string | null;
  selectedCountryLeague: number | null;
  onExpandCountry: (country: string | null) => void;
  onCountryLeagueSelect: (leagueId: number | null) => void;
}

export interface PredefinedLeague {
  league_id: number;
  name: string;
  country: string;
  count: number;
}
