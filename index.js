/* Shahriar Hooshmand — portfolio (no build step, no frameworks) */
'use strict';

const USER = 'shahriar-hd';

/* Enriched, hand-written data for the six current pinned repos.
   Used to enrich live results and as a fallback if the pinned API is unavailable. */
const PINNED_FALLBACK = [
  {
    name: 'zi_ocr',
    language: 'Python',
    label: 'Document AI',
    subtitle: 'Persian Document OCR with PaddleOCR-VL + LoRA',
    description: 'Fine-tuned PaddleOCR-VL-1.6 with LoRA to parse Persian official letters.',
    proof: 'CER 56.36% → 21.54% · letters-only 63.66% → 9.07%',
    details: 'Built a 26.8k-page synthetic Persian official-letters dataset with per-element bounding boxes and reading order, then fine-tuned PaddleOCR-VL-1.6 with LoRA (9.39M of 915M trainable parameters). On the held-out test set (n=5,855): overall CER 56.36% → 21.54%, letters-only CER 63.66% → 9.07%.',
    links: [
      { label: 'GitHub', url: 'https://github.com/shahriar-hd/zi_ocr' },
      { label: 'Dataset', url: 'https://huggingface.co/datasets/shahriarhd/persian-official-letters-synth' }
    ]
  },
  {
    name: 'bsc-project',
    language: 'Python',
    label: 'B.Sc. Thesis · Security',
    subtitle: 'Multi-Task Face Authentication & Deepfake Detection',
    description: 'One EfficientNet-B2 backbone with three heads for spoof, deepfake, and temporal-consistency detection.',
    proof: 'Anti-spoofing AUC 0.9856 · Deepfake AUC 0.8854',
    details: 'A unified multi-task learning framework that detects presentation attacks and deepfakes from video clips in a single model on a shared backbone, designed to run on consumer GPUs with limited VRAM. Three heads (deepfake, spoof, temporal consistency) share one EfficientNet-B2 trunk. Evaluated at SiW-Mv2 anti-spoofing AUC 0.9856 and FaceForensics++ deepfake AUC 0.8854.',
    links: [
      { label: 'GitHub', url: 'https://github.com/shahriar-hd/bsc-project' },
      { label: 'Demo', url: 'https://huggingface.co/spaces/shahriarhd/mtl-face-auth-web' },
      { label: 'Model', url: 'https://huggingface.co/shahriarhd/mtl-face-auth' }
    ]
  },
  {
    name: 'farsiplaterecognition',
    language: 'Jupyter Notebook',
    label: 'Detection · Edge AI',
    subtitle: 'Iranian License Plate Recognition',
    description: 'End-to-end YOLOv8 detection and recognition of Iranian license plates, optimized for edge deployment.',
    proof: 'YOLOv8 · 92.8% mAP@50 · real-time on Raspberry Pi 5',
    details: 'A complete end-to-end system for detecting and recognizing Iranian license plates using YOLOv8, achieving 92.8% mAP@50 and optimized for real-time inference on a Raspberry Pi 5. Ships both the detection model and recognition pipeline.',
    links: [
      { label: 'GitHub', url: 'https://github.com/shahriar-hd/farsiplaterecognition' },
      { label: 'Demo', url: 'https://huggingface.co/spaces/shahriarhd/iranian-car-plate-recognition-web' },
      { label: 'Model', url: 'https://huggingface.co/shahriarhd/iranian-car-plate-recognition-yolov8' }
    ]
  },
  {
    name: 'brain-scan-ai',
    language: 'Jupyter Notebook',
    label: 'Medical AI',
    subtitle: 'Brain Tumor Detection & Segmentation',
    description: 'Flask web app for AI-powered brain-scan analysis, patient management, and consultation tools.',
    proof: 'YOLOv11 MRI segmentation + LLM diagnostic summaries',
    details: 'A comprehensive medical assistant web application for brain-tumor patients: AI-powered brain-scan analysis with YOLOv11 real-time MRI segmentation, patient management, and medical consultation tools, plus LLM-generated diagnostic summaries.',
    links: [
      { label: 'GitHub', url: 'https://github.com/shahriar-hd/brain-scan-ai' },
      { label: 'Demo', url: 'https://shahriar-hd.github.io/brain-scan-ai/' },
      { label: 'Model', url: 'https://huggingface.co/shahriarhd/brain-scan-ai-yolov11-seg' }
    ]
  },
  {
    name: 'RoboticArm',
    language: 'Jupyter Notebook',
    label: 'Robotics · IoT',
    subtitle: 'AI-Powered Robotic Arm',
    description: 'Arduino arm with real-time YOLO detection of electronic components, controlled over Bluetooth.',
    proof: 'YOLO detection + Arduino control over Bluetooth',
    details: 'An intelligent robotic arm system integrating Computer Vision (YOLO) with an Arduino to detect and manipulate electronic components via Bluetooth — bridging software perception with physical actuation.',
    links: [{ label: 'GitHub', url: 'https://github.com/shahriar-hd/RoboticArm' }]
  },
  {
    name: 'english-app',
    language: 'Python',
    label: 'Cross-platform app',
    subtitle: 'English Learning App',
    description: 'Flet app for practicing English through CS research-paper abstracts fetched live from arXiv.',
    proof: 'Flet · live arXiv abstracts',
    details: 'A cross-platform Flet application for practicing English through Computer Science research-paper abstracts fetched live from the arXiv API — combining language practice with real technical reading.',
    links: [{ label: 'GitHub', url: 'https://github.com/shahriar-hd/english-app' }]
  }
];

