/* ======================================================================
   Hero — System Architecture Diagram
   A deliberate, designed visual: 3-layer architecture (Sources → Orchestration → Outputs)
   with animated cyan flow pulses along the connections.
   ====================================================================== */
(function () {
  const root = document.getElementById('hero-diagram');
  if (!root) return;

  // Layer 1: Data sources (top)
  const SOURCES = [
    { id: 'APOLLO',   x:  90 },
    { id: 'SALES NAV',x: 230 },
    { id: 'GA4',      x: 370 },
    { id: 'CLAUDE',   x: 510 }
  ];
  // Hub center
  const HUB = { id: 'n8n', x: 300, y: 240, label: 'orchestration' };
  // Layer 3: Outputs (bottom)
  const OUTS = [
    { id: 'CRM',      x: 130 },
    { id: 'PIPELINE', x: 300 },
    { id: 'KPI · CPL · CPSQL', x: 500, wide: true }
  ];

  const W = 600, H = 440;
  const sourcesY = 70;
  const outsY = 380;

  // Build SVG content
  const svg = `
    <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <defs>
        <radialGradient id="hub-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#4DD8FF" stop-opacity="0.55"/>
          <stop offset="60%" stop-color="#4DD8FF" stop-opacity="0.06"/>
          <stop offset="100%" stop-color="#4DD8FF" stop-opacity="0"/>
        </radialGradient>
        <linearGradient id="thread-up" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stop-color="#4DD8FF" stop-opacity="0.05"/>
          <stop offset="1" stop-color="#4DD8FF" stop-opacity="0.6"/>
        </linearGradient>
        <linearGradient id="thread-down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#4DD8FF" stop-opacity="0.6"/>
          <stop offset="1" stop-color="#4DD8FF" stop-opacity="0.05"/>
        </linearGradient>
        <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.6"/>
        </filter>
      </defs>

      <!-- Frame corners -->
      <g stroke="rgba(167,176,188,0.35)" stroke-width="1" fill="none">
        <path d="M 16 16 L 36 16 M 16 16 L 16 36"/>
        <path d="M ${W-16} 16 L ${W-36} 16 M ${W-16} 16 L ${W-16} 36"/>
        <path d="M 16 ${H-16} L 36 ${H-16} M 16 ${H-16} L 16 ${H-36}"/>
        <path d="M ${W-16} ${H-16} L ${W-36} ${H-16} M ${W-16} ${H-16} L ${W-16} ${H-36}"/>
      </g>

      <!-- Frame labels -->
      <g font-family="Geist Mono, ui-monospace, monospace" font-size="9" letter-spacing="1.6" fill="rgba(167,176,188,0.7)">
        <text x="44" y="22">SAMPLE ARCHITECTURE / GROWTH SYSTEM</text>
        <text x="${W-44}" y="22" text-anchor="end" fill="#4DD8FF">● LIVE</text>
        <text x="44" y="${H-10}">v.01 · STATUS: NOMINAL</text>
        <text x="${W-44}" y="${H-10}" text-anchor="end">↻ FLOW</text>
      </g>

      <!-- Layer hairlines -->
      <g stroke="rgba(255,255,255,0.05)" stroke-dasharray="2 4">
        <line x1="48" y1="${sourcesY+24}" x2="${W-48}" y2="${sourcesY+24}"/>
        <line x1="48" y1="${outsY-24}"  x2="${W-48}" y2="${outsY-24}"/>
      </g>
      <g font-family="Geist Mono, ui-monospace, monospace" font-size="9" letter-spacing="1.6" fill="rgba(111,122,134,0.9)">
        <text x="48" y="${sourcesY-22}">L1 · SOURCES</text>
        <text x="48" y="${HUB.y - 78}">L2 · ORCHESTRATION</text>
        <text x="48" y="${outsY-32}">L3 · OUTPUTS</text>
      </g>

      <!-- HUB glow -->
      <circle cx="${HUB.x}" cy="${HUB.y}" r="120" fill="url(#hub-glow)"/>

      <!-- Threads up: HUB ← sources -->
      <g stroke="url(#thread-up)" stroke-width="1.2" fill="none" stroke-linecap="round">
        ${SOURCES.map(s =>
          `<path d="M ${s.x} ${sourcesY+12} C ${s.x} ${(sourcesY+HUB.y)/2}, ${HUB.x} ${(sourcesY+HUB.y)/2}, ${HUB.x} ${HUB.y-30}"/>`
        ).join('')}
      </g>
      <!-- Threads down: HUB → outputs -->
      <g stroke="url(#thread-down)" stroke-width="1.2" fill="none" stroke-linecap="round">
        ${OUTS.map(o =>
          `<path d="M ${HUB.x} ${HUB.y+30} C ${HUB.x} ${(outsY+HUB.y)/2}, ${o.x} ${(outsY+HUB.y)/2}, ${o.x} ${outsY-12}"/>`
        ).join('')}
      </g>

      <!-- Animated flow pulses -->
      <g class="pulses">
        ${SOURCES.map((s, i) => `
          <circle r="2.6" fill="#4DD8FF">
            <animateMotion dur="${2.6 + i * 0.25}s" begin="${i * 0.4}s" repeatCount="indefinite"
              path="M ${s.x} ${sourcesY+12} C ${s.x} ${(sourcesY+HUB.y)/2}, ${HUB.x} ${(sourcesY+HUB.y)/2}, ${HUB.x} ${HUB.y-30}"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="${2.6 + i * 0.25}s" begin="${i * 0.4}s" repeatCount="indefinite"/>
          </circle>
        `).join('')}
        ${OUTS.map((o, i) => `
          <circle r="2.6" fill="#4DD8FF">
            <animateMotion dur="${2.4 + i * 0.3}s" begin="${1 + i * 0.3}s" repeatCount="indefinite"
              path="M ${HUB.x} ${HUB.y+30} C ${HUB.x} ${(outsY+HUB.y)/2}, ${o.x} ${(outsY+HUB.y)/2}, ${o.x} ${outsY-12}"/>
            <animate attributeName="opacity" values="0;1;1;0" dur="${2.4 + i * 0.3}s" begin="${1 + i * 0.3}s" repeatCount="indefinite"/>
          </circle>
        `).join('')}
      </g>

      <!-- HUB node -->
      <g class="hub" transform="translate(${HUB.x},${HUB.y})">
        <circle r="56" fill="rgba(11,16,22,0.9)" stroke="rgba(77,216,255,0.6)" stroke-width="1.2"/>
        <circle r="46" fill="none" stroke="rgba(77,216,255,0.18)" stroke-dasharray="2 4">
          <animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="40s" repeatCount="indefinite"/>
        </circle>
        <text y="-4" text-anchor="middle" font-family="Geist, system-ui, sans-serif" font-size="26" font-weight="500" fill="#F4F7FA" letter-spacing="-0.5">n8n</text>
        <text y="14" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="8" letter-spacing="1.6" fill="#4DD8FF">ORCHESTRATION</text>
        <text y="28" text-anchor="middle" font-family="Geist Mono, ui-monospace, monospace" font-size="7.5" letter-spacing="1" fill="rgba(167,176,188,0.7)">api · webhook · flow</text>
      </g>

      <!-- Source nodes -->
      <g class="sources">
        ${SOURCES.map(s => `
          <g transform="translate(${s.x},${sourcesY})">
            <rect x="-46" y="-16" width="92" height="32" rx="6" fill="rgba(11,16,22,0.85)" stroke="rgba(255,255,255,0.18)"/>
            <circle cx="-32" cy="0" r="3" fill="#F0B35A"/>
            <text x="-22" y="3" font-family="Geist Mono, ui-monospace, monospace" font-size="10" font-weight="500" letter-spacing="0.5" fill="#F4F7FA">${s.id}</text>
          </g>
        `).join('')}
      </g>

      <!-- Output nodes -->
      <g class="outs">
        ${OUTS.map(o => {
          const w = o.wide ? 132 : 88;
          return `
          <g transform="translate(${o.x},${outsY})">
            <rect x="${-w/2}" y="-16" width="${w}" height="32" rx="6" fill="rgba(11,16,22,0.85)" stroke="rgba(77,216,255,0.45)"/>
            <circle cx="${-w/2 + 14}" cy="0" r="3" fill="#4DD8FF"/>
            <text x="${-w/2 + 24}" y="3" font-family="Geist Mono, ui-monospace, monospace" font-size="10" font-weight="500" letter-spacing="0.5" fill="#F4F7FA">${o.id}</text>
          </g>`;
        }).join('')}
      </g>

      <!-- Live status pad -->
      <g transform="translate(${W-160}, ${HUB.y - 40})" font-family="Geist Mono, ui-monospace, monospace" font-size="9" letter-spacing="1" fill="rgba(167,176,188,0.85)">
        <rect x="0" y="0" width="140" height="80" rx="6" fill="rgba(11,16,22,0.7)" stroke="rgba(255,255,255,0.1)"/>
        <text x="12" y="18">CPL</text>     <text x="128" y="18" text-anchor="end" fill="#F4F7FA">€18.40</text>
        <text x="12" y="38">CPSQL</text>   <text x="128" y="38" text-anchor="end" fill="#F4F7FA">€132</text>
        <text x="12" y="58">PIPELINE</text><text x="128" y="58" text-anchor="end" fill="#4DD8FF">€312k</text>
        <line x1="12" y1="68" x2="128" y2="68" stroke="rgba(255,255,255,0.08)"/>
        <text x="12" y="78" font-size="8" fill="rgba(111,122,134,0.9)">UPDATED 12s AGO ●</text>
      </g>
    </svg>
  `;

  root.innerHTML = svg;
})();
