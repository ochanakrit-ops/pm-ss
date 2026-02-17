const QUEUE_KEY = 'pmss_offline_queue_v1';

function readQueue() {
  try { return JSON.parse(localStorage.getItem(QUEUE_KEY) || '[]'); } catch { return []; }
}
function writeQueue(items) {
  localStorage.setItem(QUEUE_KEY, JSON.stringify(items.slice(0, 200)));
}

export function getQueueSize() {
  return readQueue().length;
}

export async function syncOfflineQueue() {
  if (!navigator.onLine) return { ok: false, reason: 'offline' };
  const items = readQueue();
  if (!items.length) return { ok: true, synced: 0 };

  let synced = 0;
  const remain = [];

  for (const item of items) {
    try {
      // Rebuild headers with current token at sync time
      const token = localStorage.getItem('pmss_token');
      const headers = {
        'Content-Type': 'application/json',
        ...(item.headers || {}),
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(item.path, {
        method: item.method,
        headers,
        body: item.body ? JSON.stringify(item.body) : undefined,
      });

      if (!res.ok) throw new Error('sync failed');
      synced += 1;
    } catch {
      remain.push(item);
    }
  }

  writeQueue(remain);
  return { ok: true, synced, remaining: remain.length };
}

export async function apiFetch(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const token = localStorage.getItem('pmss_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  // Offline queue for non-GET (except auth login)
  if (!navigator.onLine && method !== 'GET' && !path.includes('/api/auth/login')) {
    const queue = readQueue();
    let bodyObj = null;
    try { bodyObj = options.body ? JSON.parse(options.body) : null; } catch { bodyObj = options.body || null; }

    queue.push({
      path,
      method,
      headers: {}, // do not store auth
      body: bodyObj,
      ts: Date.now(),
    });
    writeQueue(queue);
    return { queued: true };
  }

  const res = await fetch(path, { ...options, method, headers });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const msg = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}