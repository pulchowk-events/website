// app/lib/og-scraper.ts
//
// Server-only helper. Given a URL, returns the best image URL to display:
//   1. If the URL is directly an image (extension or Content-Type), use it as-is.
//   2. Otherwise, fetch the HTML page and extract og:image / twitter:image.
//
// Returns null on any failure — the post should still submit successfully
// without an image.

const FETCH_TIMEOUT_MS = 5000;
const USER_AGENT =
  "Mozilla/5.0 (compatible; PulchowkEventsBot/1.0; +https://pulchowkevents.com)";

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|avif|svg|bmp|ico)(\?.*)?$/i;

function isSafeUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
      return false;

    const host = parsed.hostname.toLowerCase();

    if (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "0.0.0.0" ||
      host === "::1" ||
      host === "[::1]" ||
      host === "169.254.169.254"
    ) {
      return false;
    }

    if (host.endsWith(".local") || host.endsWith(".internal")) return false;

    const parts = host.split(".");
    if (parts.length === 4 && parts.every((p) => /^\d+$/.test(p))) {
      const [a, b] = parts.map(Number);
      if (a === 10) return false;
      if (a === 192 && b === 168) return false;
      if (a === 172 && b >= 16 && b <= 31) return false;
    }

    return true;
  } catch {
    return false;
  }
}

function looksLikeImageUrl(url: string): boolean {
  try {
    const path = new URL(url).pathname;
    return IMAGE_EXTENSIONS.test(path);
  } catch {
    return false;
  }
}

async function checkContentTypeIsImage(url: string): Promise<boolean> {
  if (!isSafeUrl(url)) return false;
  try {
    // HEAD first — cheap, no body transferred
    let res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    // Some servers reject HEAD; retry with GET but don't read the body
    if (res.status === 405 || res.status === 501) {
      res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        redirect: "follow",
      });
      // Don't consume the body — just check the header
      res.body?.cancel();
    }

    const ct = res.headers.get("content-type") || "";
    return ct.toLowerCase().startsWith("image/");
  } catch {
    return false;
  }
}

function normalizeImageUrl(rawImg: string, pageUrl: string): string | null {
  try {
    const resolved = new URL(rawImg.trim(), pageUrl);
    if (resolved.protocol !== "http:" && resolved.protocol !== "https:")
      return null;
    return resolved.toString();
  } catch {
    return null;
  }
}

export async function extractOgImage(url: string): Promise<string | null> {
  if (!url || !isSafeUrl(url)) return null;

  // 1. Direct image URL by extension — use it as-is, zero network cost.
  if (looksLikeImageUrl(url)) {
    return url;
  }

  // 2. Direct image URL without extension — ask the server.
  //    (e.g. CDN URLs like https://cdn.example.com/abc123 that return
  //    Content-Type: image/jpeg with no extension in the path.)
  if (await checkContentTypeIsImage(url)) {
    return url;
  }

  // 3. Otherwise, treat as an HTML page and scrape og:image / twitter:image.
  try {
    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      redirect: "follow",
    });

    if (!res.ok) return null;

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("text/html")) return null;

    // Cap read at 500KB to avoid loading huge HTML files
    const reader = res.body?.getReader();
    if (!reader) return null;

    let html = "";
    let totalBytes = 0;
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > 500_000) {
        await reader.cancel();
        break;
      }
      html += decoder.decode(value, { stream: true });
    }
    html += decoder.decode();

    // Try og:image (property or name attribute, either order)
    const og =
      html.match(
        /<meta[^>]+property=["']og:image(?::secure_url)?["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image(?::secure_url)?["']/i,
      );
    if (og?.[1]) return normalizeImageUrl(og[1], url);

    // Fall back to twitter:image
    const twitter =
      html.match(
        /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
      ) ||
      html.match(
        /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["']/i,
      );
    if (twitter?.[1]) return normalizeImageUrl(twitter[1], url);

    return null;
  } catch (err) {
    // Timeout, DNS failure, TLS error, blocked by robots — all fall through
    console.warn(
      "[og-scraper] Failed to extract image from",
      url,
      err instanceof Error ? err.message : err,
    );
    return null;
  }
}
