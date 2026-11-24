// Toolkit UI kecil: elemen, ikon, toast, modal, form, CSV.
const h = (t, a, ...c) => {
  const e = document.createElement(t);
  for (const k in a || {}) { const v = a[k];
    if (k === 'class') e.className = v; else if (k === 'html') e.innerHTML = v;
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
    else if (v !== false && v != null) e.setAttribute(k, v === true ? '' : v); }
  c.flat(9).forEach(x => x != null && x !== false && e.append(x.nodeType ? x : document.createTextNode(x)));
  return e;
};
const ICONS = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/>',
  orang: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  dapukan: '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.9 7 22l5-3 5 3-1.2-8.1"/>',
  absensi: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  musyawarah: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
  laporan: '<path d="m9 11 3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>',
  dhuafa: '<path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7z"/>',
  pengaturan: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>',
  gemini: '<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>', sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>', upload: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>', download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>'
};
const ic = n => h('span', { class: 'ic', html: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[n] || '') + '</svg>' });

function toast(msg, tipe) {
  const t = h('div', { class: 'toast ' + (tipe || 'ok'), role: 'status' }, msg);
  document.getElementById('toasts').append(t); setTimeout(() => t.remove(), 4000);
}
function modal(judul, isi, aksi) {
  const bg = h('div', { class: 'backdrop', onclick: e => e.target === bg && tutup() });
  const tutup = () => bg.remove();
  bg.append(h('div', { class: 'modal', role: 'dialog', 'aria-modal': 'true' }, h('h3', {}, judul), h('div', { class: 'mbody' }, isi), h('div', { class: 'mfoot' }, (aksi || []).map(a => h('button', { class: 'btn ' + (a.kelas || ''), onclick: () => a.fn(tutup) }, a.t)))));
  document.body.append(bg); return tutup;
}
// fields: [{k,label,type:text|date|select|textarea,opts:[{v,t}],req}]
function formModal({ judul, fields, nilai, simpan, label }) {
  nilai = nilai || {};
  const inp = {};
  const body = h('form', { class: 'form', onsubmit: e => e.preventDefault() }, fields.map(f => {
    const el = f.type === 'select' ? h('select', {}, [h('option', { value: '' }, '— pilih —'), ...(f.opts || []).map(o => h('option', { value: o.v }, o.t))])
      : f.type === 'textarea' ? h('textarea', { rows: 3 }) : h('input', { type: f.type || 'text' });
    el.value = nilai[f.k] == null ? '' : String(nilai[f.k]).slice(0, f.type === 'date' ? 10 : 999); inp[f.k] = el;
    return h('label', {}, h('span', {}, f.label + (f.req ? ' *' : '')), el);
  }));
  return modal(judul, body, [{ t: 'Batal', fn: c => c() }, { t: label || 'Simpan', kelas: 'primary', fn: async c => {
    const v = {}; for (const f of fields) { v[f.k] = inp[f.k].value.trim(); if (f.req && !v[f.k]) return toast(f.label + ' wajib diisi', 'err'); }
    const ok = await simpan(v); if (ok !== false) c(); } }]);
}
function parseCSV(teks) {
  const baris = []; let r = [], c = '', q = false;
  for (let i = 0; i < teks.length; i++) { const x = teks[i];
    if (q) { if (x === '"' && teks[i + 1] === '"') { c += '"'; i++; } else if (x === '"') q = false; else c += x; }
    else if (x === '"') q = true; else if (x === ',' || x === ';') { r.push(c); c = ''; }
    else if (x === '\n') { r.push(c); baris.push(r); r = []; c = ''; } else if (x !== '\r') c += x; }
  if (c || r.length) { r.push(c); baris.push(r); }
  const hd = (baris.shift() || []).map(s => s.trim().toLowerCase());
  return baris.filter(b => b.join('').trim()).map(b => Object.fromEntries(hd.map((k, i) => [k, (b[i] || '').trim()])));
}
function unduhCSV(nama, rows) {
  if (!rows.length) return toast('Tidak ada data untuk diunduh', 'err');
  const k = Object.keys(rows[0]), q = v => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
  const blob = new Blob(['\ufeff' + [k.join(',')].concat(rows.map(r => k.map(x => q(r[x])).join(','))).join('\n')], { type: 'text/csv' });
  const a = h('a', { href: URL.createObjectURL(blob), download: nama + '.csv' }); a.click(); URL.revokeObjectURL(a.href);
  Api.write('catatEkspor', { modul: nama, format: 'csv', jumlah: rows.length });
}
const chip = (t, k) => h('span', { class: 'chip ' + (k || '') }, t);
const skel = n => h('div', { class: 'skel-wrap' }, Array.from({ length: n || 3 }, () => h('div', { class: 'skel' })));

