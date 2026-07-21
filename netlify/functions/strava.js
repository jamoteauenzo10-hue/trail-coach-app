export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée." }) };
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Identifiants Strava absents côté serveur (STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET)." }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON invalide." }) };
  }

  const { action } = payload;

  try {
    if (action === "exchange") {
      const { code } = payload;
      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, code, grant_type: "authorization_code" }),
      });
      const data = await r.json();
      return { statusCode: r.status, body: JSON.stringify(data) };
    }

    if (action === "refresh") {
      const { refresh_token } = payload;
      const r = await fetch("https://www.strava.com/oauth/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: clientId, client_secret: clientSecret, refresh_token, grant_type: "refresh_token" }),
      });
      const data = await r.json();
      return { statusCode: r.status, body: JSON.stringify(data) };
    }

    if (action === "activities") {
      const { access_token, per_page } = payload;
      const r = await fetch(`https://www.strava.com/api/v3/athlete/activities?per_page=${per_page || 10}`, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      const data = await r.json();
      return { statusCode: r.status, body: JSON.stringify(data) };
    }

    return { statusCode: 400, body: JSON.stringify({ error: "Action inconnue." }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: "Erreur lors de l'appel à l'API Strava." }) };
  }
}
