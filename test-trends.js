import fetch from 'node-fetch';

async function testTrends() {
    const keyword = 'dentist';
    const geo = 'US-FL';
    const url = `http://localhost:3001/api/trends?keyword=${keyword}&geo=${geo}`;

    console.log(`Testing URL: ${url}`);

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        console.log('Response status:', response.status);

        if (data.default && data.default.timelineData) {
            console.log(`Received ${data.default.timelineData.length} data points.`);
            if (data.default.timelineData.length > 0) {
                console.log('First data point:', JSON.stringify(data.default.timelineData[0], null, 2));
                console.log('Last data point:', JSON.stringify(data.default.timelineData[data.default.timelineData.length - 1], null, 2));
            } else {
                console.warn('WARNING: timelineData is empty!');
            }
        } else {
            console.error('ERROR: Unexpected response structure:', JSON.stringify(data, null, 2));
        }

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testTrends();
