/**
 * Utility functions for converting between league/country names and URL-friendly slugs
 */

// Convert text to URL-friendly slug
export function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with hyphens
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars except hyphens
    .replace(/\-\-+/g, '-')         // Replace multiple hyphens with single hyphen
    .replace(/^-+/, '')             // Trim hyphens from start
    .replace(/-+$/, '');            // Trim hyphens from end
}

// Convert slug back to display text (capitalize each word)
export function fromSlug(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// Country mappings for special cases
const countryMappings: Record<string, string> = {
  'england': 'England',
  'spain': 'Spain',
  'italy': 'Italy',
  'germany': 'Germany',
  'france': 'France',
  'netherlands': 'Netherlands',
  'portugal': 'Portugal',
  'scotland': 'Scotland',
  'wales': 'Wales',
  'northern-ireland': 'Northern Ireland',
  'united-states': 'United States',
  'usa': 'United States',
  'brazil': 'Brazil',
  'argentina': 'Argentina',
  'mexico': 'Mexico',
  'turkey': 'Turkey',
  'belgium': 'Belgium',
  'russia': 'Russia',
  'ukraine': 'Ukraine',
  'poland': 'Poland',
  'austria': 'Austria',
  'switzerland': 'Switzerland',
  'denmark': 'Denmark',
  'sweden': 'Sweden',
  'norway': 'Norway',
  'greece': 'Greece',
  'croatia': 'Croatia',
  'serbia': 'Serbia',
  'czech-republic': 'Czech Republic',
  'slovakia': 'Slovakia',
  'hungary': 'Hungary',
  'romania': 'Romania',
  'bulgaria': 'Bulgaria',
  'slovenia': 'Slovenia',
  'bosnia-and-herzegovina': 'Bosnia and Herzegovina',
  'north-macedonia': 'North Macedonia',
  'albania': 'Albania',
  'montenegro': 'Montenegro',
  'kosovo': 'Kosovo',
  'moldova': 'Moldova',
  'belarus': 'Belarus',
  'estonia': 'Estonia',
  'latvia': 'Latvia',
  'lithuania': 'Lithuania',
  'finland': 'Finland',
  'iceland': 'Iceland',
  'ireland': 'Ireland',
  'cyprus': 'Cyprus',
  'malta': 'Malta',
  'luxembourg': 'Luxembourg',
  'liechtenstein': 'Liechtenstein',
  'monaco': 'Monaco',
  'san-marino': 'San Marino',
  'andorra': 'Andorra',
  'vatican-city': 'Vatican City',
  'faroe-islands': 'Faroe Islands',
  'gibraltar': 'Gibraltar',
  'japan': 'Japan',
  'south-korea': 'South Korea',
  'china': 'China',
  'australia': 'Australia',
  'new-zealand': 'New Zealand',
  'india': 'India',
  'thailand': 'Thailand',
  'singapore': 'Singapore',
  'malaysia': 'Malaysia',
  'indonesia': 'Indonesia',
  'philippines': 'Philippines',
  'vietnam': 'Vietnam',
  'south-africa': 'South Africa',
  'egypt': 'Egypt',
  'morocco': 'Morocco',
  'tunisia': 'Tunisia',
  'algeria': 'Algeria',
  'nigeria': 'Nigeria',
  'ghana': 'Ghana',
  'cameroon': 'Cameroon',
  'ivory-coast': 'Ivory Coast',
  'senegal': 'Senegal',
  'mali': 'Mali',
  'burkina-faso': 'Burkina Faso',
  'canada': 'Canada',
  'chile': 'Chile',
  'colombia': 'Colombia',
  'peru': 'Peru',
  'ecuador': 'Ecuador',
  'uruguay': 'Uruguay',
  'paraguay': 'Paraguay',
  'bolivia': 'Bolivia',
  'venezuela': 'Venezuela',
};

// League mappings for special cases  
const leagueMappings: Record<string, string> = {
  'premier-league': 'Premier League',
  'championship': 'Championship',
  'league-one': 'League One',
  'league-two': 'League Two',
  'la-liga': 'La Liga',
  'segunda-division': 'Segunda División',
  'serie-a': 'Serie A',
  'serie-b': 'Serie B',
  'bundesliga': 'Bundesliga',
  '2-bundesliga': '2. Bundesliga',
  'ligue-1': 'Ligue 1',
  'ligue-2': 'Ligue 2',
  'eredivisie': 'Eredivisie',
  'primeira-liga': 'Primeira Liga',
  'scottish-premiership': 'Scottish Premiership',
  'champions-league': 'Champions League',
  'europa-league': 'Europa League',
  'conference-league': 'Conference League',
  'fa-cup': 'FA Cup',
  'carabao-cup': 'Carabao Cup',
  'copa-del-rey': 'Copa del Rey',
  'coppa-italia': 'Coppa Italia',
  'dfb-pokal': 'DFB-Pokal',
  'coupe-de-france': 'Coupe de France',
  'knvb-beker': 'KNVB Beker',
  'taca-de-portugal': 'Taça de Portugal',
  'mls': 'MLS',
  'liga-mx': 'Liga MX',
  'brasileirao': 'Brasileirão',
  'copa-libertadores': 'Copa Libertadores',
  'copa-sudamericana': 'Copa Sudamericana',
  'j1-league': 'J1 League',
  'k-league-1': 'K League 1',
  'chinese-super-league': 'Chinese Super League',
  'a-league': 'A-League',
  'indian-super-league': 'Indian Super League',
  'primera-division': 'Primera División',
  'superliga': 'Superliga',
  'jupiler-pro-league': 'Jupiler Pro League',
  'russian-premier-league': 'Russian Premier League',
  'ukrainian-premier-league': 'Ukrainian Premier League',
  'ekstraklasa': 'Ekstraklasa',
  'austrian-bundesliga': 'Austrian Bundesliga',
  'swiss-super-league': 'Swiss Super League',
  'superligaen': 'Superligaen',
  'allsvenskan': 'Allsvenskan',
  'eliteserien': 'Eliteserien',
  'super-league-greece': 'Super League Greece',
  'croatian-prva-hnl': 'Croatian Prva HNL',
  'serbian-superliga': 'Serbian SuperLiga',
  'czech-first-league': 'Czech First League',
  'slovak-super-liga': 'Slovak Super Liga',
  'hungarian-nb-i': 'Hungarian NB I',
  'romanian-liga-1': 'Romanian Liga 1',
  'bulgarian-first-league': 'Bulgarian First League',
  'slovenian-prvaliga': 'Slovenian PrvaLiga',
  'bosnian-premier-league': 'Bosnian Premier League',
  'north-macedonian-first-league': 'North Macedonian First League',
  'albanian-kategoria-superiore': 'Albanian Kategoria Superiore',
  'montenegrin-first-league': 'Montenegrin First League',
  'kosovar-superliga': 'Kosovar Superliga',
  'moldovan-national-division': 'Moldovan National Division',
  'belarusian-premier-league': 'Belarusian Premier League',
  'estonian-meistriliiga': 'Estonian Meistriliiga',
  'latvian-virsliga': 'Latvian Virsliga',
  'lithuanian-a-lyga': 'Lithuanian A Lyga',
  'finnish-veikkausliiga': 'Finnish Veikkausliiga',
  'icelandic-urvalsdeild': 'Icelandic Úrvalsdeild',
  'irish-premier-division': 'Irish Premier Division',
  'cypriot-first-division': 'Cypriot First Division',
  'maltese-premier-league': 'Maltese Premier League',
};

// Convert country name to URL slug
export function countryToSlug(country: string): string {
  const slug = toSlug(country);
  // Check if we have a reverse mapping
  const reverseMapping = Object.entries(countryMappings).find(([, value]) => value === country);
  return reverseMapping ? reverseMapping[0] : slug;
}

// Convert country slug to display name
export function slugToCountry(slug: string): string {
  return countryMappings[slug] || fromSlug(slug);
}

// Convert league name to URL slug
export function leagueToSlug(league: string): string {
  const slug = toSlug(league);
  // Check if we have a reverse mapping
  const reverseMapping = Object.entries(leagueMappings).find(([, value]) => value === league);
  return reverseMapping ? reverseMapping[0] : slug;
}

// Convert league slug to display name  
export function slugToLeague(slug: string): string {
  return leagueMappings[slug] || fromSlug(slug);
}

// Generate league URL
export function generateLeagueUrl(country: string, league: string): string {
  const countrySlug = countryToSlug(country);
  const leagueSlug = leagueToSlug(league);
  return `/predictions/${countrySlug}/${leagueSlug}`;
}

// Generate country URL
export function generateCountryUrl(country: string): string {
  const countrySlug = countryToSlug(country);
  return `/predictions/${countrySlug}`;
}

// Parse league URL params
export function parseLeagueParams(countrySlug: string, leagueSlug: string) {
  return {
    country: slugToCountry(countrySlug),
    league: slugToLeague(leagueSlug)
  };
}

// Parse country URL params
export function parseCountryParams(countrySlug: string) {
  return {
    country: slugToCountry(countrySlug)
  };
}
