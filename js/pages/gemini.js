Pages.gemini = el => {
  const log = h('div', { class: 'chat' }, h('div', { class: 'msg a' }, 'Assalamu\'alaikum! Tanyakan cara memakai aplikasi, ringkasan data yang boleh Anda lihat, atau materi umum.')), q = h('input', { placeholder: 'Tulis pertanyaan…', maxlength: 800 }), btn = h('button', { class: 'btn primary', type: 'submit' }, 'Kirim');
  const kirim = async e => { e.preventDefault(); const t = q.value.trim(); if (!t) return; q.value = ''; btn.disabled = true; log.append(h('div', { class: 'msg u' }, t)); const w = h('div', { class: 'msg a muted' }, 'Menjawab…'); log.append(w);
    const r = await Api.raw('tanyaGemini', { pertanyaan: t }); w.className = 'msg a'; w.textContent = r.success ? r.data.jawaban : r.message; btn.disabled = false; w.scrollIntoView({ block: 'nearest' }); };
  el.append(h('div', { class: 'phead' }, h('div', {}, h('h1', {}, 'Asisten AI'), h('p', { class: 'muted' }, 'Ditenagai Google Gemini (tingkat gratis). Hanya statistik agregat yang dikirim, bukan data pribadi.'))), h('div', { class: 'card' }, log, h('form', { class: 'row', style: 'margin-top:16px;flex-wrap:nowrap', onsubmit: kirim }, q, btn)));
};
