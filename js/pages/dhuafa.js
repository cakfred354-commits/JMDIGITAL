Pages.dhuafa = el => {
  const STATUS = ['terdaftar', 'diproses', 'ditangani', 'selesai'];
  function bagian(box, c) {
    const rek = h('div', { class: 'row', style: 'margin-bottom:12px' }), isi = h('div', { class: 'card tablewrap' }, skel(3));
    const load = () => Api.read(c.list, {}, r => {
      if (!r.success) return isi.replaceChildren(h('p', { class: 'muted pad' }, r.message));
      const d = r.data; rek.replaceChildren(chip('Total ' + d.total), ...Object.entries(d.rekap).map(([k, v]) => chip(k + ': ' + v)));
      isi.replaceChildren(d.detail.length ? h('table', {}, h('thead', {}, h('tr', {}, [...c.cols.map(x => x[0]), ''].map(t => h('th', {}, t)))), h('tbody', {}, d.detail.map(x => h('tr', {}, ...c.cols.map(k => h('td', { 'data-l': k[0] }, k[2] ? k[2](x) : String(x[k[1]] || '—'))), h('td', { class: 'act' }, c.aksi ? c.aksi(x, load) : null)))))
        : h('p', { class: 'muted pad' }, d.total ? 'Detail hanya untuk petugas berizin. Anda melihat rekap jumlah.' : 'Belum ada catatan.')); });
    box.append(rek, isi); box.prepend(h('div', { class: 'row', style: 'margin-bottom:12px' }, h('button', { class: 'btn primary', onclick: () => c.tambah(load) }, ic('plus'), c.tombol))); load();
  }
  const form = (judul, ekstra, aksi, load) => { const p = pemilihOrang(), w = sel(App.wilayahOpts('kelompok'), '— wilayah (kelompok) —'), ex = ekstra();
    modal(judul, h('div', { class: 'form' }, h('label', {}, h('span', {}, 'Orang'), p.el), h('label', {}, h('span', {}, 'Wilayah'), w), ex.el), [{ t: 'Batal', fn: c => c() }, { t: 'Simpan', kelas: 'primary', fn: async c => {
      if (!p.id || !w.value) return toast('Pilih orang dan wilayah', 'err'); const r = await Api.write(aksi, Object.assign({ person_id: p.id, region_id: w.value }, ex.val())); r.success ? (c(), toast('Tersimpan'), load()) : toast(r.message, 'err'); } }]); };
  const tabDhuafa = box => bagian(box, { list: 'listDhuafa', tombol: 'Catat dhuafa', cols: [['Nama', 'nama'], ['Wilayah', 'wilayah'], ['Kebutuhan', 'kebutuhan'], ['Status', 'status_penanganan', x => chip(x.status_penanganan)]],
    tambah: load => form('Catat dhuafa', () => { const k = h('textarea', { rows: 2, placeholder: 'Kebutuhan' }), s = sel(STATUS.map(x => ({ v: x, t: x })), 'Status penanganan'); s.value = 'terdaftar'; return { el: h('div', { class: 'form' }, k, s), val: () => ({ kebutuhan: k.value, status_penanganan: s.value }) }; }, 'simpanDhuafa', load) });
  const tabKematian = box => bagian(box, { list: 'listKematian', tombol: 'Catat kematian', cols: [['Nama', 'nama'], ['Wilayah', 'wilayah'], ['Wafat', 'tgl_wafat', x => tgl(x.tgl_wafat)], ['Verifikasi', 'status_verifikasi', x => chip(x.status_verifikasi, x.status_verifikasi === 'terverifikasi' ? '' : 'warn')], ['Faroidh', 'diserahkan_at', x => x.diserahkan_at ? tgl(x.diserahkan_at) + ' · ' + x.diserahkan_oleh : '—']],
    tambah: load => form('Catat kematian', () => { const t = h('input', { type: 'date' }); return { el: h('label', {}, h('span', {}, 'Tanggal wafat'), t), val: () => ({ tgl_wafat: t.value }) }; }, 'simpanKematian', load),
    aksi: (x, load) => h('div', { class: 'row' }, x.status_verifikasi === 'belum' ? h('button', { class: 'btn sm', onclick: async () => { const r = await Api.write('verifikasiKematian', { id: x.id }); r.success ? (toast('Terverifikasi'), load()) : toast(r.message, 'err'); } }, 'Verifikasi') : null,
      x.status_verifikasi === 'terverifikasi' && !x.diserahkan_at ? h('button', { class: 'btn sm primary', onclick: () => modal('Serahkan ke Tim Faroidh?', 'Penyerahan dicatat dengan waktu dan nama Anda.', [{ t: 'Batal', fn: c => c() }, { t: 'Serahkan', kelas: 'primary', fn: async c => { c(); const r = await Api.write('serahkanKematian', { id: x.id }); r.success ? (toast('Diserahkan'), load()) : toast(r.message, 'err'); } }]) }, 'Serahkan') : null) });
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Dhuafa & Kematian'), h('p', { class: 'muted' }, 'Data sensitif — akses detail tercatat di audit log.'))), tabs([['Dhuafa', tabDhuafa], ['Kematian & Faroidh', tabKematian]]));
};
