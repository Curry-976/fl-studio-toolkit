// ══════════════════════════════════════════════════════════════
//  Edge Function: getsong-proxy
//  Proxy GetSongBPM / GetSongKey API calls to avoid CORS
//
//  Secret requis :
//    GETSONG_API_KEY=134a169c438523287e75ddaf66268b22
// ══════════════════════════════════════════════════════════════

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    const url  = new URL(req.url);
    const type = url.searchParams.get("type") || "search"; // "search" | "song"
    const lookup = url.searchParams.get("lookup") || "";
    const id     = url.searchParams.get("id")     || "";

    const apiKey = Deno.env.get("GETSONG_API_KEY");
    if (!apiKey) throw new Error("GETSONG_API_KEY secret not set");

    let apiUrl: string;
    if (type === "song" && id) {
      apiUrl = `https://api.getsong.co/song/?api_key=${apiKey}&id=${encodeURIComponent(id)}`;
    } else if (lookup) {
      apiUrl = `https://api.getsong.co/search/?api_key=${apiKey}&type=song&lookup=${encodeURIComponent(lookup)}`;
    } else {
      throw new Error("Missing parameter: provide 'lookup' for search or 'id' for song detail");
    }

    const upstream = await fetch(apiUrl, {
      headers: { "User-Agent": "MayanaBeat/1.0" },
    });

    if (!upstream.ok) {
      throw new Error(`GetSong API returned HTTP ${upstream.status}`);
    }

    const data = await upstream.json();

    return new Response(JSON.stringify(data), {
      headers: { ...CORS, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("[getsong-proxy]", err.message);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 400,
      headers: { ...CORS, "Content-Type": "application/json" },
    });
  }
});
