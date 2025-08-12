// Comprehensive country to flag emoji mapping
export const getCountryFlag = (country: string): string => {
    // Normalize country name (trim, lowercase for comparison)
    const normalizedCountry = country.trim().toLowerCase();

    const flagMap: Record<string, string> = {
        // European countries
        'england': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
        'scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
        'wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
        'northern ireland': '🏴󠁧󠁢󠁮󠁩󠁲󠁿',
        'united kingdom': '🇬🇧',
        'spain': '🇪🇸',
        'italy': '🇮🇹',
        'germany': '🇩🇪',
        'france': '🇫🇷',
        'netherlands': '🇳🇱',
        'portugal': '🇵🇹',
        'belgium': '🇧🇪',
        'austria': '🇦🇹',
        'switzerland': '🇨🇭',
        'poland': '🇵🇱',
        'greece': '🇬🇷',
        'turkey': '🇹🇷',
        'norway': '🇳🇴',
        'sweden': '🇸🇪',
        'denmark': '🇩🇰',
        'finland': '🇫🇮',
        'russia': '🇷🇺',
        'ukraine': '🇺🇦',
        'czech republic': '🇨🇿',
        'croatia': '🇭🇷',
        'serbia': '🇷🇸',

        // Americas
        'united states': '🇺🇸',
        'usa': '🇺🇸',
        'canada': '🇨🇦',
        'mexico': '🇲🇽',
        'brazil': '🇧🇷',
        'argentina': '🇦🇷',
        'colombia': '🇨🇴',
        'chile': '🇨🇱',
        'uruguay': '🇺🇾',
        'peru': '🇵🇪',

        // Asia
        'japan': '🇯🇵',
        'south korea': '🇰🇷',
        'china': '🇨🇳',
        'india': '🇮🇳',
        'australia': '🇦🇺',
        'new zealand': '🇳🇿',

        // Africa
        'south africa': '🇿🇦',
        'egypt': '🇪🇬',
        'morocco': '🇲🇦',
        'nigeria': '🇳🇬',
    };

    return flagMap[normalizedCountry] || '🌍';
};