const PINNED_MAP = {};
PINNED_FALLBACK.forEach(function (r) { PINNED_MAP[r.name.toLowerCase()] = r; });

/* ---------------- Helpers ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function repoUrl(r) {
  return r.url || r.html_url || ('https://github.com/' + USER + '/' + r.name);
}

async function getJSON(url, timeoutMs) {
  const ctrl = new AbortController();
  const t = setTimeout(function () { ctrl.abort(); }, timeoutMs || 8000);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { 'Accept': 'application/vnd.github+json' } });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return await res.json();
  } finally {
    clearTimeout(t);
  }
}

/* ---------------- Pinned repositories ---------------- */
function cardHTML(repo) {
  const meta = PINNED_MAP[repo.name.toLowerCase()] || {};
  const label = meta.label || 'Repository';
  const subtitle = meta.subtitle || '';
  const description = meta.description || repo.description || 'No description';
  const proof = meta.proof || '';
  const primary = (meta.links || []).find(function (l) { return l.label === 'Demo'; }) ||
                  (meta.links || []).find(function (l) { return l.label === 'GitHub'; }) ||
                  { label: 'GitHub', url: repoUrl(repo) };

  return (
    '<article class="project-card">' +
      '<div class="project-content">' +
        '<p class="card-label">' + esc(label) + '</p>' +
        '<h3><a href="' + esc(repoUrl(repo)) + '" target="_blank" rel="noopener">' + esc(repo.name) + '</a></h3>' +
        (subtitle ? '<p class="project-subtitle">' + esc(subtitle) + '</p>' : '') +
        '<p class="project-description">' + esc(description) + '</p>' +
        (proof ? '<p class="project-proof">' + esc(proof) + '</p>' : '') +
        '<div class="button-row">' +
          '<button class="details-btn" type="button" data-repo="' + esc(repo.name) + '">Details</button>' +
          '<a class="text-link" href="' + esc(primary.url) + '" target="_blank" rel="noopener">' + esc(primary.label) + '</a>' +
        '</div>' +
      '</div>' +
    '</article>'
  );
}

async function renderPinned() {
  const container = document.getElementById('pinned-repos');
  if (!container) return;

  let repos = null;
  try {
    const data = await getJSON('https://pinned.berrysauce.dev/get/' + USER, 8000);
    if (Array.isArray(data) && data.length) {
      repos = data.map(function (r) {
        return { name: r.name || '', url: repoUrl(r), description: r.description || '', language: r.language || '' };
      });
    }
  } catch (e) { repos = null; }

  if (!repos) repos = PINNED_FALLBACK.map(function (r) { return { name: r.name }; });

  container.innerHTML = repos.map(cardHTML).join('');
  container.addEventListener('click', function (ev) {
    const btn = ev.target.closest('.details-btn');
    if (btn) openModal(btn.dataset.repo);
  });
}

