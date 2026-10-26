'use client';

import { useEffect } from 'react';

// Matches URLs that are almost certainly OAuth-provider avatars.
// When one of these breaks (user changed their pic, CDN rotated, etc.),
// we swap to our local default instead of showing a broken image icon.
const AVATAR_URL_PATTERNS = [
  /googleusercontent\.com/i,
  /cdn\.discordapp\.com/i,
  /avatars\.githubusercontent\.com/i,
  /pbs\.twimg\.com/i,
  /gravatar\.com/i,
];

const DEFAULT_AVATAR = '/default-avatar.png';

function looksLikeAvatarUrl(url: string): boolean {
  return AVATAR_URL_PATTERNS.some((re) => re.test(url));
}

export default function GlobalImageFallback() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleImageError = (event: Event) => {
      const target = event.target;
      if (!(target instanceof HTMLImageElement)) return;

      const img = target;

      // Respect opt-outs — components that manage their own fallback
      // (e.g. PostCard hides broken embed images) can set this attribute.
      if (img.dataset.noImageFallback === 'true') return;

      // Prevent infinite loop if the fallback itself fails to load.
      if (img.dataset.fallbackFailed === 'true') {
        img.style.display = 'none';
        return;
      }

      // Explicit fallback via data attribute — highest priority
      const explicitFallback = img.dataset.imageFallback;
      if (explicitFallback) {
        // If we're already showing the fallback and it broke, give up.
        const fallbackAbs = new URL(explicitFallback, window.location.origin).href;
        if (img.src === fallbackAbs) {
          img.dataset.fallbackFailed = 'true';
          img.style.display = 'none';
          return;
        }
        img.src = explicitFallback;
        return;
      }

      // Heuristic: is this an OAuth avatar URL?
      if (looksLikeAvatarUrl(img.src)) {
        const fallbackAbs = new URL(DEFAULT_AVATAR, window.location.origin).href;
        if (img.src === fallbackAbs) {
          // Default itself failed — hide
          img.dataset.fallbackFailed = 'true';
          img.style.display = 'none';
          return;
        }
        img.src = DEFAULT_AVATAR;
        return;
      }

      // Unknown broken image (product, event, etc.) — hide instead of
      // showing a wrong default. The surrounding layout usually
      // handles this gracefully already.
      img.style.display = 'none';
    };

    // `true` = capture phase. Required because `error` does not bubble.
    document.addEventListener('error', handleImageError, true);

    return () => {
      document.removeEventListener('error', handleImageError, true);
    };
  }, []);

  return null;
}