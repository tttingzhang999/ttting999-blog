// A failed or uncertain count is deliberately never retried.
export function loadArticleViews(slug: string, getStorage: () => Pick<Storage, 'getItem' | 'setItem'> = () => window.sessionStorage) {
  let method = 'GET';
  try {
    const storage = getStorage();
    const key = `article-view-attempted:${slug}`;
    if (storage.getItem(key) === null) {
      storage.setItem(key, '1');
      method = 'POST';
    }
  } catch {
    // Storage denial means read only; do not risk an undeduplicated write.
    method = 'GET';
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 3000);
  const cancel = () => { clearTimeout(timer); controller.abort(); };
  const result = (async (): Promise<number | null> => {
    try {
      const response = await fetch(method === 'POST' ? '/api/views' : `/api/views?slug=${encodeURIComponent(slug)}`, {
        method,
        signal: controller.signal,
        credentials: 'omit',
        cache: 'no-store',
        ...(method === 'POST' ? { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug }) } : {}),
      });
      if (!response.ok) return null;
      const payload = await response.json();
      if (controller.signal.aborted || !payload || typeof payload !== 'object' || Array.isArray(payload)
        || Object.keys(payload).sort().join(',') !== 'data,error,success'
        || payload.success !== true || payload.error !== null
        || !payload.data || typeof payload.data !== 'object' || Array.isArray(payload.data)
        || Object.keys(payload.data).sort().join(',') !== 'slug,views'
        || payload.data.slug !== slug || !Number.isSafeInteger(payload.data.views) || payload.data.views < 0) return null;
      return payload.data.views;
    } catch {
      // Optional UI stays hidden for transport, quota, JSON and abort failures.
      return null;
    } finally {
      clearTimeout(timer);
    }
  })();
  return { result, cancel };
}