// ---- Tambahan Bagian 5B ----
const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/';
const muat = src => new Promise((ok, no) => { if (document.querySelector('script[src="' + src + '"]')) return ok(); document.head.append(h('script', { src, onload: ok, onerror: () => no(new Error('Gagal memuat pustaka ekspor')) })); });
const catatEks = (nama, f, n) => Api.write('catatEkspor', { modul: nama, format: f, jumlah: n });
async function unduhXLSX(nama, rows) {
  if (!rows.length) return toast('Tidak ada data untuk diunduh', 'err');
  try { await muat(CDN + 'xlsx/0.18.5/xlsx.full.min.js'); } catch (e) { return toast(e.message, 'err'); }
  const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Data'); XLSX.writeFile(wb, nama + '.xlsx'); catatEks(nama, 'xlsx', rows.length);
}
async function unduhPDF(nama, rows) {
  if (!rows.length) return toast('Tidak ada data untuk diunduh', 'err');
  try { await muat(CDN + 'jspdf/2.5.1/jspdf.umd.min.js'); await muat(CDN + 'jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js'); } catch (e) { return toast(e.message, 'err'); }
  const d = new window.jspdf.jsPDF({ orientation: 'landscape' }); d.text(nama, 14, 14);
  d.autoTable({ head: [Object.keys(rows[0])], body: rows.map(r => Object.values(r)), startY: 20, styles: { fontSize: 8 }, headStyles: { fillColor: [15, 118, 110] } }); d.save(nama + '.pdf'); catatEks(nama, 'pdf', rows.length);
}
const eksporBtn = (nama, ambil) => h('div', { class: 'row' }, [['CSV', unduhCSV], ['Excel', unduhXLSX], ['PDF', unduhPDF]].map(([f, fn]) => h('button', { class: 'btn sm', onclick: async () => fn(nama, await ambil()) }, ic('download'), f)));
function pemilihOrang() {
  const nm = h('input', { placeholder: 'Cari nama orang…' }), hasil = h('div', { class: 'pick' }), o = { id: '', el: h('div', {}, nm, hasil) };
  nm.oninput = async () => { o.id = ''; if (nm.value.length < 2) return hasil.replaceChildren(); const r = await Api.raw('listOrang', { q: nm.value, per: 8 });
    hasil.replaceChildren(...((r.data && r.data.rows) || []).map(p => h('button', { type: 'button', class: 'btn sm', onclick: () => { o.id = p.id; nm.value = p.nama; hasil.replaceChildren(); } }, p.nama + ' · ' + p.wilayah))); };
  return o;
}
function tabs(defs) {
  const box = h('div'), bar = h('div', { class: 'tabs' });
  const pilih = i => { [...bar.children].forEach((b, j) => b.classList.toggle('on', i === j)); box.replaceChildren(); defs[i][1](box); };
  defs.forEach((d, i) => bar.append(h('button', { class: 'tab', onclick: () => pilih(i) }, d[0]))); pilih(0); return h('div', {}, bar, box);
}
const sel = (opts, ph) => h('select', {}, h('option', { value: '' }, ph || '— pilih —'), opts.map(o => h('option', { value: o.v }, o.t)));
const tgl = v => String(v || '').slice(0, 10);
