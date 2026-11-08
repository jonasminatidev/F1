/* ==========================================================================
   GRID 26 — Application Logic & SPA Routing
   Refactored under Hallmark & Impeccable Anti-AI-Slop Laws
   ========================================================================== */

const app = document.getElementById("app");
const wipe = document.getElementById("wipe");
const progressBar = document.getElementById("progress");
const nav = document.getElementById("nav");
const root = document.documentElement;

const ARROW_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

const ICONS = {
  engine: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M16 16l6-6"/><path d="m8 8 3-3a2.12 2.12 0 1 1 3 3L11 11"/><path d="m9 13 2 2"/><path d="m13 9 2 2"/></svg>`,
  aero: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.7 7.7A7.5 7.5 0 0 0 5 12a7.5 7.5 0 0 0 12.7 4.3"/><path d="M22 12h-4"/><path d="M12 2v4"/><path d="M12 18v4"/></svg>`,
  grid: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/></svg>`
};

/* ==========================================================================
   VIEW BUILDERS
   ========================================================================== */

function teamCard(t) {
  return `
  <article class="team-card rv" data-pu="${t.pu}" style="--team-accent:${t.color}; --team-accent-muted:${t.color}22; --team-accent-border:${t.color}55;">
    <div class="team-card-head">
      <div>
        <h3 class="team-card-title">${t.name}</h3>
        <p class="team-card-pu">Unidade de potência: ${t.pu}</p>
      </div>
      <img class="team-card-logo" src="${logo(t.k)}" alt="" loading="lazy" />
    </div>
    <div class="team-card-visual">
      <img class="team-card-car" src="${car(t.k)}" alt="Monoposto 2026 da equipe ${t.name}" loading="lazy" />
    </div>
    <div class="team-card-foot">
      <div class="team-card-drivers">${t.drivers.map((d) => d.name).join(" e ")}</div>
      <a class="team-card-link-label" href="#/equipe/${t.id}" aria-label="Ver detalhes de ${t.name}">
        Dossiê ${ARROW_SVG}
      </a>
    </div>
  </article>`;
}

function homeView() {
  const marqueeItems = [...TEAMS, ...TEAMS].map((t) => `<img class="marquee-item" src="${logo(t.k)}" alt="${t.name}" />`).join("");
  const totalWcc = TEAMS.reduce((acc, t) => acc + t.wcc, 0);

  return `
  <div class="view">
    <section class="hero container">
      <div class="hero-video" id="heroVideo">
        <video autoplay muted loop playsinline preload="auto" poster="assets/video/hero-poster.jpg" aria-hidden="true">
          <source src="assets/video/hero.mp4" type="video/mp4" />
        </video>
      </div>

      <div class="hero-content">
        <span class="hero-label">Campeonato Mundial FIA de Fórmula 1 · 2026</span>
        <h1>11 construtores. O novo regulamento técnico.</h1>
        <p class="lead">Uma análise completa dos carros, motores híbridos de nova geração e formações de pilotos para a maior renovação técnica em décadas.</p>
        <div class="hero-actions">
          <a class="btn btn-primary" href="#/equipes">Explorar todas as 11 equipes ${ARROW_SVG}</a>
          <a class="btn btn-secondary" href="#/equipe/ferrari">Ver Scuderia Ferrari</a>
        </div>
      </div>
    </section>

    <div class="marquee" aria-hidden="true">
      <div class="marquee-track">${marqueeItems}</div>
    </div>

    <!-- Pilares Técnicos 2026 (sem ícones de emoji, com SVGs de engenharia) -->
    <section class="section container">
      <div class="section-header rv">
        <h2>Principais alterações regulamentares</h2>
        <p>A transição de 2026 redefiniu os parâmetros de chassi, unidade de potência e aerodinâmica da categoria máxima.</p>
      </div>

      <div class="tech-grid">
        <article class="tech-card rv">
          <div class="tech-card-icon">${ICONS.engine}</div>
          <h3>Eletrificação ampliada (50/50)</h3>
          <p>O MGU-H foi eliminado em favor de uma bateria MGU-K de 350 kW, alcançando paridade de potência entre o motor a combustão e a propulsão elétrica sustentável.</p>
        </article>

        <article class="tech-card rv">
          <div class="tech-card-icon">${ICONS.aero}</div>
          <h3>Aerodinâmica ativa no chassi</h3>
          <p>Asas dianteiras e traseiras com perfis móveis operam em modo Z (maior downforce em curvas) e modo X (baixo arrasto em retas), substituindo o DRS tradicional.</p>
        </article>

        <article class="tech-card rv">
          <div class="tech-card-icon">${ICONS.grid}</div>
          <h3>Grid ampliado para 11 equipes</h3>
          <p>A chegada da Audi como equipe de fábrica e a entrada da Cadillac compõem o grid mais amplo e competitivo visto na Fórmula 1 nos últimos dez anos.</p>
        </article>
      </div>
    </section>

    <!-- Tabela Editorial de Construtores (sem contadores saltitantes artificiais) -->
    <section class="section container" style="padding-top: 0;">
      <div class="section-header rv">
        <h2>Quadro geral de construtores</h2>
        <p>Visão comparativa das 11 equipes inscritas no campeonato, motores e histórico acumulado (${totalWcc} títulos somados de construtores).</p>
      </div>

      <div class="championship-table-wrap rv">
        <table class="championship-table">
          <thead>
            <tr>
              <th>Equipe</th>
              <th>Sede</th>
              <th>Fornecedor de Motor</th>
              <th>Pilotos 2026</th>
              <th>Títulos de Construtores</th>
            </tr>
          </thead>
          <tbody>
            ${TEAMS.map((t) => `
            <tr>
              <td>
                <a class="table-team-cell" href="#/equipe/${t.id}">
                  <span class="team-swatch" style="background-color: ${t.color}"></span>
                  <span>${t.name}</span>
                </a>
              </td>
              <td>${t.base}</td>
              <td>${t.pu}</td>
              <td>${t.drivers.map((d) => d.name).join(", ")}</td>
              <td><strong>${t.wcc > 0 ? t.wcc : "—"}</strong></td>
            </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </section>

    <!-- Quatro equipes em destaque -->
    <section class="section container" style="padding-top: 0;">
      <div class="section-header rv" style="display: flex; justify-content: space-between; align-items: flex-end; flex-wrap: wrap; gap: 20px;">
        <div>
          <h2>Equipes em foco</h2>
          <p>Destaques do pelotão de frente e as duas novas operações de fábrica.</p>
        </div>
        <a class="btn btn-secondary" href="#/equipes">Ver lista completa ${ARROW_SVG}</a>
      </div>

      <div class="team-grid">
        ${["ferrari", "mclaren", "audi", "cadillac"].map((id) => {
          const t = TEAMS.find((team) => team.id === id);
          return teamCard(t);
        }).join("")}
      </div>
    </section>
  </div>`;
}

function teamsView() {
  const puList = ["Todas", ...new Set(TEAMS.map((t) => t.pu))];

  return `
  <div class="view">
    <header class="section container" style="padding-top: 140px; padding-bottom: 24px;">
      <div class="section-header">
        <h1>As 11 equipes do grid 2026</h1>
        <p>Acesse a ficha técnica individual, dados dos pilotos titulares e o monoplaza de cada construtor para a temporada.</p>
      </div>

      <div class="filter-bar" id="filterBar" role="tablist" aria-label="Filtrar por motor">
        ${puList.map((pu, i) => `
          <button class="filter-btn ${i === 0 ? "active" : ""}" data-pu-filter="${pu}" role="tab" aria-selected="${i === 0}">
            ${pu === "Todas" ? "Todas as equipes" : "Motor " + pu}
          </button>`).join("")}
      </div>
    </header>

    <section class="section container" style="padding-top: 0;">
      <div class="team-grid" id="teamsContainer">
        ${TEAMS.map(teamCard).join("")}
      </div>
    </section>
  </div>`;
}

function teamView(t) {
  const currentIndex = TEAMS.indexOf(t);
  const nextTeam = TEAMS[(currentIndex + 1) % TEAMS.length];
  const debutYears = new Date().getFullYear() - t.debut;

  return `
  <div class="view" style="--team-accent:${t.color}; --team-accent-muted:${t.color}22; --team-accent-border:${t.color}55;">
    <!-- Topo da Equipe -->
    <header class="team-header">
      <div class="container">
        <a class="team-back-link" href="#/equipes">← Retornar à lista de equipes</a>
        
        <div class="team-header-grid">
          <div>
            <div class="team-identity">
              <img class="team-header-logo" src="${logo(t.k)}" alt="" />
              <span class="team-badge">Construtor Oficial 2026</span>
            </div>
            <h1>${t.name}</h1>
            <p class="team-tagline">${t.tagline}</p>
          </div>

          <div class="team-car-stage">
            <img src="${car(t.k)}" alt="Monoposto 2026 da ${t.name}" />
          </div>
        </div>
      </div>
    </header>

    <!-- Dossiê Técnico e Histórico -->
    <section class="section container">
      <div class="dossier-grid">
        <div class="dossier-narrative rv">
          <div class="section-header">
            <h2>História e estrutura técnica</h2>
          </div>
          ${t.desc.map((par) => `<p>${par}</p>`).join("")}
        </div>

        <div class="dossier-specs rv">
          <div class="section-header">
            <h2>Ficha técnica</h2>
          </div>
          <ul class="spec-list">
            <li class="spec-item"><span>Sede técnica</span><strong>${t.base}</strong></li>
            <li class="spec-item"><span>Chefe de equipe</span><strong>${t.principal}</strong></li>
            <li class="spec-item"><span>Unidade de potência</span><strong>${t.pu}</strong></li>
            <li class="spec-item"><span>Estreia oficial</span><strong>${t.debut} (${debutYears > 0 ? debutYears + " anos" : "Estreante"})</strong></li>
            <li class="spec-item"><span>Títulos de construtores</span><strong>${t.wcc}</strong></li>
            <li class="spec-item"><span>Títulos de pilotos</span><strong>${t.wdc}</strong></li>
          </ul>
        </div>
      </div>
    </section>

    <!-- Pilotos Titulares -->
    <section class="section container" style="padding-top: 0;">
      <div class="section-header rv">
        <h2>Linha de pilotos</h2>
        <p>Os dois pilotos titulares escalados para a temporada 2026.</p>
      </div>

      <div class="driver-roster">
        ${t.drivers.map((d) => `
        <article class="driver-card rv">
          <div class="driver-visual">
            <img src="${drv(t.k, d.id)}" alt="Piloto titular ${d.name}" loading="lazy" />
          </div>
          <div class="driver-meta">
            <div class="driver-number">#${d.n}</div>
            <h3>${d.name}</h3>
            <span class="driver-country">${d.country}</span>
          </div>
        </article>`).join("")}
      </div>
    </section>

    <!-- Registro Fotográfico na Pista -->
    <section class="section container" style="padding-top: 0;">
      <div class="section-header rv">
        <h2>Registro em pista</h2>
        <p>Fotografia oficial do carro em testes e sessões da temporada.</p>
      </div>

      <figure class="track-photo-frame rv">
        <img src="assets/photos/${t.id}.jpg" alt="Foto do carro da ${t.name} em pista durante a temporada 2026" loading="lazy" />
        <figcaption class="track-photo-caption">${t.name} · Temporada 2026</figcaption>
      </figure>
    </section>

    <!-- Próximo Construtor -->
    <a class="next-constructor-nav" href="#/equipe/${nextTeam.id}" style="--team-accent:${nextTeam.color};">
      <div class="next-constructor-inner">
        <div>
          <span class="next-label">Próxima equipe</span>
          <div class="next-title">${nextTeam.name}</div>
        </div>
        <div>${ARROW_SVG}</div>
      </div>
    </a>
  </div>`;
}

/* ==========================================================================
   PAGE LIFECYCLE & ROUTING
   ========================================================================== */

const activeObservers = [];

function registerRevealObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("on");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  app.querySelectorAll(".rv:not(.on)").forEach((element) => observer.observe(element));
  activeObservers.push(observer);
}

function initHome() {
  root.style.setProperty("--team-accent", "#e10600");
  const videoBox = document.getElementById("heroVideo");
  if (videoBox) {
    const video = videoBox.querySelector("video");
    if (video) {
      if (video.readyState >= 3) {
        videoBox.classList.add("ready");
      } else {
        video.addEventListener("canplay", () => videoBox.classList.add("ready"), { once: true });
      }
      video.play().catch(() => {});
    }
  }
}

function initTeams() {
  root.style.setProperty("--team-accent", "#e10600");
  const buttons = app.querySelectorAll(".filter-btn");
  const cards = app.querySelectorAll("#teamsContainer .team-card");

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      button.classList.add("active");
      button.setAttribute("aria-selected", "true");

      const filterValue = button.dataset.puFilter;
      cards.forEach((card) => {
        if (filterValue === "Todas" || card.dataset.pu === filterValue) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });
}

function initTeam(t) {
  root.style.setProperty("--team-accent", t.color);
}

function parseRoute() {
  const hash = location.hash.replace(/^#\/?/, "");
  const [segment, param] = hash.split("/");
  if (segment === "equipes") return { page: "equipes" };
  if (segment === "temporada") return { page: "temporada" };
  if (segment === "equipe") {
    const team = TEAMS.find((x) => x.id === param);
    if (team) return { page: "equipe", team };
  }
  return { page: "home" };
}

function render() {
  // Desconectar observers anteriores
  activeObservers.splice(0).forEach((obs) => obs.disconnect());
  teardownSeason();

  const route = parseRoute();
  window.scrollTo(0, 0);

  if (route.page === "home") {
    app.innerHTML = homeView();
    initHome();
  } else if (route.page === "temporada") {
    app.innerHTML = seasonView();
    initSeason();
  } else if (route.page === "equipes") {
    app.innerHTML = teamsView();
    initTeams();
  } else {
    app.innerHTML = teamView(route.team);
    initTeam(route.team);
  }

  registerRevealObserver();

  // Atualizar classe ativa na navegação
  document.querySelectorAll(".nav a[data-nav]").forEach((link) => {
    const isHome = route.page === "home" && link.dataset.nav === "home";
    const isTeams = (route.page === "equipes" || route.page === "equipe") && link.dataset.nav === "equipes";
    const isSeason = route.page === "temporada" && link.dataset.nav === "temporada";
    link.classList.toggle("active", isHome || isTeams || isSeason);
  });

  // Atualizar título da aba
  if (route.page === "equipe") {
    document.title = `${route.team.name} — GRID 2026`;
  } else if (route.page === "temporada") {
    document.title = "Temporada: classificação, pódios e calendário — GRID 2026";
  } else if (route.page === "equipes") {
    document.title = "Equipes — GRID 2026";
  } else {
    document.title = "GRID 2026 — As 11 equipes da Fórmula 1";
  }
}

let isTransitioning = false;
let isInitialLoad = true;

function handleHashChange() {
  if (isInitialLoad) {
    isInitialLoad = false;
    render();
    return;
  }
  if (isTransitioning) return;
  isTransitioning = true;

  const route = parseRoute();
  wipe.style.backgroundColor = route.page === "equipe" ? route.team.color : "#e10600";
  wipe.className = "in";

  setTimeout(() => {
    render();
    wipe.className = "out";
    setTimeout(() => {
      wipe.className = "";
      wipe.removeAttribute("style");
      isTransitioning = false;
    }, 480);
  }, 420);
}

window.addEventListener("hashchange", handleHashChange);
handleHashChange();

/* ==========================================================================
   GLOBAL LISTENERS: SCROLL & PROGRESS BAR
   ========================================================================== */

window.addEventListener("scroll", () => {
  const currentScroll = window.scrollY;
  nav.classList.toggle("scrolled", currentScroll > 30);

  const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
  const progressPercent = scrollTotal > 0 ? (currentScroll / scrollTotal) * 100 : 0;
  progressBar.style.width = `${progressPercent}%`;
  progressBar.setAttribute("aria-valuenow", Math.round(progressPercent));
}, { passive: true });
