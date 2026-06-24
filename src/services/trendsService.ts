export interface TrendData {
    keyword: string;
    trend: 'rising' | 'falling' | 'stable';
    relativeVolume: number; // 0-100
    trendIndicator: '↑' | '↓' | '→';
    trendColor: string;
}

/**
 * Get trend data for multiple keywords
 * @param keywords Array of keywords to analyze
 * @param location Geographic location (e.g., "US-FL" for Florida)
 * @returns Array of trend data for each keyword
 */
export const getKeywordTrends = async (
    keywords: string[],
    location: string = 'US'
): Promise<TrendData[]> => {
    try {
        // Convert location to geo code (e.g., "Miami, FL" -> "US-FL")
        const geo = convertLocationToGeo(location);

        const trendPromises = keywords.slice(0, 5).map(async (keyword) => {
            try {
                // Fetch from our backend proxy
                const response = await fetch(`/api/trends?keyword=${encodeURIComponent(keyword)}&geo=${geo}`);

                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }

                const data = await response.json();
                const timelineData = data.default?.timelineData || [];

                if (timelineData.length === 0) {
                    return createDefaultTrendData(keyword);
                }

                // Calculate trend direction
                const values = timelineData.map((item: any) => item.value[0]);
                const recentValues = values.slice(-4); // Last 4 weeks
                const olderValues = values.slice(0, 4); // First 4 weeks

                const recentAvg = recentValues.reduce((a: number, b: number) => a + b, 0) / recentValues.length;
                const olderAvg = olderValues.reduce((a: number, b: number) => a + b, 0) / olderValues.length;

                const maxValue = Math.max(...values);
                const relativeVolume = maxValue;

                let trend: 'rising' | 'falling' | 'stable';
                let trendIndicator: '↑' | '↓' | '→';
                let trendColor: string;

                const percentChange = ((recentAvg - olderAvg) / olderAvg) * 100;

                if (percentChange > 10) {
                    trend = 'rising';
                    trendIndicator = '↑';
                    trendColor = '#10b981'; // green
                } else if (percentChange < -10) {
                    trend = 'falling';
                    trendIndicator = '↓';
                    trendColor = '#ef4444'; // red
                } else {
                    trend = 'stable';
                    trendIndicator = '→';
                    trendColor = '#6b7280'; // gray
                }

                return {
                    keyword,
                    trend,
                    relativeVolume,
                    trendIndicator,
                    trendColor,
                };
            } catch (error) {
                console.error(`Error fetching trend for "${keyword}":`, error);
                return createDefaultTrendData(keyword);
            }
        });

        return await Promise.all(trendPromises);
    } catch (error) {
        console.error('Error in getKeywordTrends:', error);
        return keywords.map(createDefaultTrendData);
    }
};

/**
 * Convert location string to Google Trends geo code
 */
function convertLocationToGeo(location: string): string {
    const locationLower = location.toLowerCase();

    // US States
    const stateMap: { [key: string]: string } = {
        'florida': 'US-FL',
        'fl': 'US-FL',
        'california': 'US-CA',
        'ca': 'US-CA',
        'new york': 'US-NY',
        'ny': 'US-NY',
        'texas': 'US-TX',
        'tx': 'US-TX',
        // Add more states as needed
    };

    // Check if location contains a state
    for (const [state, code] of Object.entries(stateMap)) {
        if (locationLower.includes(state)) {
            return code;
        }
    }

    // Default to US
    return 'US';
}

/**
 * Create default trend data when API fails
 */
function createDefaultTrendData(keyword: string): TrendData {
    return {
        keyword,
        trend: 'stable',
        relativeVolume: 50,
        trendIndicator: '→',
        trendColor: '#6b7280',
    };
}
