export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('pmss_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(path, { ...options, headers });
  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);
  if (!res.ok) {
    const msg = (data && data.message) || `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return data;
}
