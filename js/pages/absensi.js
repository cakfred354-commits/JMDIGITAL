Pages.absensi = el => {
  const isi = h('div', { class: 'card' }, skel(4));
  const baru = () => formModal({ judul: 'Kegiatan baru', fields: [{ k: 'nama', label: 'Nama kegiatan', req: true }, { k: 'region_id', label: 'Wilayah', type: 'select', req: true, opts: App.wilayahOpts() },
    { k: 'tanggal', label: 'Tanggal', type: 'date', req: true }, { k: 'lokasi', label: 'Lokasi' }, { k: 'pemateri', label: 'Pemateri' }, { k: 'kategori', label: 'Kategori' }],
    simpan: async v => { const r = await Api.write('simpanKegiatan', v); r.success ? (toast('Kegiatan dibuat'), load()) : toast(r.message, 'err'); return r.success; } });
  function load() {
    Api.read('listKegiatan', {}, r => { const l = r.data || [];
      isi.replaceChildren(...(l.length ? l.map(a => h('div', { class: 'item' }, h('div', {}, h('b', {}, a.nama), h('div', { class: 'muted sm' }, tgl(a.tanggal) + ' · ' + a.wilayah + ' · ' + a.tingkat + (a.pemateri ? ' · ' + a.pemateri : ''))), h('button', { class: 'btn sm primary', onclick: () => detail(a) }, 'Presensi'))) : [h('p', { class: 'muted pad' }, r.success === false ? r.message : 'Belum ada kegiatan.')])); });
  }
  function detail(a) {
    const st = { jk: '', page: 1 }, ed = {}; let rows = [];
    const tb = h('div', { class: 'card tablewrap' }, skel(4)), pg = h('div', { class: 'pager' }), info = h('span', { class: 'muted sm' });
    const seg = p => { const w = h('div', { class: 'seg' }); ['hadir', 'izin', 'alpa'].forEach(s => w.append(h('button', { type: 'button', class: (ed[p.person_id] || p.status) === s ? 'on ' + s : '', onclick: () => { ed[p.person_id] = s; draw(); } }, s[0].toUpperCase() + s.slice(1)))); return w; };
    const draw = () => { tb.replaceChildren(rows.length ? h('table', {}, h('thead', {}, h('tr', {}, ['Nama', 'Wilayah', 'L/P', 'Kehadiran'].map(t => h('th', {}, t)))),
      h('tbody', {}, rows.map(p => h('tr', {}, h('td', { 'data-l': 'Nama' }, h('b', {}, p.nama)), h('td', { 'data-l': 'Wilayah' }, p.wilayah), h('td', { 'data-l': 'L/P' }, p.jk), h('td', { 'data-l': 'Kehadiran' }, seg(p)))))) : h('p', { class: 'muted pad' }, 'Tidak ada peserta di wilayah ini.')); info.textContent = Object.keys(ed).length + ' perubahan belum disimpan'; };
    const muatPeserta = async () => { const r = await Api.raw('getAbsensi', { activity_id: a.id, jk: st.jk, page: st.page, per: 50 }); if (!r.success) return toast(r.message, 'err'); rows = r.data.rows; draw();
      const hal = Math.max(1, Math.ceil(r.data.total / r.data.per)); pg.replaceChildren(h('span', { class: 'muted sm' }, r.data.total + ' peserta · hal ' + st.page + '/' + hal), h('button', { class: 'btn sm', disabled: st.page <= 1, onclick: () => { st.page--; muatPeserta(); } }, '‹'), h('button', { class: 'btn sm', disabled: st.page >= hal, onclick: () => { st.page++; muatPeserta(); } }, '›')); };
    const jk = h('select', { 'aria-label': 'Jenis kelamin', onchange: e => { st.jk = e.target.value; st.page = 1; muatPeserta(); } }, h('option', { value: '' }, 'Semua peserta'), h('option', { value: 'L' }, 'Laki-laki'), h('option', { value: 'P' }, 'Perempuan'));
    const rekap = async () => { const r = await Api.raw('statRekapAbsensi', { activity_id: a.id }); if (!r.success) return toast(r.message, 'err'); const d = r.data;
      modal('Rekap: ' + a.nama, h('div', {}, h('p', {}, 'Hadir ' + d.total.hadir + ' · Izin ' + d.total.izin + ' · Alpa ' + d.total.alpa), h('p', { class: 'muted' }, 'Hadir putra ' + d.hadir_per_jk.L + ' · putri ' + d.hadir_per_jk.P), h('p', { class: 'muted sm' }, Object.entries(d.per_wilayah).map(([k, v]) => k + ': ' + v.hadir + ' hadir').join(' · '))), [{ t: 'Tutup', fn: c => c() }]); };
    el.replaceChildren(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, a.nama), h('p', { class: 'muted' }, tgl(a.tanggal) + ' · ' + a.wilayah)), h('div', { class: 'row' }, h('button', { class: 'btn', onclick: () => Pages.absensi(el.replaceChildren() || el) }, '‹ Kembali'), h('button', { class: 'btn', onclick: rekap }, 'Rekap'),
      eksporBtn('presensi-' + a.nama, async () => { const r = await Api.raw('getAbsensi', { activity_id: a.id, per: 200 }); return r.success ? r.data.rows.map(p => ({ nama: p.nama, wilayah: p.wilayah, jk: p.jk, status: ed[p.person_id] || p.status })) : []; }))),
      h('div', { class: 'filters' }, jk), tb, pg, h('div', { class: 'row', style: 'justify-content:space-between;margin-top:8px' }, info, h('div', { class: 'row' },
        h('button', { class: 'btn', onclick: () => { rows.forEach(p => ed[p.person_id] = 'hadir'); draw(); } }, 'Tandai halaman ini hadir'),
        h('button', { class: 'btn primary', onclick: async () => { const items = Object.entries(ed).map(([person_id, status]) => ({ person_id, status })); if (!items.length) return toast('Belum ada perubahan', 'err');
          const r = await Api.write('simpanAbsensi', { activity_id: a.id, items }); if (!r.success) return toast(r.message, 'err'); Object.keys(ed).forEach(k => delete ed[k]); toast('Presensi tersimpan'); muatPeserta(); } }, 'Simpan presensi'))));
    muatPeserta();
  }
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Absensi Kegiatan'), h('p', { class: 'muted' }, 'Presensi berjenjang daerah, desa, dan kelompok.')), h('button', { class: 'btn primary', onclick: baru }, ic('plus'), 'Kegiatan baru')), isi);
  load();
};
