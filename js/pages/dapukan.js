Pages.dapukan = el => {
  const isi = h('div', { class: 'card' }, skel(4)), roles = ['admin_daerah', 'admin_desa', 'admin_kelompok', 'petugas_modul', 'baca'];
  const field = () => [{ k: 'nama', label: 'Nama dapukan', req: true }, { k: 'keterangan', label: 'Keterangan', type: 'textarea' },
    { k: 'role_default', label: 'Hak akses otomatis (role)', type: 'select', opts: roles.map(r => ({ v: r, t: r })) }];
  const ubah = o => formModal({ judul: o ? 'Ubah dapukan' : 'Tambah dapukan', fields: field(), nilai: o || {}, simpan: async v => {
    const r = await Api.write('simpanDapukan', Object.assign({}, v, { id: o && o.id })); r.success ? (toast('Tersimpan'), load()) : toast(r.message, 'err'); return r.success; } });
  function tempatkan(d) {
    const nm = h('input', { placeholder: 'Cari nama orang…' }), hasil = h('div', { class: 'pick' }); let pid = '';
    nm.oninput = async () => { if (nm.value.length < 2) return hasil.replaceChildren(); const r = await Api.raw('listOrang', { q: nm.value, per: 8 });
      hasil.replaceChildren(...(r.data ? r.data.rows : []).map(o => h('button', { type: 'button', class: 'btn sm', onclick: () => { pid = o.id; nm.value = o.nama; hasil.replaceChildren(); } }, o.nama + ' · ' + o.wilayah))); };
    const wil = h('select', {}, h('option', { value: '' }, '— wilayah penempatan —'), App.wilayahOpts().map(o => h('option', { value: o.v }, o.t))), mulai = h('input', { type: 'date' });
    modal('Tempatkan ke: ' + d.nama, h('div', { class: 'form' }, h('label', {}, h('span', {}, 'Orang'), nm), hasil, h('label', {}, h('span', {}, 'Wilayah'), wil), h('label', {}, h('span', {}, 'Tanggal mulai'), mulai)),
      [{ t: 'Batal', fn: c => c() }, { t: 'Tempatkan', kelas: 'primary', fn: async c => {
        if (!pid || !wil.value) return toast('Pilih orang dan wilayah', 'err');
        const r = await Api.write('simpanPenempatan', { person_id: pid, dapukan_id: d.id, region_id: wil.value, tgl_mulai: mulai.value });
        r.success ? (c(), toast('Ditempatkan'), load()) : toast(r.message, 'err'); } }]);
  }
  async function geser(l, i, dir) { const ids = l.map(x => x.id); [ids[i], ids[i + dir]] = [ids[i + dir], ids[i]]; const r = await Api.write('urutDapukan', { ids }); r.success ? load() : toast(r.message, 'err'); }
  function load() {
    Api.batch([['listDapukan'], ['statDapukan']], res => {
      const l = (res.data && res.data[0] && res.data[0].data) || [], jm = {}; ((res.data && res.data[1] && res.data[1].data) || []).forEach(x => jm[x.id] = x.jumlah);
      isi.replaceChildren(...(l.length ? l.map((d, i) => h('div', { class: 'item' }, h('div', {}, h('b', {}, d.nama), ' ', d.is_active === false ? chip('nonaktif', 'warn') : null, h('div', { class: 'muted sm' }, (d.keterangan || '—') + (d.role_default ? ' · akses: ' + d.role_default : ''))),
        h('div', { class: 'row' }, chip((jm[d.id] || 0) + ' orang'),
          h('button', { class: 'btn sm', disabled: i === 0, onclick: () => geser(l, i, -1) }, '↑'), h('button', { class: 'btn sm', disabled: i === l.length - 1, onclick: () => geser(l, i, 1) }, '↓'),
          h('button', { class: 'btn sm', onclick: () => tempatkan(d) }, 'Tempatkan'), h('button', { class: 'btn sm', onclick: () => ubah(d) }, 'Ubah'),
          h('button', { class: 'btn sm ghost', onclick: async () => { const r = await Api.write('simpanDapukan', Object.assign({}, d, { is_active: d.is_active === false })); r.success ? load() : toast(r.message, 'err'); } }, d.is_active === false ? 'Aktifkan' : 'Nonaktifkan')))) : [h('p', { class: 'muted pad' }, 'Belum ada dapukan. Tambahkan yang pertama.')]));
    });
  }
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Dapukan'), h('p', { class: 'muted' }, 'Satu orang boleh memegang banyak dapukan; dapukan dapat memberi hak akses.')),
    h('button', { class: 'btn primary', onclick: () => ubah(null) }, ic('plus'), 'Tambah dapukan')), isi);
  load();
};
