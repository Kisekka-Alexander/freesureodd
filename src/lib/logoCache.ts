// logoCache.ts - TheSportsDB Daily Logo Cache System for Next.js
import fs from 'fs/promises';
import path from 'path';
import fetch from 'node-fetch';

interface LeagueInfo {
    id: string;
    name: string;
    logo: string | null;
    country: string;
    alternateNames: string[];
}

interface TeamInfo {
    id: string;
    name: string;
    logo: string | null;
    league: string;
    country: string;
    stadium: string;
    alternateNames: string[];
}

interface LogoMappings {
    leagues: Record<string, LeagueInfo>;
    teams: Record<string, TeamInfo>;
    timestamp: string;
    source: string;
}

interface CacheConfig {
    cacheDir?: string;
    apiKey?: string;
    cacheHours?: number;
    rateLimit?: number;
    targetLeagues?: string[];
}

class TheSportsDBLogoCache {
    private cacheDir: string;
    private cacheFile: string;
    private lastFetchFile: string;
    private API_KEY: string;
    private API_BASE = 'https://www.thesportsdb.com/api/v1/json';
    private cacheHours: number;
    private rateLimit: number;
    private targetLeagues: string[];

    constructor(config: CacheConfig = {}) {
        this.cacheDir = config.cacheDir || path.join(process.cwd(), 'cache', 'logos');
        this.cacheFile = path.join(this.cacheDir, 'logo-mappings.json');
        this.lastFetchFile = path.join(this.cacheDir, 'last-fetch.json');

        // TheSportsDB API Configuration
        // API Key '3' is for testing, get your free key at https://www.thesportsdb.com/api.php
        this.API_KEY = config.apiKey || process.env.THESPORTSDB_API_KEY || '3';

        // Cache settings
        this.cacheHours = config.cacheHours || 24; // Default 24 hours
        this.rateLimit = config.rateLimit || 500; // ms between requests (increased from 100ms)

        // Target leagues (customize based on your needs)
        this.targetLeagues = config.targetLeagues || [
            'English Premier League',
            'English League Championship',
            'English League One',
            'English League Two',
            'Spanish La Liga',
            'Italian Serie A',
            'German Bundesliga',
            'French Ligue 1',
            'Dutch Eredivisie',
            'Scottish Premier League',
            'Portuguese Primeira Liga',
            'Belgian First Division A',
            'Turkish Super Lig',
            'UEFA Champions League',
            'UEFA Europa League'
        ];
    }

    async initialize(): Promise<boolean> {
        try {
            // Create cache directory if it doesn't exist
            await fs.mkdir(this.cacheDir, { recursive: true });

            // Just load existing cache - no API calls during request handling
            const stats = await this.getCacheStats();
            console.log(`📂 Loaded logo cache: ${stats.leagueCount} leagues, ${stats.teamCount} teams`);
            console.log(`📅 Last updated: ${stats.lastUpdated}`);

            // Warn if cache is very old but don't block
            if (await this.shouldUpdateCache()) {
                console.log('⚠️  Cache is outdated. Run `npm run cache:build` to update.');
            }

            return true;
        } catch (error) {
            console.error('Error initializing logo cache:', error);
            // Still return true so the application can continue with empty cache
            return true;
        }
    }

    private async shouldUpdateCache(): Promise<boolean> {
        try {
            const lastFetch = await fs.readFile(this.lastFetchFile, 'utf-8');
            const lastFetchData = JSON.parse(lastFetch);
            const lastFetchDate = new Date(lastFetchData.timestamp);
            const now = new Date();

            // Check if cache period has passed
            const hoursDiff = (now.getTime() - lastFetchDate.getTime()) / (1000 * 60 * 60);
            return hoursDiff >= this.cacheHours;
        } catch (error) {
            // If no last fetch file exists, we should update
            return true;
        }
    }

