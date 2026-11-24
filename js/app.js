// Kerangka aplikasi: login, shell (sidebar / navigasi bawah), router hash, tema.
const App = {
  user: null, wilayah: [], kategori: [],
  wilayahOpts(level) {   // opsi berindentasi menurut tingkat
    const anak = {}; this.wilayah.forEach(w => (anak[w.parent_id || ''] = anak[w.parent_id || ''] || []).push(w));
    const out = [], jalan = (p, d) => (anak[p] || []).slice().sort((a, b) => a.nama.localeCompare(b.nama)).forEach(w => { if (!level || w.level === level) out.push({ v: w.id, t: '\u00a0\u00a0'.repeat(d) + w.nama }); jalan(w.id, d + 1); });
    const ids = new Set(this.wilayah.map(w => w.id));
    [...new Set(this.wilayah.filter(w => !ids.has(w.parent_id)).map(w => w.parent_id || ''))].forEach(p => jalan(p, 0)); return out;
  },
  async init() {
    tema();
    if (!/^https:\/\/script\.google\.com\//.test(APP_CONFIG.GAS_URL)) return this.pesan('Isi GAS_URL di js/config.js dengan URL /exec dari Deploy Web App.');
    if (!Api.has()) return this.login();
    const r = await Api.raw('me'); if (!r.success) return this.login();
    this.user = r.data; await this.boot();
  },
  pesan(t) { document.getElementById('app').replaceChildren(h('div', { class: 'boot' }, t)); },
  login() {
    const u = h('input', { type: 'text', autocomplete: 'username', required: true }), p = h('input', { type: 'password', autocomplete: 'current-password', required: true }), eb = h('div', { class: 'err' });
    const btn = h('button', { class: 'btn primary block', type: 'submit' }, 'Masuk');
    const go = async e => { e.preventDefault(); eb.textContent = ''; btn.disabled = true; btn.textContent = 'Masuk…';
      const r = await Api.login(u.value, p.value);
      if (!r.success) { eb.textContent = r.message; btn.disabled = false; btn.textContent = 'Masuk'; return; }
      this.user = r.data.user; await this.boot(); };
    document.getElementById('app').replaceChildren(h('div', { class: 'loginwrap' }, h('form', { class: 'card login', onsubmit: go },
      h('h1', {}, 'JM & Generus Digital'), h('p', { class: 'muted' }, '4S Digital · Keputrian Digital · PPG Purwodadi'),
      h('label', {}, h('span', {}, 'Email / nama pengguna'), u), h('label', {}, h('span', {}, 'Kata sandi'), p), eb, btn)));
  },
  async boot() {
    const r = await Api.batch([['listWilayah'], ['listKategori']]);
    this.wilayah = (r.data && r.data[0] && r.data[0].data) || []; this.kategori = (r.data && r.data[1] && r.data[1].data) || [];
    this.shell(); window.addEventListener('hashchange', () => this.route()); this.route();
  },
  nav() {
    const ada = k => this.user.menu.includes(k);
    return [['dashboard', 'Dashboard', ada('dashboard')], ['orang', 'Data Orang & KK', ada('orang')], ['dapukan', 'Dapukan', ada('dapukan')], ['absensi', 'Absensi Kegiatan', ada('absensi')],
      ['musyawarah', 'Musyawarah', ada('musyawarah')], ['laporan', 'Checklist & Laporan', ada('laporan')], ['dhuafa', 'Dhuafa & Kematian', ada('dhuafa') || ada('kematian')],
      ['pengaturan', 'Pengaturan & Audit', ada('pengaturan') || ada('audit')], ['gemini', 'Asisten AI', ada('gemini')]].filter(x => x[2]);
  },
  shell() {
    const items = this.nav(), side = h('nav', { class: 'side', id: 'side' }, h('div', { class: 'brand' }, 'JM & Generus', h('small', {}, 'Digital')),
      items.map(([id, t]) => h('a', { href: '#/' + id, 'data-id': id, onclick: () => side.classList.remove('open') }, ic(id), t)));
    const bottom = h('nav', { class: 'bottom' }, ['dashboard', 'orang', 'absensi', 'laporan'].filter(i => items.some(x => x[0] === i)).map(id => h('a', { href: '#/' + id, 'data-id': id }, ic(id), items.find(x => x[0] === id)[1].split(' ')[0])),
      h('a', { href: '#', onclick: e => { e.preventDefault(); side.classList.toggle('open'); } }, ic('menu'), 'Menu'));
    const top = h('header', { class: 'top' }, h('span', { class: 'sp' }), h('button', { class: 'btn ghost sm', 'aria-label': 'Ganti tema', onclick: () => tema(true) }, ic('sun')),
      h('div', { class: 'who' }, h('b', {}, this.user.nama), h('small', {}, this.user.darurat ? 'Akses darurat' : (this.user.roles[0] || {}).role || '')), h('button', { class: 'btn sm', onclick: () => Api.logout() }, 'Keluar'));
    this.main = h('main', { id: 'main', tabindex: '-1' });
    document.getElementById('app').replaceChildren(h('div', { class: 'shell' }, side, h('div', { class: 'col' }, top, this.main), bottom));
  },
  route() {
    const id = (location.hash.replace('#/', '') || this.nav()[0][0]).split('?')[0];
    document.querySelectorAll('[data-id]').forEach(a => a.classList.toggle('on', a.dataset.id === id));
    this.main.replaceChildren(); const fn = Pages[id];
    fn ? fn(this.main) : this.main.append(h('div', { class: 'card' }, h('h2', {}, 'Segera hadir'), h('p', { class: 'muted' }, 'Halaman ini dibuat di Bagian 5B.')));
    this.main.focus({ preventScroll: true }); scrollTo(0, 0);
  }
};
function tema(toggle) {
  let t = localStorage.getItem('jm_tema') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  if (toggle) { t = t === 'dark' ? 'light' : 'dark'; localStorage.setItem('jm_tema', t); }
  document.documentElement.dataset.theme = t;
}
App.init();