/* ---------------- Other repositories + last worked on ---------------- */
async function renderOtherRepos() {
  const rail = document.getElementById('other-repos');
  const lastEl = document.getElementById('last-worked');

  let repos;
  try {
    repos = await getJSON('https://api.github.com/users/' + USER + '/repos?per_page=100&sort=updated', 8000);
  } catch (e) {
    if (rail) rail.innerHTML = '<p class="fallback">Repository list temporarily unavailable. <a class="text-link" href="https://github.com/' + USER + '" target="_blank" rel="noopener">View on GitHub</a></p>';
    if (lastEl) lastEl.textContent = 'Recent activity unavailable.';
    return;
  }
  if (!Array.isArray(repos)) repos = [];

  const others = repos.filter(function (r) {
    return !r.fork && !PINNED_MAP[r.name.toLowerCase()];
  }).sort(function (a, b) { return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0); });

  if (rail) {
    rail.innerHTML = others.length
      ? others.map(function (r) {
          return '<a class="rail-box" href="' + esc(r.html_url) + '" target="_blank" rel="noopener">' + esc(r.name) + '</a>';
        }).join('')
      : '<p class="fallback">No other public repositories.</p>';
  }

  if (lastEl) {
    const latest = repos.slice().sort(function (a, b) { return new Date(b.pushed_at || 0) - new Date(a.pushed_at || 0); })[0];
    if (latest) {
      const when = latest.pushed_at
        ? new Date(latest.pushed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
        : '';
      lastEl.innerHTML = '<a class="text-link" href="' + esc(latest.html_url) + '" target="_blank" rel="noopener">' + esc(latest.name) + '</a>' + (when ? ' · ' + esc(when) : '');
    } else {
      lastEl.textContent = 'Recent activity unavailable.';
    }
  }
}

/* ---------------- Modal ---------------- */
let lastFocused = null;

function openModal(name) {
  const modal = document.getElementById('modal');
  if (!modal) return;
  const meta = PINNED_MAP[(name || '').toLowerCase()] || { name: name, links: [{ label: 'GitHub', url: 'https://github.com/' + USER + '/' + name }] };

  lastFocused = document.activeElement;
  modal.querySelector('.modal-label').textContent = meta.label || 'Repository';
  document.getElementById('modal-title').textContent = meta.name || name || '';
  modal.querySelector('.modal-subtitle').textContent = meta.subtitle || '';
  modal.querySelector('.modal-desc').textContent = meta.details || meta.description || 'No description.';
  const metric = modal.querySelector('.modal-metric');
  metric.textContent = meta.proof || '';
  metric.hidden = !meta.proof;

  const actions = modal.querySelector('.modal-actions');
  actions.innerHTML = (meta.links || []).map(function (l) {
    const cls = l.label === 'GitHub' ? 'button button-primary' : 'button button-secondary';
    return '<a class="' + cls + '" href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label) + '</a>';
  }).join('');

  const metaDl = modal.querySelector('.modal-meta');
  metaDl.innerHTML = '<dt>Stats</dt><dd>Loading…</dd>';
  fetchRepoDetails(name, metaDl);

  modal.hidden = false;
  modal.setAttribute('aria-hidden', 'false');
  const closeBtn = modal.querySelector('.modal-close');
  if (closeBtn) closeBtn.focus();
}

async function fetchRepoDetails(name, dl) {
  if (!name) return;
  try {
    const r = await getJSON('https://api.github.com/repos/' + USER + '/' + name, 8000);
    const rows = [['Stars', r.stargazers_count != null ? r.stargazers_count : '—'],
                  ['Forks', r.forks_count != null ? r.forks_count : '—'],
                  ['Language', r.language || '—']];
    if (r.topics && r.topics.length) rows.push(['Topics', r.topics.join(', ')]);
    if (r.pushed_at) rows.push(['Last push', new Date(r.pushed_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })]);
    dl.innerHTML = rows.map(function (row) {
      return '<dt>' + esc(row[0]) + '</dt><dd>' + esc(row[1]) + '</dd>';
    }).join('');
  } catch (e) {
    dl.innerHTML = '<dt>Stats</dt><dd>Unavailable</dd>';
  }
}

function closeModal() {
  const modal = document.getElementById('modal');
  if (!modal || modal.hidden) return;
  modal.hidden = true;
  modal.setAttribute('aria-hidden', 'true');
  if (lastFocused && lastFocused.focus) lastFocused.focus();
}

