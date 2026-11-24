Pages.orang = el => {
  const st = { q: '', kategori: '', region_id: '', page: 1 }, isi = h('div', { class: 'card tablewrap' }, skel(5)), pag = h('div', { class: 'pager' });
  const FIELDS = () => [{ k: 'nama', label: 'Nama lengkap', req: true }, { k: 'jenis_kelamin', label: 'Jenis kelamin', type: 'select', req: true, opts: [{ v: 'L', t: 'Laki-laki' }, { v: 'P', t: 'Perempuan' }] },
    { k: 'tgl_lahir', label: 'Tanggal lahir', type: 'date' }, { k: 'status_keluarga', label: 'Status keluarga', type: 'select', opts: ['lajang', 'menikah', 'janda', 'duda'].map(x => ({ v: x, t: x })) },
    { k: 'region_id', label: 'Wilayah (kelompok)', type: 'select', req: true, opts: App.wilayahOpts('kelompok') }, { k: 'catatan', label: 'Catatan', type: 'textarea' }];
  async function simpan(v, id, paksa) {
    const r = await Api.write('simpanOrang', Object.assign({}, v, { id, paksa }));
    if (r.code === 'KEMBAR') return new Promise(res => modal('Kemungkinan data kembar', h('div', {}, h('p', {}, 'Ada data dengan nama, tanggal lahir, dan wilayah yang sama:'), h('ul', {}, r.kandidat.map(k => h('li', {}, k.nama + ' (' + String(k.tgl_lahir).slice(0, 10) + ')')))),
      [{ t: 'Batal', fn: c => { c(); res(false); } }, { t: 'Tetap simpan', kelas: 'primary', fn: async c => { c(); res(await simpan(v, id, true)); } }]));
    if (!r.success) { toast(r.message, 'err'); return false; }
    toast('Data tersimpan'); load(); return true;
  }
  const form = o => formModal({ judul: o ? 'Ubah data orang' : 'Tambah orang', fields: FIELDS(), nilai: o || {}, simpan: v => simpan(v, o && o.id) });
  function load() {
    Api.read('listOrang', { q: st.q, kategori: st.kategori, region_id: st.region_id, page: st.page, per: 20 }, (r) => {
      if (!r.success) return isi.replaceChildren(h('p', { class: 'muted pad' }, r.message));
      const d = r.data;
      isi.replaceChildren(d.rows.length ? h('table', {}, h('thead', {}, h('tr', {}, ['Nama', 'L/P', 'Umur', 'Kategori', 'Wilayah', ''].map(t => h('th', {}, t)))),
        h('tbody', {}, d.rows.map(o => h('tr', {}, h('td', { 'data-l': 'Nama' }, h('b', {}, o.nama)), h('td', { 'data-l': 'L/P' }, o.jenis_kelamin), h('td', { 'data-l': 'Umur' }, o.umur == null ? '-' : o.umur + ' th'),
          h('td', { 'data-l': 'Kategori' }, o.kategori ? chip(o.kategori) : '-'), h('td', { 'data-l': 'Wilayah' }, o.wilayah),
          h('td', { class: 'act' }, h('button', { class: 'btn sm', onclick: () => form(o) }, 'Ubah'),
            h('button', { class: 'btn sm ghost', onclick: () => modal('Arsipkan?', 'Data ' + o.nama + ' diarsipkan (riwayat tetap tersimpan).', [{ t: 'Batal', fn: c => c() }, { t: 'Arsipkan', kelas: 'danger', fn: async c => { c(); const x = await Api.write('arsipOrang', { id: o.id, aktif: false }); x.success ? (toast('Diarsipkan'), load()) : toast(x.message, 'err'); } }]) }, 'Arsip'))))))
        : h('p', { class: 'muted pad' }, 'Belum ada data.'));
      const hal = Math.max(1, Math.ceil(d.total / d.per));
      pag.replaceChildren(h('span', { class: 'muted sm' }, d.total + ' orang · hal ' + d.page + '/' + hal), h('button', { class: 'btn sm', disabled: d.page <= 1, onclick: () => { st.page--; load(); } }, '‹'), h('button', { class: 'btn sm', disabled: d.page >= hal, onclick: () => { st.page++; load(); } }, '›'));
    });
  }
  async function impor(file) {
    const rows = parseCSV(await file.text()), nm = {}; App.wilayah.forEach(w => nm[w.nama.toLowerCase()] = w.id);
    const data = rows.map(r => ({ nama: r.nama, jenis_kelamin: String(r.jenis_kelamin || r.jk || '').toUpperCase()[0], tgl_lahir: r.tgl_lahir, status_keluarga: r.status_keluarga, region_id: r.region_id || nm[String(r.wilayah || '').toLowerCase()] }));
    const r = await Api.write('importOrang', { rows: data, dryRun: true });
    if (!r.success) return toast(r.message, 'err');
    const x = r.data;
    modal('Hasil uji impor (belum disimpan)', h('div', {}, h('p', {}, x.tambah + ' akan ditambah · ' + x.kembar + ' dilewati (kembar)'), x.salah.length ? h('p', { class: 'warn' }, x.salah.length + ' baris bermasalah, mis. baris ' + x.salah[0].baris + ': ' + x.salah[0].alasan) : null, h('p', { class: 'muted sm' }, 'Kolom CSV: nama, jenis_kelamin, tgl_lahir, status_keluarga, wilayah')),
      [{ t: 'Batal', fn: c => c() }, { t: 'Impor sekarang', kelas: 'primary', fn: async c => { c(); const y = await Api.write('importOrang', { rows: data }); y.success ? (toast(y.data.tambah + ' orang diimpor'), load()) : toast(y.message, 'err'); } }]);
  }
  const cari = h('input', { type: 'search', placeholder: 'Cari nama…', 'aria-label': 'Cari', oninput: e => { clearTimeout(cari._t); cari._t = setTimeout(() => { st.q = e.target.value; st.page = 1; load(); }, 300); } });
  const selKat = h('select', { 'aria-label': 'Kategori', onchange: e => { st.kategori = e.target.value; st.page = 1; load(); } }, h('option', { value: '' }, 'Semua kategori'), App.kategori.map(k => h('option', { value: k.nama }, k.nama)));
  const selWil = h('select', { 'aria-label': 'Wilayah', onchange: e => { st.region_id = e.target.value; st.page = 1; load(); } }, h('option', { value: '' }, 'Semua wilayah'), App.wilayahOpts().map(o => h('option', { value: o.v }, o.t)));
  const file = h('input', { type: 'file', accept: '.csv', hidden: true, onchange: e => e.target.files[0] && impor(e.target.files[0]) });
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Data Orang & KK'), h('p', { class: 'muted' }, 'Basis data induk jamaah — satu identitas untuk semua badan.')),
    h('div', { class: 'row' }, file, h('button', { class: 'btn', onclick: () => file.click() }, ic('upload'), 'Impor CSV'),
      eksporBtn('data-orang', async () => { const r = await Api.raw('listOrang', { per: 100 }); return r.success ? r.data.rows.map(o => ({ nama: o.nama, jk: o.jenis_kelamin, umur: o.umur, kategori: o.kategori, wilayah: o.wilayah })) : []; }),
      h('button', { class: 'btn primary', onclick: () => form(null) }, ic('plus'), 'Tambah orang'))),
    h('div', { class: 'filters' }, cari, selKat, selWil), isi, pag);
  load();
};
