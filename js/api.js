// Klien REST: POST text/plain (anti-preflight CORS), dedup in-flight, cache SWR, batch.
const Api = (() => {
  const TK = 'jm_token', inflight = {}, cache = {};
  let epoch = 0;
  const token = () => localStorage.getItem(TK) || '';
  async function raw(action, data) {
    try {
      const r = await fetch(APP_CONFIG.GAS_URL, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action, data: data || {}, token: token() }) });
      const j = await r.json();
      if (j.code === 'AUTH' && action !== 'login') { localStorage.removeItem(TK); location.reload(); }
      return j;
    } catch (e) { return { success: false, message: 'Tidak bisa terhubung ke server. Periksa koneksi.' }; }
  }
  // Baca: tampilkan cache lebih dulu (cb(data,true)), lalu data segar (cb(data,false))
  function read(action, data, cb) {
    const k = epoch + '|' + action + '|' + JSON.stringify(data || {});
    if (cache[k] && cb) cb(cache[k], true);
    const p = inflight[k] || (inflight[k] = raw(action, data).finally(() => delete inflight[k]));
    return p.then(r => { if (r.success) cache[k] = r; if (cb) cb(r, false); return r; });
  }
  // Tulis: kosongkan cache agar data berikutnya selalu segar
  async function write(action, data) { epoch++; Object.keys(cache).forEach(k => delete cache[k]); return raw(action, data); }
  const batch = (calls, cb) => read('batch', { calls: calls.map(c => ({ action: c[0], data: c[1] || {} })) }, cb);
  async function login(u, p) {
    const r = await raw('login', { username: u, password: p });
    if (r.success) localStorage.setItem(TK, r.data.token);
    return r;
  }
  return { raw, read, write, batch, login, has: () => !!token(), logout: async () => { await raw('logout'); localStorage.removeItem(TK); location.reload(); } };
})();
