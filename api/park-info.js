// Vercel Serverless Function: NPS Park Info
// Fetches park details (hours, contacts, alerts) for a single park.
// Endpoint: GET /api/park-info?parkCode=yose

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200'); // 1 hr cache

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { parkCode } = req.query;

  if (!parkCode) {
    return res.status(400).json({ error: 'parkCode query parameter required' });
  }

  const apiKey = process.env.NPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NPS_API_KEY not configured' });
  }

  try {
    // Parallel fetch: park details + alerts
    const [parkResp, alertsResp] = await Promise.all([
      fetch(`https://developer.nps.gov/api/v1/parks?parkCode=${parkCode}&api_key=${apiKey}`),
      fetch(`https://developer.nps.gov/api/v1/alerts?parkCode=${parkCode}&limit=20&api_key=${apiKey}`),
    ]);

    if (!parkResp.ok) throw new Error(`Parks API returned ${parkResp.status}`);
    if (!alertsResp.ok) throw new Error(`Alerts API returned ${alertsResp.status}`);

    const [parkData, alertsData] = await Promise.all([parkResp.json(), alertsResp.json()]);

    const park = (parkData.data || [])[0];
    if (!park) {
      return res.status(404).json({ error: `Park not found: ${parkCode}` });
    }

    // Extract operating hours
    const hours = (park.operatingHours || []).map(oh => ({
      name: oh.name,
      description: oh.description,
      standardHours: oh.standardHours,
      exceptions: (oh.exceptions || []).slice(0, 5).map(ex => ({
        name: ex.exceptionHours ? ex.name : ex.name,
        startDate: ex.startDate,
        endDate: ex.endDate,
      })),
    }));

    // Simplify alerts
    const alerts = (alertsData.data || []).map(a => ({
      id: a.id,
      title: a.title,
      description: a.description,
      category: a.category,
      url: a.url,
    }));

    return res.status(200).json({
      parkCode,
      name: park.fullName,
      url: park.url,
      hours,
      alerts,
      entranceFees: (park.entranceFees || []).map(f => ({
        cost: f.cost,
        description: f.description,
        title: f.title,
      })),
      contacts: {
        phone: (park.contacts?.phoneNumbers || []).find(p => p.type === 'Voice')?.phoneNumber || null,
        email: (park.contacts?.emailAddresses || [])[0]?.emailAddress || null,
      },
      fetchedAt: new Date().toISOString(),
    });

  } catch (err) {
    console.error('NPS API error:', err);
    return res.status(502).json({ error: 'Failed to fetch from NPS API', detail: err.message });
  }
}
