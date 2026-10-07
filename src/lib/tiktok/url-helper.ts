/**
 * Helper to extract TikTok publication / post ID (aweme_id) from any TikTok link format:
 * - Videos: https://www.tiktok.com/@user/video/7688922876799503668
 * - Photos / Carousels: https://www.tiktok.com/@user/photo/7688922876799503668
 * - Posts: https://www.tiktok.com/@user/post/7688922876799503668
 * - Short links: https://vt.tiktok.com/ZS.../ or https://vm.tiktok.com/.../ or https://www.tiktok.com/t/.../
 * - Query params: ?item_id=... or ?aweme_id=...
 */
export async function extractTikTokPostId(rawUrl: string): Promise<{ postId: string | null; resolvedUrl: string }> {
  if (!rawUrl || typeof rawUrl !== 'string') {
    return { postId: null, resolvedUrl: rawUrl };
  }

  const cleanUrl = rawUrl.trim();

  // 1. Direct regex for /video/ID, /photo/ID, /post/ID
  const directMatch = cleanUrl.match(/\/(?:video|photo|post)\/(\d+)/i);
  if (directMatch && directMatch[1]) {
    return { postId: directMatch[1], resolvedUrl: cleanUrl };
  }

  // 2. Query param aweme_id or item_id
  const queryMatch = cleanUrl.match(/[?&](?:aweme_id|item_id)=(\d+)/i);
  if (queryMatch && queryMatch[1]) {
    return { postId: queryMatch[1], resolvedUrl: cleanUrl };
  }

  // 3. Fallback: Any 15-22 consecutive digits in the URL path
  const digitsMatch = cleanUrl.match(/\/(\d{15,22})(?:\/|\?|$)/);
  if (digitsMatch && digitsMatch[1]) {
    return { postId: digitsMatch[1], resolvedUrl: cleanUrl };
  }

  // 4. Short-link resolution (vt.tiktok.com, vm.tiktok.com, tiktok.com/t/...)
  if (cleanUrl.includes('tiktok.com')) {
    try {
      const res = await fetch(cleanUrl, {
        method: 'HEAD',
        redirect: 'follow',
        headers: {
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
      });

      const finalUrl = res.url || cleanUrl;
      const finalMatch =
        finalUrl.match(/\/(?:video|photo|post)\/(\d+)/i) ||
        finalUrl.match(/[?&](?:aweme_id|item_id)=(\d+)/i) ||
        finalUrl.match(/\/(\d{15,22})(?:\/|\?|$)/);

      if (finalMatch && finalMatch[1]) {
        return { postId: finalMatch[1], resolvedUrl: finalUrl };
      }
    } catch (err) {
      console.warn('Advertencia al resolver enlace corto de TikTok:', err);
    }
  }

  return { postId: null, resolvedUrl: cleanUrl };
}
