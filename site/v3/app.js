/* Marco v2 — interactions */
(function(){
  'use strict';

  // ===== LANG TOGGLE =====
  const langBtns = document.querySelectorAll('.langtoggle button');
  function setLang(lang){
    document.documentElement.lang = lang;
    langBtns.forEach(b => b.setAttribute('aria-pressed', b.dataset.lang === lang ? 'true' : 'false'));
    document.querySelectorAll('[data-en]').forEach(el => {
      const v = el.getAttribute('data-' + lang);
      if (v != null) el.innerHTML = v;
    });
    try { localStorage.setItem('mm_lang', lang); } catch(e){}
  }
  langBtns.forEach(b => b.addEventListener('click', () => setLang(b.dataset.lang)));
  try { const saved = localStorage.getItem('mm_lang'); if (saved) setLang(saved); } catch(e){}

  // ===== REVEAL ON SCROLL =====
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

  // ===== ACTIVE RAIL ITEM =====
  const railLinks = document.querySelectorAll('.rail a');
  const ids = ['hero','problem','position','sysmap','cap','proof','how','modes','stack','about','cta'];
  const sections = ids.map(id => document.getElementById(id)).filter(Boolean);
  function updateRail(){
    const y = window.scrollY + window.innerHeight * 0.35;
    let idx = 0;
    sections.forEach((s, i) => { if (s.offsetTop <= y) idx = i; });
    railLinks.forEach((a, i) => a.classList.toggle('active', i === idx));
  }
  window.addEventListener('scroll', updateRail, { passive: true });
  updateRail();

  // ===== SYSTEM MAP — CLICK TO INSPECT =====
  const STEPS = [
    { num: '01 · DIAGNOSE', title_en: 'Find what leaks.', title_it: 'Trova dove perde.',
      blurb_en: "Before strategy, autopsy. We open the funnel, the CRM, the offer and the sales process — and we name what's broken in plain language.",
      blurb_it: "Prima della strategia, l'autopsia. Apriamo funnel, CRM, offerta e processo commerciale — e diamo un nome a ciò che è rotto.",
      i_en: 'Funnel, CRM, offer, data, sales process.',           i_it: 'Funnel, CRM, offerta, dati, processo commerciale.',
      a_en: 'Find bottlenecks & hidden friction.',                a_it: 'Trovare colli di bottiglia e attriti nascosti.',
      o_en: 'Growth diagnosis with prioritised gaps.',            o_it: 'Diagnosi di crescita con gap prioritizzati.',
      m_en: 'Where revenue actually leaks.',                      m_it: 'Dove i ricavi perdono davvero.' },
    { num: '02 · POSITION', title_en: 'Sharpen the angle.', title_it: 'Affila l\'angolo.',
      blurb_en: "Markets reward sharp. Buyers reward specific. We rewrite the offer until a stranger can repeat it back word for word.",
      blurb_it: "Il mercato premia la nitidezza. I buyer premiano lo specifico. Riscriviamo l'offerta finché uno sconosciuto la ripete parola per parola.",
      i_en: 'Market signals, ICP interviews, competitor mapping.', i_it: 'Segnali di mercato, interviste ICP, mapping competitor.',
      a_en: 'Sharpen value proposition and offer.',                 a_it: 'Affilare value proposition e offerta.',
      o_en: 'Clear GTM angle and messaging architecture.',          o_it: 'Angolo GTM chiaro e architettura del messaggio.',
      m_en: 'Reply quality, conversion quality.',                   m_it: 'Qualità delle reply, qualità della conversione.' },
    { num: '03 · BUILD', title_en: 'Wire the machine.', title_it: 'Cabla la macchina.',
      blurb_en: "Tools, data, sequences and CRM stop being a list of subscriptions and become one motion. Workflows that survive a Friday at 5pm.",
      blurb_it: "Tool, dati, sequenze e CRM smettono di essere una lista di abbonamenti e diventano un unico motore. Workflow che sopravvivono a un venerdì alle 17.",
      i_en: 'Tools, data, sequences, CRM, integrations.',           i_it: 'Tool, dati, sequenze, CRM, integrazioni.',
      a_en: 'Connect workflows and assets end-to-end.',             a_it: 'Connettere workflow e asset end-to-end.',
      o_en: 'Acquisition engine, ready to launch.',                 o_it: 'Motore di acquisizione, pronto al lancio.',
      m_en: 'Campaign readiness score.',                            m_it: 'Indice di campaign readiness.' },
    { num: '04 · LAUNCH', title_en: 'Run controlled tests.', title_it: 'Test controllati.',
      blurb_en: "Not a big bang. Small, intentional shots — segmented, instrumented, ready to learn from. The market answers; we listen carefully.",
      blurb_it: "Niente big bang. Colpi piccoli e intenzionali — segmentati, strumentati, pronti a insegnare. Il mercato risponde; ascoltiamo con cura.",
      i_en: 'Segments, copy variants, channels, instrumentation.',  i_it: 'Segmenti, varianti di copy, canali, strumentazione.',
      a_en: 'Run controlled market tests.',                         a_it: 'Lanciare test di mercato controllati.',
      o_en: 'Live campaigns producing readable data.',              o_it: 'Campagne live che producono dati leggibili.',
      m_en: 'Open / reply / positive rates.',                       m_it: 'Tassi di apertura / reply / positive.' },
    { num: '05 · MEASURE', title_en: 'Read the signals.', title_it: 'Leggi i segnali.',
      blurb_en: "Dashboards stop being decoration and start being decisions. CPL, CPSQL and pipeline sit on a desk that can act on them.",
      blurb_it: "Le dashboard smettono di essere decorazione e diventano decisioni. CPL, CPSQL e pipeline finiscono su una scrivania che può agire.",
      i_en: 'Campaign data + CRM + sales process telemetry.',       i_it: 'Dati di campagna + CRM + telemetria sales.',
      a_en: 'Read actual signals; ignore vanity metrics.',          a_it: 'Leggere i segnali veri; ignorare le vanity metric.',
      o_en: 'KPI dashboard with weekly operating cadence.',         o_it: 'Dashboard KPI con cadenza operativa settimanale.',
      m_en: 'CPL · CPSQL · pipeline · velocity.',                   m_it: 'CPL · CPSQL · pipeline · velocità.' },
    { num: '06 · ITERATE', title_en: 'Compound, scale, prune.', title_it: 'Componi, scala, taglia.',
      blurb_en: "Doubles down on what works. Kills what doesn't. Documents what survived. The system gets quieter, sharper and cheaper to run.",
      blurb_it: "Raddoppia su ciò che funziona. Chiude ciò che no. Documenta ciò che è sopravvissuto. Il sistema diventa più silenzioso, netto e economico.",
      i_en: 'Performance data, qualitative signals, team feedback.', i_it: 'Dati di performance, segnali qualitativi, feedback team.',
      a_en: 'Refine, clean, scale or stop.',                         a_it: 'Raffinare, pulire, scalare o fermare.',
      o_en: 'A better system the team can run without me.',          o_it: 'Un sistema migliore che il team gestisce senza di me.',
      m_en: 'Efficiency over time. Cost per outcome down.',          m_it: 'Efficienza nel tempo. Costo per risultato in calo.' }
  ];

  const detail = document.getElementById('sysDetail');
  const nodes = document.querySelectorAll('.sysmap-node');
  function getLang(){ return document.documentElement.lang || 'en'; }
  function renderStep(i){
    const s = STEPS[i]; const L = getLang();
    detail.innerHTML = `
      <span class="d-num">${s.num}</span>
      <h3 class="d-title">${L === 'it' ? s.title_it : s.title_en}</h3>
      <p class="d-blurb">${L === 'it' ? s.blurb_it : s.blurb_en}</p>
      <div class="iaom">
        <div class="iaom-cell"><div class="lbl">${L==='it'?'Input':'Input'}</div><div class="val">${L==='it'?s.i_it:s.i_en}</div></div>
        <div class="iaom-cell"><div class="lbl">${L==='it'?'Azione':'Action'}</div><div class="val">${L==='it'?s.a_it:s.a_en}</div></div>
        <div class="iaom-cell"><div class="lbl">${L==='it'?'Output':'Output'}</div><div class="val">${L==='it'?s.o_it:s.o_en}</div></div>
        <div class="iaom-cell metric"><div class="lbl">${L==='it'?'Metrica':'Metric'}</div><div class="val">${L==='it'?s.m_it:s.m_en}</div></div>
      </div>`;
    nodes.forEach((n, j) => n.classList.toggle('active', j === i));
  }
  nodes.forEach((n, i) => n.addEventListener('click', () => renderStep(i)));
  // re-render on lang switch
  langBtns.forEach(b => b.addEventListener('click', () => {
    const active = [...nodes].findIndex(n => n.classList.contains('active'));
    renderStep(active >= 0 ? active : 0);
  }));

  // ===== DIAGNOSTIC CONSOLE — TYPED LINES =====
  const QUERIES = [
    { en: 'WHO is the buyer, exactly? Title + trigger + budget + pain.',  it: 'CHI è il buyer, esattamente? Ruolo + trigger + budget + dolore.',
      ans_en: 'No "decision-makers". A name, a calendar, a budget line.',  ans_it: 'Niente "decision-maker". Un nome, un calendario, una voce di budget.' },
    { en: 'WHAT does success look like in 90 days? Define the metric.',   it: 'COSA è il successo a 90 giorni? Definisci la metrica.',
      ans_en: 'If you can\'t name the number, you\'re measuring opinions.', ans_it: 'Se non sai dire il numero, stai misurando opinioni.' },
    { en: 'WHERE does the system leak today? Show me CRM, not opinions.', it: 'DOVE perde il sistema oggi? Mostrami il CRM, non le opinioni.',
      ans_en: 'Stage by stage, conversion by conversion. The data has the answer.', ans_it: 'Stage per stage, conversione per conversione. Il dato ha la risposta.' },
    { en: 'HOW does the team route a positive reply right now?',          it: 'COME il team gestisce una reply positiva, oggi?',
      ans_en: 'If the answer is "it depends", that\'s the first SOP.',    ans_it: 'Se la risposta è "dipende", quella è la prima SOP.' },
    { en: 'WHEN do KPIs hit a desk that can act on them?',                it: 'QUANDO i KPI arrivano a una scrivania che può agire?',
      ans_en: 'Weekly. With names attached. Or they don\'t hit a desk at all.', ans_it: 'Settimanale. Con nomi attaccati. Oppure non arrivano a nessuna scrivania.' }
  ];
  const consoleBody = document.getElementById('consoleBody');
  function buildConsole(){
    const L = getLang();
    consoleBody.innerHTML = '';
    QUERIES.forEach((q) => {
      const line = document.createElement('div');
      line.className = 'line';
      line.innerHTML = `<span class="gt">&gt;</span><span class="q">${L==='it'?q.it:q.en}</span>`;
      const ans = document.createElement('div');
      ans.className = 'line ans';
      ans.innerHTML = `<span>${L==='it'?q.ans_it:q.ans_en}</span>`;
      consoleBody.appendChild(line);
      consoleBody.appendChild(ans);
    });
    const caret = document.createElement('div');
    caret.className = 'line';
    caret.innerHTML = `<span class="gt">&gt;</span><span class="caret"></span>`;
    consoleBody.appendChild(caret);
  }
  buildConsole();
  langBtns.forEach(b => b.addEventListener('click', buildConsole));

  // reveal console lines staggered when section is in view
  const consoleSection = document.getElementById('how');
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const lines = consoleBody.querySelectorAll('.line');
        lines.forEach((ln, i) => setTimeout(() => ln.classList.add('show'), 180 + i * 280));
        cio.unobserve(consoleSection);
      }
    });
  }, { threshold: 0.3 });
  if (consoleSection) cio.observe(consoleSection);
  // re-show all on lang switch (already in view → instant)
  langBtns.forEach(b => b.addEventListener('click', () => {
    setTimeout(() => consoleBody.querySelectorAll('.line').forEach((ln, i) => setTimeout(() => ln.classList.add('show'), i * 60)), 50);
  }));

  // ===== ENGINE — MOUSE PARALLAX =====
  const engine = document.querySelector('.engine');
  if (engine && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    engine.addEventListener('mousemove', (e) => {
      const r = engine.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width  - 0.5;
      const y = (e.clientY - r.top)  / r.height - 0.5;
      const frame = engine.querySelector('.engine-frame');
      if (frame) {
        frame.style.transform = `perspective(1200px) rotateY(${x * 6}deg) rotateX(${-y * 4}deg)`;
        frame.style.transition = 'transform 0.5s cubic-bezier(.2,.7,.2,1)';
      }
    });
    engine.addEventListener('mouseleave', () => {
      const frame = engine.querySelector('.engine-frame');
      if (frame) frame.style.transform = '';
    });
  }

})();
