// Vercel Serverless Function: NPS Alerts Proxy
// Proxies requests to the NPS API, keeping the API key server-side.
// Endpoint: GET /api/alerts?parkCode=yose,acad,grsm
// Returns alerts for the specified parks.

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=1800, stale-while-revalidate=3600'); // 30 min cache

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { parkCode } = req.query;

  if (!parkCode) {
    return res.status(400).json({ error: 'parkCode query parameter required (comma-separated, e.g. yose,acad)' });
  }

  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NPS_API_KEY not configured' });
  }

  try {
    // Fetch alerts for the specified parks
    const alertsUrl = `https://developer.nps.gov/api/v1/alerts?parkCode=${parkCode}&limit=100&api_key=${apiKey}`;
    const alertsResp = await fetch(alertsUrl);

    if (!alertsResp.ok) {
      throw new Error(`NPS API returned ${alertsResp.status}`);
    }

    const alertsData = await alertsResp.json();

    // Simplify and return only relevant fields
    const alerts = (alertsData.data || []).map(alert => ({
      id: alert.id,
      parkCode: alert.parkCode,
      title: alert.title,
      description: alert.description,
      category: alert.category, // "Danger", "Caution", "Information", "Park Closure"
      url: alert.url,
      lastIndexedDate: alert.lastIndexedDate,
    }));

    return res.status(200).json({
      total: alerts.length,
      alerts,
      fetchedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('NPS API error:', err);
    return res.status(502).json({ error: 'Failed to fetch from NPS API', detail: err.message });
  }
}
