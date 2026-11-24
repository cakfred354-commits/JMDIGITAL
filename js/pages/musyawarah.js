Pages.musyawarah = el => {
  const isi = h('div', { class: 'card' }, skel(4));
  const baru = () => formModal({ judul: 'Musyawarah baru', fields: [{ k: 'agenda', label: 'Agenda', req: true }, { k: 'region_id', label: 'Wilayah', type: 'select', req: true, opts: App.wilayahOpts() }, { k: 'waktu', label: 'Tanggal', type: 'date', req: true },
    { k: 'hasil', label: 'Hasil pembahasan', type: 'textarea' }, { k: 'keputusan', label: 'Keputusan', type: 'textarea' }, { k: 'tl', label: 'Tindak lanjut (satu per baris: tugas | penanggung jawab | tenggat)', type: 'textarea' }],
    simpan: async v => { const tl = v.tl.split('\n').map(x => x.split('|').map(s => s.trim())).filter(x => x[0]).map(x => ({ tugas: x[0], penanggung_jawab: x[1] || '', tenggat: x[2] || '' })); delete v.tl;
      const r = await Api.write('simpanMusyawarah', Object.assign(v, { tindak_lanjut: tl })); r.success ? (toast('Tersimpan'), load()) : toast(r.message, 'err'); return r.success; } });
  async function lihat(m) {
    const r = await Api.raw('getMusyawarah', { id: m.id }); if (!r.success) return toast(r.message, 'err'); const d = r.data;
    modal(d.musyawarah.agenda, h('div', {}, h('p', { class: 'muted' }, tgl(d.musyawarah.waktu) + ' · ' + m.wilayah + ' · ' + d.peserta.length + ' peserta'), h('h4', {}, 'Hasil'), h('p', {}, d.musyawarah.hasil || '—'), h('h4', {}, 'Keputusan'), h('p', {}, d.musyawarah.keputusan || '—'),
      h('h4', {}, 'Tindak lanjut'), ...(d.tindak_lanjut.length ? d.tindak_lanjut.map(t => { const s = h('select', { onchange: async e => { const x = await Api.write('simpanTindakLanjut', { id: t.id, status: e.target.value }); x.success ? (toast('Status diperbarui'), load()) : toast(x.message, 'err'); } }, ['baru', 'berjalan', 'selesai'].map(o => h('option', { value: o }, o))); s.value = t.status;
        return h('div', { class: 'item' }, h('div', {}, h('b', {}, t.tugas), h('div', { class: 'muted sm' }, (t.penanggung_jawab || '—') + ' · tenggat ' + (tgl(t.tenggat) || '—'))), s); }) : [h('p', { class: 'muted' }, 'Tidak ada.')])), [{ t: 'Tutup', fn: c => c() }]);
  }
  function load() {
    Api.read('listMusyawarah', {}, r => { const l = r.data || [];
      isi.replaceChildren(...(l.length ? l.map(m => h('div', { class: 'item' }, h('div', {}, h('b', {}, m.agenda), h('div', { class: 'muted sm' }, tgl(m.waktu) + ' · ' + m.wilayah + ' · ' + m.tingkat)), h('div', { class: 'row' }, m.tindak_terbuka ? chip(m.tindak_terbuka + ' tindak lanjut', 'warn') : null, h('button', { class: 'btn sm', onclick: () => lihat(m) }, 'Buka')))) : [h('p', { class: 'muted pad' }, r.success === false ? r.message : 'Belum ada musyawarah.')])); });
  }
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Musyawarah'), h('p', { class: 'muted' }, 'Agenda, keputusan, dan pelacakan tindak lanjut.')), h('button', { class: 'btn primary', onclick: baru }, ic('plus'), 'Musyawarah baru')), isi);
  load();
};
