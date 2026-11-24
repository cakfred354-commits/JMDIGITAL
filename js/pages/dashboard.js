const Pages = window.Pages = window.Pages || {};
Pages.dashboard = el => {
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Assalamu\'alaikum, ' + App.user.nama), h('p', { class: 'muted' }, 'Ringkasan data jamaah dan generus terkini.'))));
  const statEl = h('div', { class: 'grid4' }, skel(1), skel(1), skel(1), skel(1)), baris = h('div', { class: 'grid2' });
  el.append(statEl, baris);
  Api.batch([['dashStat'], ['statDapukan']], res => {
    if (!res.success) return toast(res.message, 'err');
    const s = (res.data[0] || {}).data, d = (res.data[1] || {}).data;
    if (!s) return statEl.replaceChildren(h('p', { class: 'muted' }, 'Tidak ada data statistik untuk akun ini.'));
    const kartu = (t, v, sub) => h('div', { class: 'card stat' }, h('div', { class: 'label' }, t), h('div', { class: 'val' }, String(v)), h('div', { class: 'muted sm' }, sub));
    statEl.replaceChildren(kartu('Total jamaah', s.jamaah, 'jiwa aktif'), kartu('Kepala keluarga', s.kk, 'KK aktif'),
      kartu('Laporan menunggu', (s.laporan.menunggu_pemeriksaan || 0), 'perlu diperiksa'), kartu('Kehadiran kegiatan', s.kehadiran_persen + '%', s.kegiatan + ' kegiatan'));
    const maks = Math.max(1, ...Object.values(s.kategori));
    const kat = h('div', { class: 'card' }, h('h3', {}, 'Rekap jamaah per kategori'), Object.entries(s.kategori).map(([k, v]) =>
      h('div', { class: 'bar' }, h('span', {}, k), h('div', { class: 'track' }, h('i', { style: 'width:' + Math.round(v * 100 / maks) + '%' })), h('b', {}, v))));
    const W = [['selesai', 'Selesai', '#16A34A'], ['menunggu_pemeriksaan', 'Menunggu', '#D97706'], ['perlu_revisi', 'Perlu revisi', '#DC2626'], ['belum_mengisi', 'Belum mengisi', '#94A3B8']];
    const tot = W.reduce((a, w) => a + (s.laporan[w[0]] || 0), 0); let acc = 0;
    const grad = tot ? W.map(w => { const a = acc / tot * 100; acc += s.laporan[w[0]] || 0; return w[2] + ' ' + a + '% ' + acc / tot * 100 + '%'; }).join(',') : 'var(--line) 0 100%';
    const lap = h('div', { class: 'card' }, h('h3', {}, 'Status laporan'), h('div', { class: 'donut', style: 'background:conic-gradient(' + grad + ')' }, h('div', {}, tot ? Math.round((s.laporan.selesai || 0) * 100 / tot) + '%' : '–')),
      W.map(w => h('div', { class: 'legend' }, h('i', { style: 'background:' + w[2] }), w[1], h('b', {}, s.laporan[w[0]] || 0))));
    const dap = h('div', { class: 'card' }, h('h3', {}, 'Anggota per dapukan'), (d || []).length ? d.map(x => h('div', { class: 'legend' }, x.nama, h('b', {}, x.jumlah))) : h('p', { class: 'muted' }, 'Belum ada dapukan.'));
    baris.replaceChildren(kat, h('div', { class: 'stack' }, lap, dap));
  });
};
