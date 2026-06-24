import googleTrends from 'google-trends-api';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // Handle OPTIONS request
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const { keyword, geo } = req.query;

        if (!keyword) {
            return res.status(400).json({ error: 'Keyword is required' });
        }

        console.log(`Fetching trends for: ${keyword} (${geo || 'US'})`);

        const result = await googleTrends.interestOverTime({
            keyword: keyword,
            startTime: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
            endTime: new Date(),
            geo: geo || 'US',
        });

        res.status(200).json(JSON.parse(result));
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
}
