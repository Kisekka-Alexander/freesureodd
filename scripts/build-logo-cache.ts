// Background cache builder for TheSportsDB logos
// This script should be run periodically (e.g., daily via cron) to pre-populate the cache
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
    stats: {
        totalLeagues: number;
        totalTeams: number;
        soccerLeagues: number;
        processedLeagues: number;
        failedRequests: number;
    };
}

class BackgroundCacheBuilder {
    private cacheDir: string;
    private cacheFile: string;
    private lastFetchFile: string;
    private API_KEY: string;
    private API_BASE = 'https://www.thesportsdb.com/api/v1/json';
    private rateLimit: number;
    private maxRetries: number;
    private limitLeagues?: number; // For testing

    constructor(options: { limitLeagues?: number } = {}) {
        this.cacheDir = path.join(process.cwd(), 'cache', 'logos');
        this.cacheFile = path.join(this.cacheDir, 'logo-mappings.json');
        this.lastFetchFile = path.join(this.cacheDir, 'last-fetch.json');
        this.API_KEY = process.env.THESPORTSDB_API_KEY || '3';
        this.rateLimit = 2000; // 2 seconds between requests to avoid rate limiting
        this.maxRetries = 3;
        this.limitLeagues = options.limitLeagues;
    }

    async buildCompleteCache(): Promise<LogoMappings> {
        console.log('🚀 Starting complete cache build from TheSportsDB...');
        const startTime = Date.now();

        try {
            // Create cache directory
            await fs.mkdir(this.cacheDir, { recursive: true });

            const logoMappings: LogoMappings = {
                leagues: {},
                teams: {},
                timestamp: new Date().toISOString(),
                source: 'TheSportsDB Complete Build',
                stats: {
                    totalLeagues: 0,
                    totalTeams: 0,
                    soccerLeagues: 0,
                    processedLeagues: 0,
                    failedRequests: 0
                }
            };

            // Step 1: Get all leagues
            console.log('📋 Fetching all leagues...');
            const allLeagues = await this.fetchAllLeagues();
            logoMappings.stats.totalLeagues = allLeagues.length;

            // Filter soccer leagues
            const soccerLeagues = allLeagues.filter(league => league.strSport === 'Soccer');
            logoMappings.stats.soccerLeagues = soccerLeagues.length;
            console.log(`⚽ Found ${soccerLeagues.length} soccer leagues out of ${allLeagues.length} total leagues`);

            // Step 2: Process each soccer league
            const leaguesToProcess = this.limitLeagues ?
                soccerLeagues.slice(0, this.limitLeagues) :
                soccerLeagues;

            console.log(`🎯 Processing ${leaguesToProcess.length} leagues${this.limitLeagues ? ' (limited for testing)' : ''}`);

            for (let i = 0; i < leaguesToProcess.length; i++) {
                const league = leaguesToProcess[i];
                console.log(`\n🏆 Processing league ${i + 1}/${leaguesToProcess.length}: ${league.strLeague}`);

                try {
                    // Get league details
                    const leagueDetails = await this.fetchLeagueDetails(league.idLeague);
                    if (leagueDetails) {
                        // Store league info
                        this.storeLeagueInfo(logoMappings, leagueDetails);

                        // Get teams for this league
                        const teams = await this.fetchLeagueTeams(league.idLeague);
                        if (teams && teams.length > 0) {
                            console.log(`  👥 Found ${teams.length} teams`);
                            for (const team of teams) {
                                this.storeTeamInfo(logoMappings, team, leagueDetails.strLeague);
                            }
                            logoMappings.stats.totalTeams += teams.length;
                        }

                        logoMappings.stats.processedLeagues++;
                    }
                } catch (error) {
                    console.error(`  ❌ Failed to process league ${league.strLeague}:`, error);
                    logoMappings.stats.failedRequests++;
                }

                // Rate limiting
                await this.delay(this.rateLimit);

                // Save progress every 10 leagues
                if ((i + 1) % 10 === 0) {
                    await this.saveCache(logoMappings);
                    console.log(`💾 Progress saved: ${i + 1}/${leaguesToProcess.length} leagues processed`);
                }
            }

            // Final save
            await this.saveCache(logoMappings);

            const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
            console.log(`\n✅ Cache build completed in ${elapsed}s`);
            console.log(`📊 Final stats:`);
            console.log(`   - Total leagues: ${logoMappings.stats.totalLeagues}`);
            console.log(`   - Soccer leagues: ${logoMappings.stats.soccerLeagues}`);
            console.log(`   - Processed leagues: ${logoMappings.stats.processedLeagues}`);
            console.log(`   - Total teams: ${logoMappings.stats.totalTeams}`);
            console.log(`   - Failed requests: ${logoMappings.stats.failedRequests}`);

            return logoMappings;

        } catch (error) {
            console.error('❌ Cache build failed:', error);
            throw error;
        }
    }

