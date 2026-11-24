Pages.laporan = el => {
  const NAMA = { belum_mengisi: ['Belum mengisi', ''], menunggu_pemeriksaan: ['Menunggu pemeriksaan', 'warn'], perlu_revisi: ['Perlu revisi', 'warn'], selesai: ['Selesai', ''] };
  const b64 = f => new Promise(ok => { const r = new FileReader(); r.onload = () => ok(String(r.result).split(',')[1]); r.readAsDataURL(f); });
  async function isi(x, reload) {
    const r = await Api.raw('getLaporan', { id: x.id }); if (!r.success) return toast(r.message, 'err'); const d = r.data, inp = {};
    const form = h('div', { class: 'form' }, d.catatan ? h('p', { class: 'warn' }, 'Catatan pemeriksa: ' + d.catatan) : null, d.fields.map(f => { inp[f.id] = h('input', { type: f.tipe === 'angka' ? 'number' : f.tipe === 'tanggal' ? 'date' : 'text', value: d.jawaban[f.id] || '' }); return h('label', {}, h('span', {}, f.label + (f.wajib === true ? ' *' : '')), inp[f.id]); }));
    const file = h('input', { type: 'file', accept: 'image/*,application/pdf' }); form.append(h('label', {}, h('span', {}, 'Lampiran (gambar/PDF, maks 4 MB)'), file));
    modal(x.template + ' · ' + x.wilayah, form, [{ t: 'Batal', fn: c => c() }, { t: 'Kirim laporan', kelas: 'primary', fn: async c => {
      const j = {}; d.fields.forEach(f => j[f.id] = inp[f.id].value); const s = await Api.write('isiLaporan', { id: x.id, jawaban: j }); if (!s.success) return toast(s.message, 'err');
      if (file.files[0]) { const u = await Api.write('unggahLampiran', { id: x.id, nama: file.files[0].name, mime: file.files[0].type, base64: await b64(file.files[0]) }); if (!u.success) toast('Laporan terkirim, lampiran gagal: ' + u.message, 'err'); }
      c(); toast('Laporan terkirim'); reload(); } }]);
  }
  async function periksa(x, reload) {
    const r = await Api.raw('getLaporan', { id: x.id }); if (!r.success) return toast(r.message, 'err'); const d = r.data, cat = h('textarea', { rows: 2, placeholder: 'Catatan (wajib bila revisi/tolak)' });
    const aksi = a => async c => { const s = await Api.write('periksaLaporan', { id: x.id, aksi: a, catatan: cat.value }); s.success ? (c(), toast('Pemeriksaan tersimpan'), reload()) : toast(s.message, 'err'); };
    modal('Periksa: ' + x.template + ' · ' + x.wilayah, h('div', {}, d.fields.map(f => h('p', {}, h('b', {}, f.label + ': '), String(d.jawaban[f.id] || '—'))), h('p', { class: 'muted sm' }, 'Lampiran: ' + (d.lampiran.map(l => l.nama).join(', ') || 'tidak ada')), cat),
      [{ t: 'Tutup', fn: c => c() }, { t: 'Revisi', fn: aksi('revisi') }, { t: 'Terima', kelas: 'primary', fn: aksi('terima') }]);
  }
  const tabLaporan = box => {
    const st = sel(Object.entries(NAMA).map(([v, n]) => ({ v, t: n[0] })), 'Semua status'), list = h('div', { class: 'card' }, skel(4)); let data = [];
    const load = () => Api.read('listLaporan', { status: st.value }, r => { data = r.data || [];
      list.replaceChildren(...(data.length ? data.map(x => h('div', { class: 'item' }, h('div', {}, h('b', {}, x.template), h('div', { class: 'muted sm' }, x.wilayah + ' · ' + x.periode + ' · tenggat ' + tgl(x.tenggat) + (x.tepat_waktu === false ? ' · terlambat' : ''))),
        h('div', { class: 'row' }, chip(NAMA[x.status][0], NAMA[x.status][1]), x.status === 'belum_mengisi' || x.status === 'perlu_revisi' ? h('button', { class: 'btn sm primary', onclick: () => isi(x, load) }, 'Isi') : null, x.status === 'menunggu_pemeriksaan' ? h('button', { class: 'btn sm primary', onclick: () => periksa(x, load) }, 'Periksa') : null))) : [h('p', { class: 'muted pad' }, r.success === false ? r.message : 'Belum ada laporan.')])); });
    st.onchange = load; box.append(h('div', { class: 'row', style: 'justify-content:space-between;margin-bottom:12px' }, st, eksporBtn('laporan', async () => data.map(x => ({ laporan: x.template, wilayah: x.wilayah, periode: x.periode, tenggat: tgl(x.tenggat), status: NAMA[x.status][0], dikirim: tgl(x.dikirim_at) })))), list); load();
  };
  const tabTemplate = box => {
    const list = h('div', { class: 'card' }, skel(3));
    const baru = () => formModal({ judul: 'Template laporan baru', fields: [{ k: 'nama', label: 'Nama template', req: true }, { k: 'periode', label: 'Periode', type: 'select', opts: ['bulanan', 'mingguan', 'semester'].map(x => ({ v: x, t: x })) },
      { k: 'f', label: 'Isian (satu per baris: label | teks/angka/tanggal | wajib)', type: 'textarea', req: true }], simpan: async v => {
      const fields = v.f.split('\n').map(x => x.split('|').map(s => s.trim())).filter(x => x[0]).map(x => ({ label: x[0], tipe: x[1] || 'teks', wajib: /^(y|ya|wajib|1)/i.test(x[2] || '') }));
      const r = await Api.write('simpanTemplate', { nama: v.nama, periode: v.periode || 'bulanan', fields }); r.success ? (toast('Template dibuat'), load()) : toast(r.message, 'err'); return r.success; } });
    const tugas = t => { const cek = h('div', { class: 'checks' }, App.wilayah.filter(w => w.level === 'kelompok').map(w => h('label', {}, h('input', { type: 'checkbox', value: w.id }), w.nama))), per = h('input', { placeholder: 'mis. 2026-11' }), tg = h('input', { type: 'date' });
      modal('Tugaskan: ' + t.nama, h('div', { class: 'form' }, h('label', {}, h('span', {}, 'Periode'), per), h('label', {}, h('span', {}, 'Tenggat'), tg), h('label', {}, h('span', {}, 'Kelompok sasaran'), cek)),
        [{ t: 'Batal', fn: c => c() }, { t: 'Tugaskan', kelas: 'primary', fn: async c => { const ids = [...cek.querySelectorAll('input:checked')].map(i => i.value);
          const r = await Api.write('tugaskanLaporan', { template_id: t.id, region_ids: ids, periode: per.value.trim(), tenggat: tg.value }); r.success ? (c(), toast(r.data + ' kelompok ditugaskan')) : toast(r.message, 'err'); } }]); };
    const load = () => Api.read('listTemplate', {}, r => { const l = r.data || [];
      list.replaceChildren(...(l.length ? l.map(t => h('div', { class: 'item' }, h('div', {}, h('b', {}, t.nama), h('div', { class: 'muted sm' }, t.periode + ' · ' + t.fields.length + ' isian')), h('button', { class: 'btn sm', onclick: () => tugas(t) }, 'Tugaskan'))) : [h('p', { class: 'muted pad' }, 'Belum ada template.')])); });
    box.append(h('div', { class: 'row', style: 'margin-bottom:12px' }, h('button', { class: 'btn primary', onclick: baru }, ic('plus'), 'Template baru')), list); load();
  };
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Checklist & Laporan'), h('p', { class: 'muted' }, 'Belum mengisi → menunggu pemeriksaan → perlu revisi → selesai.'))), tabs([['Laporan', tabLaporan], ['Template & penugasan', tabTemplate]]));
};