function initModal() {
  const modal = document.getElementById('modal');
  if (!modal) return;
  modal.addEventListener('click', function (ev) { if (ev.target.closest('[data-close-modal]')) closeModal(); });
  document.addEventListener('keydown', function (ev) { if (ev.key === 'Escape') closeModal(); });
}

/* ---------------- Live stats + count-up ---------------- */
function setStat(key, value) {
  if (typeof value !== 'number' || !isFinite(value) || value <= 0) return;
  const el = document.querySelector('.stat-num[data-source="' + key + '"]');
  if (el) el.dataset.countTo = String(Math.round(value));
}

async function loadLiveStats() {
  const jobs = [
    getJSON('https://api.github.com/users/' + USER, 8000).then(function (d) { setStat('repos', d.public_repos); }).catch(function () {}),
    getJSON('https://api.github.com/search/commits?q=author:' + USER + '&per_page=1', 8000).then(function (d) { setStat('commits', d.total_count); }).catch(function () {}),
    getJSON('https://api.github.com/search/issues?q=author:' + USER + '+type:pr&per_page=1', 8000).then(function (d) { setStat('prs', d.total_count); }).catch(function () {})
  ];
  await Promise.race([Promise.allSettled(jobs), new Promise(function (r) { setTimeout(r, 4000); })]);
}

function animateCount(el, target, suffix, duration) {
  const start = performance.now();
  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = Math.round(target * eased) + suffix;
    if (t < 1) requestAnimationFrame(frame);
    else el.textContent = target + suffix;
  }
  requestAnimationFrame(frame);
}

function initCounters() {
  const nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      obs.unobserve(el);
      const target = parseInt(el.dataset.countTo, 10);
      if (!isFinite(target)) return;
      animateCount(el, target, el.dataset.suffix || '', 1200);
    });
  }, { threshold: 0.4 });
  nums.forEach(function (el) { obs.observe(el); });
}

/* ---------------- Section reveal + nav ---------------- */
function initReveal() {
  const sections = document.querySelectorAll('.section:not(.hero)');
  if (!sections.length) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sections.forEach(function (s) { s.classList.add('visible'); });
    return;
  }
  const obs = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) { entry.target.classList.add('visible'); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  sections.forEach(function (s) { obs.observe(s); });
}

function initNav() {
  const header = document.querySelector('[data-header]');
  const nav = document.querySelector('[data-site-nav]');
  const toggle = document.querySelector('[data-nav-toggle]');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('nav-open', open);
    });
    nav.addEventListener('click', function (ev) {
      if (ev.target.tagName === 'A') { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.classList.remove('nav-open'); }
    });
  }

  const links = Array.prototype.slice.call(document.querySelectorAll('.site-nav a[href^="#"]'));
  const map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });

  const hero = document.querySelector('.hero');
  const about = document.getElementById('about');
  const contact = document.getElementById('contact');
  const footer = document.querySelector('.site-footer');

  function setActive(id) {
    links.forEach(function (a) { a.classList.remove('active'); });
    if (map[id]) map[id].classList.add('active');
  }

  function onScroll() {
    const y = window.scrollY || window.pageYOffset;
    const bottom = y + window.innerHeight;

    // Disable nav hover while in the hero / about region
    const aboutEnd = (about ? about.offsetTop + about.offsetHeight : 0);
    if (header) header.classList.toggle('at-top', y < aboutEnd - window.innerHeight * 0.5);

    // Bottom of page → always highlight Contact
    if (bottom >= document.documentElement.scrollHeight - 4) { setActive('contact'); return; }

    // Contact section is short; use its midpoint band
    if (contact) {
      const cTop = contact.offsetTop - window.innerHeight * 0.5;
      if (y >= cTop) { setActive('contact'); return; }
    }

    // Otherwise pick the last section whose top passed the nav line
    let current = null;
    links.forEach(function (a) {
      const id = a.getAttribute('href').slice(1);
      const el = document.getElementById(id);
      if (el && el.offsetTop - 140 <= y) current = id;
    });
    if (current) setActive(current);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const top = document.querySelector('[data-back-to-top]');
  if (top) top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
}

/* ---------------- Boot ---------------- */
async function boot() {
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  initModal();
  initNav();
  initReveal();
  renderPinned();
  renderOtherRepos();

  await loadLiveStats();
  initCounters();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
else boot();
