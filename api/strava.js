export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Méthode non autorisée." });
    return;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    res.status(500).json({ error: "Identifiants Strava absents côté serveur (STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET)." });
    return;
  }

  const { action } = req.body || {};

  try {
    if (action === "exchange") {
      const { code } = req.body;
      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code" }),
      });
      const data = await r.json();
      res.status(r.status).json(data);
      return;
    }

    if (action === "refresh") {
      const { refresh_token } = req.body;
      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, refresh_token, grant_type: "refresh_token" }),
      });
      const data = await r.json();
      res.status(r.status).json(data);
      return;
    }

    if (action === "activities") {
      const { access_token, per_page } = req.body;
      const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${per_page || 10}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const data = await r.json();
      res.status(r.status).json(data);
      return;
    }

    res.status(400).json({ error: "Action inconnue." });
  } catch (e) {
    res.status(500).json({ error: "Erreur lors de l'appel à l'API Strava." });
  }
}
