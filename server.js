import express from 'express';
import cors from 'cors';
import googleTrends from 'google-trends-api';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/api/trends', async (req, res) => {
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

        res.json(JSON.parse(result));
    } catch (error) {
        console.error('Error fetching trends:', error);
        res.status(500).json({ error: 'Failed to fetch trend data' });
    }
});

app.listen(port, () => {
    console.log(`Trends server running at http://localhost:${port}`);
});
