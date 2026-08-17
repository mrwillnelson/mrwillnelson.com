const BEEHIIV_API_BASE = "https://api.beehiiv.com/v2";
const NOINDEX_HEADER = "noindex, nofollow, noarchive";
const WILLS_BRAND_PRIVATE_ASSET = "/_private/wills-brand";

const json = (body, init = {}) =>
  Response.json(body, {
    ...init,
    headers: {
      "Cache-Control": "no-store",
      ...(init.headers || {}),
    },
  });

const isValidEmail = (value) =>
  typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const assetRequest = (request, pathname) => {
  const url = new URL(request.url);
  url.pathname = pathname;
  return new Request(url, request);
};

const noindexAssetResponse = async (request, env, pathname) => {
  const response = await env.ASSETS.fetch(assetRequest(request, pathname));
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", NOINDEX_HEADER);
  headers.set("Cache-Control", "no-store");
  headers.set("Content-Type", "text/html; charset=utf-8");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};

const privateNotFound = () =>
  new Response("Not found", {
    status: 404,
    headers: {
      "Cache-Control": "no-store",
      "X-Robots-Tag": NOINDEX_HEADER,
    },
  });

const beehiivFetch = (env, path, init = {}) =>
  fetch(`${BEEHIIV_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${env.BEEHIIV_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });

const getPublicationId = async (env) => {
  if (env.BEEHIIV_PUBLICATION_ID) {
    return env.BEEHIIV_PUBLICATION_ID;
  }

  const response = await beehiivFetch(env, "/publications?limit=1");
  if (!response.ok) {
    throw new Error("Unable to read Beehiiv publications.");
  }

  const payload = await response.json();
  const publicationId = payload?.data?.[0]?.id;
  if (!publicationId) {
    throw new Error("No Beehiiv publication found for this API key.");
  }

  return publicationId;
};

const subscribe = async (request, env) => {
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid signup request." }, { status: 400 });
  }

  const email = String(body.email || "").trim().toLowerCase();
  if (!isValidEmail(email)) {
    return json({ ok: false, message: "Enter a valid email address." }, { status: 400 });
  }

  if (!env.BEEHIIV_KEY) {
    return json({ ok: false, message: "Signup is not configured yet." }, { status: 503 });
  }

  try {
    const publicationId = await getPublicationId(env);
    const response = await beehiivFetch(env, `/publications/${publicationId}/subscriptions`, {
      method: "POST",
      body: JSON.stringify({
        email,
        reactivate_existing: false,
        send_welcome_email: true,
        utm_source: "mrwillnelson.com",
        utm_medium: "website",
        utm_campaign: "landing_page",
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      console.error(
        JSON.stringify({
          event: "beehiiv_subscribe_failed",
          status: response.status,
          error: errorPayload?.message || errorPayload?.error || "unknown",
        }),
      );
      return json({ ok: false, message: "Could not subscribe right now." }, { status: 502 });
    }

    return json({ ok: true });
  } catch (error) {
    console.error(
      JSON.stringify({
        event: "beehiiv_subscribe_error",
        error: error.message,
      }),
    );
    return json({ ok: false, message: "Could not subscribe right now." }, { status: 502 });
  }
};

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/health") {
      return Response.json({ ok: true });
    }

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname === "/talkstories") {
      return env.ASSETS.fetch(assetRequest(request, "/talkstories/index.html"));
    }

    if (
      (request.method === "GET" || request.method === "HEAD") &&
      (url.pathname === "/wills-brand" || url.pathname === "/wills-brand/")
    ) {
      return noindexAssetResponse(request, env, WILLS_BRAND_PRIVATE_ASSET);
    }

    if ((request.method === "GET" || request.method === "HEAD") && url.pathname.startsWith("/_private/")) {
      return privateNotFound();
    }

    if (url.pathname === "/api/subscribe" && request.method === "POST") {
      return subscribe(request, env);
    }

    if (url.pathname === "/api/subscribe") {
      return json({ ok: false, message: "Method not allowed." }, { status: 405 });
    }

    return env.ASSETS.fetch(request);
  },
};
