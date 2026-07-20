/* ============================================================
   SEAL — main.js
   Shared across every page.
   ============================================================ */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => Array.from(el.querySelectorAll(sel));

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str ?? '';
  return div.innerHTML;
}

function initials(name) {
  return name.split(' ').filter(Boolean).map(w => w[0]).slice(0, 2).join('').toUpperCase();
}

async function loadPartial(url, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to load ${url}`);
    container.innerHTML = await res.text();
  } catch (err) {
    console.error(err);
  }
}

function setActiveNav() {
  const page = document.body.dataset.page;
  $$('.nav-links a').forEach(a => {
    if (a.dataset.nav === page) a.classList.add('active');
  });
}

async function loadData() {
  const res = await fetch('data.json');
  if (!res.ok) throw new Error('Failed to load data.json');
  return res.json();
}

/* ---------- shared header/footer fill ---------- */
function renderShared(lab) {
  const email = $('#footer-email');
  if (email) { email.textContent = lab.email; email.href = `mailto:${lab.email}`; }
  
  const uni = $('#footer-university');
  if (uni) uni.textContent = lab.university;
  
  const labName = $('#footer-lab-name');
  if (labName) labName.textContent = lab.name;
  
  const desc = $('#footer-desc');
  if (desc) desc.textContent = `${lab.fullName} — ${lab.tagline}`;
  
  const copyright = $('#footer-copyright');
  if (copyright) copyright.textContent = `© ${new Date().getFullYear()} ${lab.name}`;
}

/* ---------- Publications Teaser (New) ---------- */
function pubTeaserHTML(pub) {
  return `
    <div class="pub-item">
      <div class="pub-year mono">${escapeHTML(pub.year)}</div>
      <div>
        <div class="pub-title">${escapeHTML(pub.title)}</div>
        <div class="pub-authors">${escapeHTML(pub.authors)}</div>
        <div class="pub-venue">${escapeHTML(pub.venue)}</div>
      </div>
    </div>`;
}

/* ---------- home page ---------- */
function renderHome(data) {
  const { lab, focusAreas, members, projects, publications, news } = data;

  // Hero
  const heroLede = $('#hero-lede');
  if (heroLede) heroLede.textContent = lab.tagline;

  const heroTag = $('#hero-university');
  if (heroTag) heroTag.textContent = lab.university;

  // Mission
  const mission = $('#about-mission');
  if (mission) mission.textContent = lab.mission;

  // Focus Areas
  const focusGrid = $('#focus-grid');
  if (focusGrid) {
    focusGrid.innerHTML = focusAreas.map((a, i) => `
      <div class="focus-card">
        <span class="focus-index mono">FA-${String(i + 1).padStart(2, '0')}</span>
        <h4>${escapeHTML(a)}</h4>
      </div>`).join('');
  }

  // Director Teaser
  const director = members.faculty[0];
  const directorEl = $('#director-teaser');
  if (directorEl && director) {
    directorEl.innerHTML = `
      <div class="member-card">
        <div class="avatar">${escapeHTML(initials(director.name))}</div>
        <div class="member-info">
          <div class="name">${escapeHTML(director.name)}</div>
          <div class="role">${escapeHTML(director.role)}</div>
        </div>
      </div>`;
  }

  // Team Count
  const teamCount = $('#team-count');
  if (teamCount) {
    const total = members.faculty.length + members.researchAssistants.length;
    teamCount.textContent = `+ ${total - 1} more researchers across faculty and research assistants`;
  }

  // Projects Teaser
  const projTeaser = $('#project-teaser-grid');
  if (projTeaser) {
    projTeaser.innerHTML = projects.slice(0, 3).map(p => `
      <div class="teaser-card">
        <span class="project-status ${p.status === 'Completed' ? 'completed' : ''}">${escapeHTML(p.status)}</span>
        <h4>${escapeHTML(p.title)}</h4>
        <p>${escapeHTML(p.description.slice(0, 110))}${p.description.length > 110 ? '…' : ''}</p>
      </div>`).join('');
  }

  // Publications Teaser (New)
  const pubTeaser = $('#pub-teaser-list');
  if (pubTeaser && publications) {
    const recentPubs = [...publications]
      .sort((a, b) => Number(b.year) - Number(a.year))
      .slice(0, 3);
    
    pubTeaser.innerHTML = recentPubs.map(pubTeaserHTML).join('');
  }

  // News Teaser
  const newsTeaser = $('#news-teaser-list');
  if (newsTeaser) {
    const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 3);
    newsTeaser.innerHTML = sorted.map(newsItemHTML).join('');
  }
}

/* ---------- Other page renderers (unchanged) ---------- */
function memberCardHTML(member) {
  return `
    <div class="member-card">
      <div class="avatar">${escapeHTML(initials(member.name))}</div>
      <div class="member-info">
        <div class="name">${escapeHTML(member.name)}</div>
        <div class="role">${escapeHTML(member.role)}</div>
      </div>
    </div>`;
}

function renderMembers(members) {
  const facultyGrid = $('#faculty-grid');
  const raGrid = $('#ra-grid');
  if (facultyGrid) facultyGrid.innerHTML = members.faculty.map(memberCardHTML).join('');
  if (raGrid) raGrid.innerHTML = members.researchAssistants.map(memberCardHTML).join('');
}

function projectCardHTML(project, idx) {
  const demoDisabled = !project.demoUrl;
  const githubDisabled = !project.githubUrl;
  return `
    <div class="project-card" data-idx="${idx}">
      <span class="project-status ${project.status === 'Completed' ? 'completed' : ''}">${escapeHTML(project.status)}</span>
      <h3 tabindex="0" role="button" aria-expanded="false">${escapeHTML(project.title)}</h3>
      <div class="project-desc">${escapeHTML(project.description)}</div>
      <div class="project-actions">
        <a class="btn btn-primary btn-small" ${demoDisabled ? 'aria-disabled="true"' : ''} href="${demoDisabled ? '#' : escapeHTML(project.demoUrl)}" target="${demoDisabled ? '_self' : '_blank'}" rel="noopener" ${demoDisabled ? 'onclick="return false;"' : ''}>Demo</a>
        <a class="btn btn-outline btn-small" ${githubDisabled ? 'aria-disabled="true"' : ''} href="${githubDisabled ? '#' : escapeHTML(project.githubUrl)}" target="${githubDisabled ? '_self' : '_blank'}" rel="noopener" ${githubDisabled ? 'onclick="return false;"' : ''}>GitHub</a>
      </div>
    </div>`;
}

function renderProjects(projects) {
  const grid = $('#project-grid');
  if (!grid) return;
  grid.innerHTML = projects.map((project, idx) => projectCardHTML(project, idx)).join('');
  // Toggle functionality...
  $$('.project-card h3').forEach(title => {
    const toggle = () => {
      const card = title.closest('.project-card');
      const isOpen = card.classList.toggle('open');
      title.setAttribute('aria-expanded', String(isOpen));
    };
    title.addEventListener('click', toggle);
    title.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
  });
}

function pubItemHTML(pub) {
  const hasPdf = !!pub.pdfUrl;
  const hasDoi = !!pub.doiUrl;
  return `
    <div class="pub-item">
      <div class="pub-year mono">${escapeHTML(pub.year)}</div>
      <div>
        <div class="pub-title">${escapeHTML(pub.title)}</div>
        <div class="pub-authors">${escapeHTML(pub.authors)}</div>
        <div class="pub-venue">${escapeHTML(pub.venue)}</div>
      </div>
      <div class="pub-links">
        ${hasPdf ? `<a class="btn btn-outline btn-small" href="${escapeHTML(pub.pdfUrl)}" target="_blank" rel="noopener">PDF</a>` : ''}
        ${hasDoi ? `<a class="btn btn-outline btn-small" href="${escapeHTML(pub.doiUrl)}" target="_blank" rel="noopener">DOI</a>` : ''}
      </div>
    </div>`;
}

function renderPublications(pubs) {
  const list = $('#pub-list');
  if (!list) return;
  const sorted = [...pubs].sort((a, b) => Number(b.year) - Number(a.year));
  list.innerHTML = sorted.map(pubItemHTML).join('');
}

function newsItemHTML(item) {
  const date = new Date(item.date);
  const formatted = isNaN(date) ? item.date : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  return `
    <div class="news-item">
      <div class="news-date">${escapeHTML(formatted)}</div>
      <div class="news-text">${escapeHTML(item.text)}</div>
    </div>`;
}

function renderNews(news) {
  const list = $('#news-list');
  if (!list) return;
  const sorted = [...news].sort((a, b) => new Date(b.date) - new Date(a.date));
  list.innerHTML = sorted.map(newsItemHTML).join('');
}

function renderContact(lab) {
  const email = $('#contact-email');
  if (email) { email.textContent = lab.email; email.href = `mailto:${lab.email}`; }
  
  const addr = $('#contact-address-detail');
  if (addr) addr.textContent = lab.address;

  const iframe = $('#map-iframe');
  if (iframe) {
    const { lat, lng } = lab.mapCoordinates;
    iframe.src = `https://maps.google.com/maps?q=${lat},${lng}&z=16&output=embed`;
    iframe.title = `Map showing ${lab.name} location`;
  }

  const form = $('#contact-form');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const name = $('#cf-name').value.trim();
      const email2 = $('#cf-email').value.trim();
      const message = $('#cf-message').value.trim();
      const subject = encodeURIComponent(`Website inquiry from ${name}`);
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email2})`);
      window.location.href = `mailto:${lab.email}?subject=${subject}&body=${body}`;
    });
  }
}

/* ---------- Nav & UI ---------- */
function initNavToggle() {
  const toggle = $('#nav-toggle');
  const links = $('#nav-links');
  if (!toggle || !links) return;
  toggle.addEventListener('click', () => {
    const isOpen = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  $$('#nav-links a').forEach(a => a.addEventListener('click', () => links.classList.remove('open')));
}

function initDividers() {
  const tpl = document.getElementById('kinematic-template');
  if (!tpl) return;
  $$('.kd-slot').forEach(slot => slot.appendChild(tpl.content.cloneNode(true)));
}

async function init() {
  await Promise.all([
    loadPartial('header.html', 'header-slot'),
    loadPartial('footer.html', 'footer-slot')
  ]);

  setActiveNav();
  initNavToggle();
  initDividers();

  try {
    const data = await loadData();
    renderShared(data.lab);
    renderHome(data);
    renderMembers(data.members);
    renderProjects(data.projects);
    renderPublications(data.publications);
    renderNews(data.news);
    renderContact(data.lab);
  } catch (err) {
    console.error(err);
    const main = $('main');
    if (main) {
      const notice = document.createElement('div');
      notice.style.cssText = 'padding:40px;text-align:center;font-family:monospace;color:#FF8A3D;';
      notice.textContent = 'Could not load data.json. Please run a local server.';
      main.prepend(notice);
    }
  }
}

document.addEventListener('DOMContentLoaded', init);