    async updateAllLogos(): Promise<LogoMappings> {
        console.log('Starting logo cache update from TheSportsDB...');
        const startTime = Date.now();

        try {
            const logoMappings: LogoMappings = {
                leagues: {},
                teams: {},
                timestamp: new Date().toISOString(),
                source: 'TheSportsDB'
            };

            // Step 1: Fetch all soccer leagues
            console.log('Fetching all soccer leagues...');
            console.log(`API URL: ${this.API_BASE}/${this.API_KEY}/all_leagues.php`);

            const leaguesResponse = await fetch(
                `${this.API_BASE}/${this.API_KEY}/all_leagues.php`,
                {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; FreeSureOdd Logo Cache/1.0)',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                }
            );

            // Check if response is OK and content type is JSON
            if (!leaguesResponse.ok) {
                throw new Error(`API request failed with status: ${leaguesResponse.status} - ${leaguesResponse.statusText}`);
            }

            const contentType = leaguesResponse.headers.get('content-type');
            console.log('Response content-type:', contentType);

            if (!contentType || !contentType.includes('application/json')) {
                const responseText = await leaguesResponse.text();
                console.error('Non-JSON response received (first 500 chars):', responseText.substring(0, 500));
                throw new Error('API returned non-JSON response, possibly rate limited or API key invalid');
            }

            const leaguesData = await leaguesResponse.json() as any;

            if (!leaguesData.leagues) {
                throw new Error('No leagues data received from API');
            }

            // Filter for soccer leagues
            const soccerLeagues = leaguesData.leagues.filter(
                (league: any) => league.strSport === 'Soccer'
            );

            console.log(`Found ${soccerLeagues.length} soccer leagues`);

            // Step 2: Get detailed info for each league
            let processedLeagues = 0;
            for (const league of soccerLeagues) {
                // Skip if not in target leagues (if specified)
                if (this.targetLeagues.length > 0 &&
                    !this.targetLeagues.some(target =>
                        league.strLeague.includes(target) || target.includes(league.strLeague)
                    )) {
                    continue;
                }

                // Get league details
                await this.delay(this.rateLimit);
                const leagueDetailsResponse = await fetch(
                    `${this.API_BASE}/${this.API_KEY}/lookupleague.php?id=${league.idLeague}`,
                    {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (compatible; FreeSureOdd Logo Cache/1.0)',
                            'Accept': 'application/json, text/plain, */*',
                            'Accept-Language': 'en-US,en;q=0.9',
                        }
                    }
                );

                if (!leagueDetailsResponse.ok) {
                    console.log(`Failed to fetch league details for ${league.strLeague}: ${leagueDetailsResponse.status}`);
                    continue;
                }

                const leagueContentType = leagueDetailsResponse.headers.get('content-type');
                if (!leagueContentType || !leagueContentType.includes('application/json')) {
                    console.log(`Non-JSON response for league ${league.strLeague}, skipping...`);
                    continue;
                }

                const leagueDetailsData = await leagueDetailsResponse.json() as any;

                if (leagueDetailsData.leagues && leagueDetailsData.leagues[0]) {
                    const leagueDetail = leagueDetailsData.leagues[0];

                    // Store league info with multiple name variants
                    const leagueInfo: LeagueInfo = {
                        id: leagueDetail.idLeague,
                        name: leagueDetail.strLeague,
                        logo: leagueDetail.strBadge || leagueDetail.strLogo || leagueDetail.strFanart1,
                        country: leagueDetail.strCountry,
                        alternateNames: this.getLeagueAlternateNames(leagueDetail)
                    };

                    // Store by primary name and alternates
                    logoMappings.leagues[leagueDetail.strLeague] = leagueInfo;

                    // Also store by common alternate names
                    for (const altName of leagueInfo.alternateNames) {
                        if (altName && altName !== leagueDetail.strLeague) {
                            logoMappings.leagues[altName] = leagueInfo;
                        }
                    }

                    processedLeagues++;
                    console.log(`Processed league ${processedLeagues}: ${leagueDetail.strLeague}`);

                    // Step 3: Fetch teams for this league
                    await this.delay(this.rateLimit);
                    const teamsResponse = await fetch(
                        `${this.API_BASE}/${this.API_KEY}/lookup_all_teams.php?id=${league.idLeague}`,
                        {
                            headers: {
                                'User-Agent': 'Mozilla/5.0 (compatible; FreeSureOdd Logo Cache/1.0)',
                                'Accept': 'application/json, text/plain, */*',
                                'Accept-Language': 'en-US,en;q=0.9',
                            }
                        }
                    );

                    if (teamsResponse.ok) {
                        const teamsContentType = teamsResponse.headers.get('content-type');
                        if (teamsContentType && teamsContentType.includes('application/json')) {
                            const teamsData = await teamsResponse.json() as any;

                            if (teamsData.teams) {
                                for (const team of teamsData.teams) {
                                    const teamInfo: TeamInfo = {
                                        id: team.idTeam,
                                        name: team.strTeam,
                                        logo: team.strBadge || team.strTeamBadge || team.strTeamLogo,
                                        league: leagueDetail.strLeague,
                                        country: team.strCountry,
                                        stadium: team.strStadium,
                                        alternateNames: this.getTeamAlternateNames(team)
                                    };

                                    // Store by primary name
                                    logoMappings.teams[team.strTeam] = teamInfo;

                                    // Store by alternate names
                                    for (const altName of teamInfo.alternateNames) {
                                        if (altName && altName !== team.strTeam) {
                                            logoMappings.teams[altName] = teamInfo;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            // Step 4: Save the cache
            await fs.writeFile(
                this.cacheFile,
                JSON.stringify(logoMappings, null, 2)
            );

            // Step 5: Update last fetch timestamp
            await fs.writeFile(
                this.lastFetchFile,
                JSON.stringify({
                    timestamp: new Date().toISOString(),
                    leagueCount: Object.keys(logoMappings.leagues).length,
                    teamCount: Object.keys(logoMappings.teams).length
                })
            );

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`✅ Cache updated successfully in ${elapsed}s`);
            console.log(`   - ${processedLeagues} leagues`);
            console.log(`   - ${Object.keys(logoMappings.teams).length} teams`);

            return logoMappings;
        } catch (error) {
            console.error('❌ Error updating logo cache:', error);
            // Try to load existing cache if update fails
            return await this.loadCache();
        }
    }

    private getLeagueAlternateNames(league: any): string[] {
        const alternates = [
            league.strLeague,
            league.strLeagueAlternate
        ].filter(Boolean);

        // Add common variations
        const name = league.strLeague;
        if (name.includes('English Premier League')) {
            alternates.push('Premier League', 'EPL', 'PL');
        } else if (name.includes('Spanish La Liga')) {
            alternates.push('La Liga', 'LaLiga', 'Primera Division');
        } else if (name.includes('Italian Serie A')) {
            alternates.push('Serie A', 'Serie A TIM');
        } else if (name.includes('German Bundesliga')) {
            alternates.push('Bundesliga', '1. Bundesliga');
        } else if (name.includes('French Ligue 1')) {
            alternates.push('Ligue 1', 'Ligue 1 Uber Eats');
        } else if (name.includes('Championship')) {
            alternates.push('Championship', 'EFL Championship');
        } else if (name.includes('League One')) {
            alternates.push('League One', 'EFL League One');
        } else if (name.includes('League Two')) {
            alternates.push('League Two', 'EFL League Two');
        } else if (name.includes('Eredivisie')) {
            alternates.push('Eredivisie', 'Dutch Eredivisie');
        } else if (name.includes('Scottish Premier')) {
            alternates.push('Scottish Premiership', 'SPFL', 'SPL');
        }

        return [...new Set(alternates)];
    }

    private getTeamAlternateNames(team: any): string[] {
        const alternates = [
            team.strTeam,
            team.strAlternate,
            team.strTeamShort,
            team.strKeywords
        ].filter(Boolean);

        // Split keywords if present
        if (team.strKeywords) {
            alternates.push(...team.strKeywords.split(',').map((k: string) => k.trim()));
        }

        return [...new Set(alternates)];
    }

    async loadCache(): Promise<LogoMappings> {
        try {
            const cacheData = await fs.readFile(this.cacheFile, 'utf-8');
            return JSON.parse(cacheData);
        } catch (error) {
            console.error('Error loading cache:', error);
            // Return empty cache structure if file doesn't exist or is corrupted
            const emptyCache: LogoMappings = {
                leagues: {},
                teams: {},
                timestamp: new Date().toISOString(),
                source: 'Empty'
            };

            // Try to create the cache directory and file
            try {
                await fs.mkdir(this.cacheDir, { recursive: true });
                await fs.writeFile(this.cacheFile, JSON.stringify(emptyCache, null, 2));
                console.log('Created empty cache file');
            } catch (createError) {
                console.error('Error creating empty cache:', createError);
            }

            return emptyCache;
        }
    }

    async getLeagueLogo(leagueName: string): Promise<string | null> {
        if (!leagueName) return null;

        const cache = await this.loadCache();

        // Try exact match first
        if (cache.leagues[leagueName]) {
            return cache.leagues[leagueName].logo;
        }

        // Try case-insensitive match
        const leagueNameLower = leagueName.toLowerCase();
        for (const [name, data] of Object.entries(cache.leagues)) {
            if (name.toLowerCase() === leagueNameLower) {
                return data.logo;
            }
        }

        // Try fuzzy matching
        for (const [name, data] of Object.entries(cache.leagues)) {
            if (this.fuzzyMatch(name, leagueName)) {
                return data.logo;
            }
        }

        console.log(`League logo not found for: ${leagueName}`);
        return null;
    }

    async getTeamLogo(teamName: string, leagueName?: string): Promise<string | null> {
        if (!teamName) return null;

        const cache = await this.loadCache();

        // Try exact match first
        if (cache.teams[teamName]) {
            return cache.teams[teamName].logo;
        }

        // Try case-insensitive match
        const teamNameLower = teamName.toLowerCase();
        for (const [name, data] of Object.entries(cache.teams)) {
            if (name.toLowerCase() === teamNameLower) {
                // If league is specified, verify it matches
                if (leagueName && data.league !== leagueName) {
                    continue;
                }
                return data.logo;
            }
        }

        // Try fuzzy matching
        for (const [name, data] of Object.entries(cache.teams)) {
            if (this.fuzzyMatch(name, teamName)) {
                // If league is specified, verify it matches
                if (leagueName && !this.fuzzyMatch(data.league, leagueName)) {
                    continue;
                }
                return data.logo;
            }
        }

        console.log(`Team logo not found for: ${teamName}${leagueName ? ` in ${leagueName}` : ''}`);
        return null;
    }

    private fuzzyMatch(str1: string, str2: string): boolean {
        if (!str1 || !str2) return false;

        // Normalize strings for comparison
        const normalize = (s: string) => s.toLowerCase()
            .replace(/[^a-z0-9]/g, '')
            .replace(/fc|cf|afc|united|city|town|rovers|wanderers/g, '');

        const normalized1 = normalize(str1);
        const normalized2 = normalize(str2);

        // Check exact match after normalization
        if (normalized1 === normalized2) return true;

        // Check if one contains the other (for partial matches)
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
            return true;
        }

        return false;
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Manual refresh method
    async forceRefresh(): Promise<LogoMappings> {
        console.log('Force refreshing cache...');
        return await this.updateAllLogos();
    }

    // Get cache statistics
    async getCacheStats() {
        try {
            const cache = await this.loadCache();
            const lastFetchData = await fs.readFile(this.lastFetchFile, 'utf-8')
                .then(data => JSON.parse(data))
                .catch(() => ({}));

            const stats = await fs.stat(this.cacheFile).catch(() => ({ size: 0 }));

            return {
                leagueCount: new Set(Object.values(cache.leagues || {}).map(l => l.id)).size,
                teamCount: new Set(Object.values(cache.teams || {}).map(t => t.id)).size,
                lastUpdated: lastFetchData.timestamp || 'Never',
                nextUpdate: lastFetchData.timestamp ?
                    new Date(new Date(lastFetchData.timestamp).getTime() + this.cacheHours * 60 * 60 * 1000).toISOString() :
                    'Unknown',
                cacheSize: `${(stats.size / 1024).toFixed(2)} KB`
            };
        } catch (error) {
            console.error('Error getting cache stats:', error);
            return {
                leagueCount: 0,
                teamCount: 0,
                lastUpdated: 'Never',
                nextUpdate: 'Unknown',
                cacheSize: '0 KB'
            };
        }
    }

    // Search methods for finding logos
    async searchLeague(query: string) {
        const cache = await this.loadCache();
        const results = [];
        const queryLower = query.toLowerCase();

        const uniqueLeagues = new Map();

        for (const [name, data] of Object.entries(cache.leagues)) {
            if (name.toLowerCase().includes(queryLower)) {
                if (!uniqueLeagues.has(data.id)) {
                    uniqueLeagues.set(data.id, {
                        name: data.name,
                        logo: data.logo,
                        country: data.country
                    });
                }
            }
        }

        return Array.from(uniqueLeagues.values());
    }

    async searchTeam(query: string, leagueName?: string) {
        const cache = await this.loadCache();
        const queryLower = query.toLowerCase();

        const uniqueTeams = new Map();

        for (const [name, data] of Object.entries(cache.teams)) {
            if (name.toLowerCase().includes(queryLower)) {
                if (leagueName && !data.league.toLowerCase().includes(leagueName.toLowerCase())) {
                    continue;
                }

                if (!uniqueTeams.has(data.id)) {
                    uniqueTeams.set(data.id, {
                        name: data.name,
                        logo: data.logo,
                        league: data.league,
                        country: data.country
                    });
                }
            }
        }

        return Array.from(uniqueTeams.values());
    }
}

// Create singleton instance
let logoCache: TheSportsDBLogoCache | null = null;

export function getLogoCache(): TheSportsDBLogoCache {
    if (!logoCache) {
        logoCache = new TheSportsDBLogoCache({
            apiKey: process.env.THESPORTSDB_API_KEY || '3',
            cacheHours: 24,
            rateLimit: 1000, // Increased rate limit to avoid API blocking
            targetLeagues: [] // Empty array means fetch all leagues
        });
    }
    return logoCache;
}

export default TheSportsDBLogoCache;
export type { LeagueInfo, TeamInfo, LogoMappings };
