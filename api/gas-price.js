/**
 * Vercel serverless: scrape AAA national regular average (no API key).
 * GET /api/gas-price → { price, asOf, source, fuel, fetchedAt }
 */
const AAA_URL = "https://gasprices.aaa.com/";
const UA = "Mozilla/5.0 (compatible; PumpPolitics/1.0; +vercel)";

async function fetchAaa() {
  const res = await fetch(AAA_URL, {
    headers: { "User-Agent": UA, Accept: "text/html" },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`AAA HTTP ${res.status}`);
  const html = await res.text();
  let m = html.match(/National Average\s*\$([0-9]+(?:\.[0-9]+)?)/i);
  if (!m) m = html.match(/Current Avg\.\s*\$([0-9]+(?:\.[0-9]+)?)/i);
  if (!m) throw new Error("Could not parse AAA national average");
  const price = parseFloat(m[1]);
  if (!Number.isFinite(price) || price < 0.5 || price > 20) {
    throw new Error("Parsed AAA price out of range");
  }
  const d = html.match(/Price as of\s*([^<\n]+)/i);
  const asOf = d ? d[1].trim() : null;
  return {
    price,
    asOf,
    source: "AAA",
    fuel: "US regular national average",
    fetchedAt: new Date().toISOString(),
  };
}

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Cache-Control", "no-store");
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    return res.status(204).end();
  }
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  try {
    const data = await fetchAaa();
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message || String(err) });
  }
};