    private async fetchAllLeagues(): Promise<any[]> {
        const response = await this.makeAPIRequest(`${this.API_BASE}/${this.API_KEY}/all_leagues.php`);
        if (!response.leagues) {
            throw new Error('No leagues data received from API');
        }
        return response.leagues;
    }

    private async fetchLeagueDetails(leagueId: string): Promise<any | null> {
        try {
            const response = await this.makeAPIRequest(
                `${this.API_BASE}/${this.API_KEY}/lookupleague.php?id=${leagueId}`
            );
            return response.leagues?.[0] || null;
        } catch (error) {
            console.error(`    Failed to fetch league details for ID ${leagueId}`);
            return null;
        }
    }

    private async fetchLeagueTeams(leagueId: string): Promise<any[] | null> {
        try {
            const response = await this.makeAPIRequest(
                `${this.API_BASE}/${this.API_KEY}/lookup_all_teams.php?id=${leagueId}`
            );
            return response.teams || [];
        } catch (error) {
            console.error(`    Failed to fetch teams for league ID ${leagueId}`);
            return null;
        }
    }

    private async makeAPIRequest(url: string): Promise<any> {
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                const response = await fetch(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (compatible; FreeSureOdd Logo Cache/1.0)',
                        'Accept': 'application/json, text/plain, */*',
                        'Accept-Language': 'en-US,en;q=0.9',
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const contentType = response.headers.get('content-type');
                if (!contentType || !contentType.includes('application/json')) {
                    throw new Error('Non-JSON response received');
                }

                return await response.json();
            } catch (error) {
                console.error(`    Attempt ${attempt}/${this.maxRetries} failed:`, error);
                if (attempt === this.maxRetries) {
                    throw error;
                }
                // Exponential backoff with longer delays for rate limiting
                await this.delay(this.rateLimit * Math.pow(2, attempt - 1));
            }
        }
    }

    private storeLeagueInfo(logoMappings: LogoMappings, leagueDetail: any): void {
        const leagueInfo: LeagueInfo = {
            id: leagueDetail.idLeague,
            name: leagueDetail.strLeague,
            logo: leagueDetail.strBadge || leagueDetail.strLogo || leagueDetail.strFanart1,
            country: leagueDetail.strCountry,
            alternateNames: this.getLeagueAlternateNames(leagueDetail)
        };

        // Store by primary name and alternates
        logoMappings.leagues[leagueDetail.strLeague] = leagueInfo;
        for (const altName of leagueInfo.alternateNames) {
            if (altName && altName !== leagueDetail.strLeague) {
                logoMappings.leagues[altName] = leagueInfo;
            }
        }
    }

    private storeTeamInfo(logoMappings: LogoMappings, team: any, leagueName: string): void {
        const teamInfo: TeamInfo = {
            id: team.idTeam,
            name: team.strTeam,
            logo: team.strBadge || team.strTeamBadge || team.strTeamLogo,
            league: leagueName,
            country: team.strCountry,
            stadium: team.strStadium,
            alternateNames: this.getTeamAlternateNames(team)
        };

        // Store by primary name and alternates
        logoMappings.teams[team.strTeam] = teamInfo;
        for (const altName of teamInfo.alternateNames) {
            if (altName && altName !== team.strTeam) {
                logoMappings.teams[altName] = teamInfo;
            }
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

        if (team.strKeywords) {
            alternates.push(...team.strKeywords.split(',').map((k: string) => k.trim()));
        }

        return [...new Set(alternates)];
    }

    private async saveCache(logoMappings: LogoMappings): Promise<void> {
        // Save main cache
        await fs.writeFile(this.cacheFile, JSON.stringify(logoMappings, null, 2));

        // Save last fetch info
        await fs.writeFile(
            this.lastFetchFile,
            JSON.stringify({
                timestamp: logoMappings.timestamp,
                leagueCount: Object.keys(logoMappings.leagues).length,
                teamCount: Object.keys(logoMappings.teams).length,
                stats: logoMappings.stats
            }, null, 2)
        );
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// CLI usage
if (require.main === module) {
    // Check for --test flag to limit to 3 leagues
    const isTest = process.argv.includes('--test');
    const builder = new BackgroundCacheBuilder({
        limitLeagues: isTest ? 3 : undefined
    });

    builder.buildCompleteCache()
        .then(() => {
            console.log('🎉 Cache build completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('💥 Cache build failed:', error);
            process.exit(1);
        });
}

export default BackgroundCacheBuilder;
