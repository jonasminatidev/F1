/* ==========================================================================
   GRID 26 — Aba "Temporada": classificação, pódios e calendário
   Fonte: Jolpica F1 API (sucessora da Ergast), sem chave e com CORS aberto.
   Cache: sessionStorage. Os dados ficam guardados enquanto a aba estiver
   aberta; recarregar a página NÃO consulta a API de novo.
   ========================================================================== */

const SEASON_API = "https://api.jolpi.ca/ergast/f1/current";
const SEASON_CACHE_KEY = "grid26:season:v2";
const SEASON_MAX_AGE = 6 * 60 * 60 * 1000; // aba aberta há mais de 6h → busca de novo

const SEASON_ICONS = {
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>`,
  prev: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>`,
  next: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>`
};

/* IDs da API → IDs locais em data.js */
const TEAM_ID_MAP = {
  red_bull: "red-bull-racing",
  rb: "racing-bulls",
  aston_martin: "aston-martin",
  sauber: "audi"
};

const GP_NAMES_PT = {
  "Australian Grand Prix": "GP da Austrália",
  "Chinese Grand Prix": "GP da China",
  "Japanese Grand Prix": "GP do Japão",
  "Bahrain Grand Prix": "GP do Bahrein",
  "Saudi Arabian Grand Prix": "GP da Arábia Saudita",
  "Miami Grand Prix": "GP de Miami",
  "Canadian Grand Prix": "GP do Canadá",
  "Monaco Grand Prix": "GP de Mônaco",
  "Barcelona Grand Prix": "GP de Barcelona",
  "Spanish Grand Prix": "GP da Espanha",
  "Austrian Grand Prix": "GP da Áustria",
  "British Grand Prix": "GP da Grã-Bretanha",
  "Belgian Grand Prix": "GP da Bélgica",
  "Hungarian Grand Prix": "GP da Hungria",
  "Dutch Grand Prix": "GP da Holanda",
  "Italian Grand Prix": "GP da Itália",
  "Emilia Romagna Grand Prix": "GP da Emília-Romanha",
  "Azerbaijan Grand Prix": "GP do Azerbaijão",
  "Singapore Grand Prix": "GP de Singapura",
  "United States Grand Prix": "GP dos Estados Unidos",
  "Mexico City Grand Prix": "GP da Cidade do México",
  "Brazilian Grand Prix": "GP de São Paulo",
  "São Paulo Grand Prix": "GP de São Paulo",
  "Las Vegas Grand Prix": "GP de Las Vegas",
  "Qatar Grand Prix": "GP do Catar",
  "Abu Dhabi Grand Prix": "GP de Abu Dhabi",
  "Bahrain Grand Prix in Malaysia": "GP do Bahrein (Malásia)"
};

const COUNTRIES_PT = {
  Australia: "Austrália", China: "China", Japan: "Japão", Bahrain: "Bahrein", "Saudi Arabia": "Arábia Saudita",
  USA: "Estados Unidos", "United States": "Estados Unidos", Canada: "Canadá", Monaco: "Mônaco", Spain: "Espanha",
  Austria: "Áustria", UK: "Reino Unido", Belgium: "Bélgica", Hungary: "Hungria", Netherlands: "Holanda",
  Italy: "Itália", Azerbaijan: "Azerbaijão", Singapore: "Singapura", Mexico: "México", Brazil: "Brasil",
  Qatar: "Catar", UAE: "Emirados Árabes", Malaysia: "Malásia"
};

const COUNTRY_FLAG_CODE = {
  Australia: "au", China: "cn", Japan: "jp", Bahrain: "bh", "Saudi Arabia": "sa",
  USA: "us", "United States": "us", Canada: "ca", Monaco: "mc", Spain: "es",
  Austria: "at", UK: "gb", Belgium: "be", Hungary: "hu", Netherlands: "nl",
  Italy: "it", Azerbaijan: "az", Singapore: "sg", Mexico: "mx", Brazil: "br",
  Qatar: "qa", UAE: "ae", Malaysia: "my"
};

const CIRCUIT_LENGTH_M = {
  albert_park: 5278, shanghai: 5451, suzuka: 5807, miami: 5412, villeneuve: 4361,
  monaco: 3337, catalunya: 4655, red_bull_ring: 4318, silverstone: 5891, spa: 7004,
  hungaroring: 4381, zandvoort: 4259, monza: 5793, madring: 5474, baku: 6003,
  sepang: 5543, marina_bay: 4928, americas: 5514, rodriguez: 4304, interlagos: 4309,
  vegas: 6201, losail: 5380, yas_marina: 5281, bahrain: 5412, jeddah: 6175, imola: 4909
};

const seasonState = {
  data: null,
  savedAt: 0,
  loading: null,
  error: null,
  podiumRound: null,
  standingsTab: "drivers",
  timer: null
};

/* ---------- utilitários ---------- */
const esc = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const normName = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const gpName = (name) => GP_NAMES_PT[name] || String(name).replace("Grand Prix", "GP");
const countryPt = (c) => COUNTRIES_PT[c] || c;
const fmtPts = (n) => new Intl.NumberFormat("pt-BR").format(n);
const kmFormat = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 3, maximumFractionDigits: 3 });

function circuitKm(circuitId) {
  const m = CIRCUIT_LENGTH_M[circuitId];
  return m ? `${kmFormat.format(m / 1000)} km` : "";
}

function flagImg(country, cls = "gp-flag") {
  const code = COUNTRY_FLAG_CODE[country];
  if (!code) return "";
  return `<img class="${cls}" src="assets/img/flags/${code}.svg" alt="Bandeira: ${esc(countryPt(country))}" loading="lazy" />`;
}

function circuitImg(circuitId, circuitName, cls = "track-map-img") {
  if (!circuitId || !CIRCUIT_LENGTH_M[circuitId]) return "";
  return `<img class="${cls}" src="assets/img/circuits/${esc(circuitId)}.svg" alt="Traçado da pista: ${esc(circuitName)}" loading="lazy" />`;
}

const dmFormat = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "short" });
const timeFormat = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
const weekdayFormat = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

function dayMonth(date) {
  const parts = dmFormat.formatToParts(date);
  const day = parts.find((p) => p.type === "day")?.value;
  const month = parts.find((p) => p.type === "month")?.value.replace(".", "");
  return `${day} ${month}`;
}
function sessionTime(date) {
  return `${weekdayFormat.format(date).replace(".", "")} ${dayMonth(date)} · ${timeFormat.format(date)}`;
}

function localTeam(apiId) {
  const id = TEAM_ID_MAP[apiId] || String(apiId).replace(/_/g, "-");
  return TEAMS.find((t) => t.id === id) || null;
}

function localDriver(family, number) {
  const target = normName(family);
  let byNumber = null;
  for (const team of TEAMS) {
    for (const d of team.drivers) {
      if (normName(d.name.split(" ").slice(-1)[0]) === target) return { ...d, team };
      if (number && String(d.n) === String(number)) byNumber = { ...d, team };
    }
  }
  return byNumber;
}

function teamColor(apiId) {
  return localTeam(apiId)?.color || "#7d8091";
}

function driverPhoto(p) {
  const local = localDriver(p.family, p.number);
  if (local) return `<img src="${drv(local.team.k, local.id)}" alt="" loading="lazy" />`;
  const initials = `${p.given?.[0] || ""}${p.family?.[0] || ""}`;
  return `<span class="photo-fallback">${esc(initials)}</span>`;
}

function driverDisplayName(p) {
  return localDriver(p.family, p.number)?.name || `${p.given} ${p.family}`;
}

/* ---------- busca e normalização ---------- */
async function getMRData(path) {
  const response = await fetch(`${SEASON_API}/${path}`, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`API respondeu ${response.status}`);
  return (await response.json()).MRData;
}

async function fetchSeason() {
  // Dois lotes de 3 para respeitar o limite de rajada da API (4 req/s).
  const [schedule, driverSt, constructorSt] = await Promise.all([
    getMRData("races.json?limit=100"),
    getMRData("driverStandings.json"),
    getMRData("constructorStandings.json")
  ]);
  const podiums = await Promise.all([1, 2, 3].map((pos) => getMRData(`results/${pos}.json?limit=100`)));
  return normalizeSeason(schedule, driverSt, constructorSt, podiums);
}

function toISO(date, time) {
  if (!date) return null;
  return `${date}T${time || "00:00:00Z"}`;
}

function normalizeSeason(schedule, driverSt, constructorSt, podiums) {
  const races = schedule.RaceTable.Races.map((r) => {
    const sessions = [
      ["Treino livre 1", r.FirstPractice],
      ["Treino livre 2", r.SecondPractice],
      ["Treino livre 3", r.ThirdPractice],
      ["Classificação sprint", r.SprintQualifying || r.SprintShootout],
      ["Sprint", r.Sprint],
      ["Classificação", r.Qualifying]
    ]
      .filter(([, s]) => s && s.date)
      .map(([label, s]) => ({ label, start: toISO(s.date, s.time) }));
    sessions.push({ label: "Corrida", start: toISO(r.date, r.time) });
    sessions.sort((a, b) => a.start.localeCompare(b.start));

    return {
      round: Number(r.round),
      name: r.raceName,
      circuitId: r.Circuit.circuitId,
      circuit: r.Circuit.circuitName,
      locality: r.Circuit.Location.locality,
      country: r.Circuit.Location.country,
      start: toISO(r.date, r.time),
      sprint: Boolean(r.Sprint),
      sessions,
      podium: []
    };
  });

  podiums.forEach((md, index) => {
    md.RaceTable.Races.forEach((r) => {
      const race = races.find((x) => x.round === Number(r.round));
      const res = r.Results?.[0];
      if (!race || !res) return;
      race.podium[index] = {
        pos: index + 1,
        given: res.Driver.givenName,
        family: res.Driver.familyName,
        code: res.Driver.code,
        number: res.Driver.permanentNumber || res.number,
        teamApiId: res.Constructor.constructorId,
        teamName: res.Constructor.name,
        time: res.Time?.time || res.status,
        points: Number(res.points),
        grid: Number(res.grid)
      };
    });
  });

  const dList = driverSt.StandingsTable.StandingsLists[0];
  const cList = constructorSt.StandingsTable.StandingsLists[0];

  return {
    season: schedule.RaceTable.season,
    races,
    drivers: (dList?.DriverStandings || []).map((s) => ({
      pos: Number(s.position || s.positionText) || null,
      given: s.Driver.givenName,
      family: s.Driver.familyName,
      code: s.Driver.code,
      number: s.Driver.permanentNumber,
      teamApiId: s.Constructors.at(-1)?.constructorId,
      teamName: s.Constructors.at(-1)?.name,
      points: Number(s.points),
      wins: Number(s.wins)
    })),
    constructors: (cList?.ConstructorStandings || []).map((s) => ({
      pos: Number(s.position || s.positionText) || null,
      apiId: s.Constructor.constructorId,
      name: s.Constructor.name,
      points: Number(s.points),
      wins: Number(s.wins)
    }))
  };
}

/* ---------- cache (sessionStorage) ---------- */
function readSeasonCache() {
  try {
    const cached = JSON.parse(sessionStorage.getItem(SEASON_CACHE_KEY));
    if (cached?.data?.races) return cached;
  } catch { /* cache corrompido ou indisponível */ }
  return null;
}

function writeSeasonCache() {
  try {
    sessionStorage.setItem(SEASON_CACHE_KEY, JSON.stringify({ savedAt: seasonState.savedAt, data: seasonState.data }));
  } catch { /* modo privado / cota cheia: segue só em memória */ }
}

function loadSeason({ force = false } = {}) {
  if (!seasonState.data) {
    const cached = readSeasonCache();
    if (cached) {
      seasonState.data = cached.data;
      seasonState.savedAt = cached.savedAt;
    }
  }

  const isFresh = seasonState.data && Date.now() - seasonState.savedAt < SEASON_MAX_AGE;
  if (!force && isFresh) return Promise.resolve(seasonState.data);
  if (seasonState.loading) return seasonState.loading;

  seasonState.loading = fetchSeason()
    .then((data) => {
      seasonState.data = data;
      seasonState.savedAt = Date.now();
      seasonState.error = null;
      writeSeasonCache();
      return data;
    })
    .catch((err) => {
      seasonState.error = err;
      if (seasonState.data) return seasonState.data; // mantém o que já tinha
      throw err;
    })
    .finally(() => {
      seasonState.loading = null;
    });

  return seasonState.loading;
}

/* ---------- blocos de interface ---------- */
function dataStamp() {
  const when = seasonState.savedAt ? timeFormat.format(seasonState.savedAt) : "—";
  const warn = seasonState.error ? `<span class="stamp-warn">· sem conexão, exibindo cópia salva</span>` : "";
  return `
  <div class="data-stamp">
    <span>Atualizado às ${when}</span>${warn}
    <button class="refresh-btn" type="button" data-season-refresh aria-label="Atualizar dados da temporada" title="Atualizar dados">${SEASON_ICONS.refresh}</button>
  </div>`;
}

function countdownText(iso) {
  const diff = new Date(iso).getTime() - Date.now();
  if (diff <= 0) return `<span class="countdown-live">Corrida em andamento</span>`;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins = Math.floor((diff % 3600000) / 60000);
  const unit = (n, label) => `<span class="cd-unit"><strong>${n}</strong>${label}</span>`;
  return (days > 0 ? unit(days, days === 1 ? "dia" : "dias") : "") + unit(hours, "h") + unit(mins, "min");
}

function nextRaceBlock(next, doneCount, total, data) {
  if (!next) {
    const champ = data.drivers[0];
    return `
    <section class="container season-block">
      <article class="next-race">
        <div class="next-race-main">
          <p class="next-race-kicker">Temporada encerrada · ${total} etapas</p>
          <h2>${champ ? esc(driverDisplayName(champ)) + " é o campeão" : "Fim de temporada"}</h2>
          ${champ ? `<p class="next-race-place">${fmtPts(champ.points)} pontos · ${champ.wins} vitórias</p>` : ""}
        </div>
      </article>
    </section>`;
  }

  const now = Date.now();
  const km = circuitKm(next.circuitId);
  const trackSvg = circuitImg(next.circuitId, next.circuit, "next-track-svg");
  return `
  <section class="container season-block">
    <article class="next-race">
      <div class="next-race-main">
        <p class="next-race-kicker">Próxima corrida · Etapa ${next.round} de ${total}${next.sprint ? " · fim de semana com sprint" : ""}</p>
        <div class="next-race-title-row">
          ${flagImg(next.country, "gp-flag gp-flag-lg")}
          <h2>${esc(gpName(next.name))}</h2>
        </div>
        <p class="next-race-place">${esc(next.circuit)} · ${esc(next.locality)}, ${esc(countryPt(next.country))}${km ? ` · ${km}` : ""}</p>
        <div class="countdown" data-countdown="${esc(next.start)}" aria-live="off">${countdownText(next.start)}</div>
        <p class="next-race-progress">${doneCount} de ${total} corridas disputadas</p>
      </div>
      ${trackSvg ? `
      <figure class="next-race-track" aria-label="Traçado aéreo de ${esc(next.circuit)}">
        ${trackSvg}
        <figcaption><span>Traçado aéreo</span><span>${km || esc(next.locality)}</span></figcaption>
      </figure>` : ""}
      <ol class="session-list" aria-label="Programação do fim de semana (horário local)">
        ${next.sessions.map((s) => {
          const date = new Date(s.start);
          const past = date.getTime() < now;
          return `<li class="${past ? "is-past" : ""} ${s.label === "Corrida" ? "is-race" : ""}"><span>${s.label}</span><time datetime="${esc(s.start)}">${sessionTime(date)}</time></li>`;
        }).join("")}
      </ol>
    </article>
  </section>`;
}

function podiumStage(race) {
  if (!race) return `<p class="season-empty">Nenhum Grande Prêmio disputado ainda nesta temporada.</p>`;
  const order = [1, 0, 2]; // 2º · 1º · 3º
  const km = circuitKm(race.circuitId);
  const trackSvg = circuitImg(race.circuitId, race.circuit, "podium-track-svg");
  return `
  <div class="podium-circuit-bar">
    <div class="podium-circuit-info">
      ${flagImg(race.country, "gp-flag gp-flag-lg")}
      <div>
        <p class="podium-race-kicker">Etapa ${race.round} · ${dayMonth(new Date(race.start))} · ${esc( race.locality )}, ${esc(countryPt(race.country))}</p>
        <h3 class="podium-race-title">${esc(gpName(race.name))}</h3>
        <p class="podium-race-sub">${esc(race.circuit)}${km ? ` · Extensão: ${km}` : ""}</p>
      </div>
    </div>
    ${trackSvg ? `
    <figure class="podium-track-box" aria-label="Traçado da pista: ${esc(race.circuit)}">
      ${trackSvg}
      <figcaption>Vista superior da pista</figcaption>
    </figure>` : ""}
  </div>
  <div class="podium">
    ${order.map((i) => {
      const p = race.podium[i];
      if (!p) return `<div class="podium-step p${i + 1} is-empty"></div>`;
      return `
      <article class="podium-step p${p.pos}" style="--team-accent:${teamColor(p.teamApiId)}">
        <div class="podium-driver">
          <div class="podium-photo">${driverPhoto(p)}</div>
          <h3>${esc(driverDisplayName(p))}</h3>
          <p class="podium-team">${esc(localTeam(p.teamApiId)?.name || p.teamName)}</p>
          <p class="podium-time">${esc(p.time)}</p>
        </div>
        <div class="podium-plinth">
          <span class="podium-pos" aria-label="${p.pos}º lugar">${p.pos}</span>
          <span class="podium-meta">+${p.points} pts · largou em ${p.grid || "pit"}º</span>
        </div>
      </article>`;
    }).join("")}
  </div>`;
}

function podiumBlock(done) {
  const race = done.find((r) => r.round === seasonState.podiumRound);
  return `
  <section class="section container season-block" id="podiumSection">
    <div class="block-head">
      <div class="section-header">
        <h2>Pódio por Grande Prêmio</h2>
        <p>Os três primeiros colocados de cada corrida já disputada na temporada.</p>
      </div>
      ${done.length ? `
      <div class="gp-picker">
        <button class="icon-btn" type="button" data-podium-step="-1" aria-label="Grande Prêmio anterior">${SEASON_ICONS.prev}</button>
        <select id="podiumSelect" aria-label="Escolher Grande Prêmio">
          ${done.map((r) => `<option value="${r.round}" ${r.round === seasonState.podiumRound ? "selected" : ""}>${String(r.round).padStart(2, "0")} · ${esc(gpName(r.name))}</option>`).join("")}
        </select>
        <button class="icon-btn" type="button" data-podium-step="1" aria-label="Próximo Grande Prêmio">${SEASON_ICONS.next}</button>
      </div>` : ""}
    </div>
    <div id="podiumStage">${podiumStage(race)}</div>
  </section>`;
}

function podiumCounts(races) {
  const counts = {};
  races.forEach((r) => r.podium.forEach((p) => {
    if (p) counts[normName(p.family)] = (counts[normName(p.family)] || 0) + 1;
  }));
  return counts;
}

function driversTable(data) {
  const leader = data.drivers[0]?.points || 1;
  const pods = podiumCounts(data.races);
  return `
  <table class="championship-table standings-table">
    <thead>
      <tr>
        <th class="col-pos" scope="col">Pos.</th>
        <th scope="col">Piloto</th>
        <th class="hide-sm" scope="col">Equipe</th>
        <th class="num hide-sm" scope="col">Vitórias</th>
        <th class="num hide-sm" scope="col">Pódios</th>
        <th class="num col-points" scope="col">Pontos</th>
        <th class="num hide-sm" scope="col">Dif.</th>
      </tr>
    </thead>
    <tbody>
      ${data.drivers.map((d) => {
        const team = localTeam(d.teamApiId);
        return `
        <tr style="--team-accent:${teamColor(d.teamApiId)}">
          <td class="col-pos">${d.pos ?? "—"}</td>
          <td>
            <div class="standing-driver">
              <span class="team-swatch"></span>
              <span class="standing-thumb">${driverPhoto(d)}</span>
              <span class="standing-name">${esc(driverDisplayName(d))}<small>${esc(d.code || "")}</small></span>
            </div>
          </td>
          <td class="hide-sm">${team ? `<a href="#/equipe/${team.id}">${esc(team.short)}</a>` : esc(d.teamName)}</td>
          <td class="num hide-sm">${d.wins}</td>
          <td class="num hide-sm">${pods[normName(d.family)] || 0}</td>
          <td class="num col-points">
            <strong>${fmtPts(d.points)}</strong>
            <span class="points-bar" aria-hidden="true"><i style="width:${Math.max(0, (d.points / leader) * 100).toFixed(1)}%"></i></span>
          </td>
          <td class="num hide-sm gap">${d.pos === 1 ? "—" : "−" + fmtPts(leader - d.points)}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;
}

function constructorsTable(data) {
  const leader = data.constructors[0]?.points || 1;
  return `
  <table class="championship-table standings-table">
    <thead>
      <tr>
        <th class="col-pos" scope="col">Pos.</th>
        <th scope="col">Equipe</th>
        <th class="hide-sm" scope="col">Pilotos</th>
        <th class="num hide-sm" scope="col">Vitórias</th>
        <th class="num col-points" scope="col">Pontos</th>
        <th class="num hide-sm" scope="col">Dif.</th>
      </tr>
    </thead>
    <tbody>
      ${data.constructors.map((c) => {
        const team = localTeam(c.apiId);
        return `
        <tr style="--team-accent:${teamColor(c.apiId)}">
          <td class="col-pos">${c.pos ?? "—"}</td>
          <td>
            ${team
              ? `<a class="table-team-cell" href="#/equipe/${team.id}"><span class="team-swatch"></span><img class="standing-logo" src="${logo(team.k)}" alt="" /><span>${esc(team.name)}</span></a>`
              : `<span class="table-team-cell"><span class="team-swatch"></span>${esc(c.name)}</span>`}
          </td>
          <td class="hide-sm">${team ? team.drivers.map((d) => esc(d.name.split(" ").slice(-1)[0])).join(" · ") : "—"}</td>
          <td class="num hide-sm">${c.wins}</td>
          <td class="num col-points">
            <strong>${fmtPts(c.points)}</strong>
            <span class="points-bar" aria-hidden="true"><i style="width:${Math.max(0, (c.points / leader) * 100).toFixed(1)}%"></i></span>
          </td>
          <td class="num hide-sm gap">${c.pos === 1 ? "—" : "−" + fmtPts(leader - c.points)}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>`;
}

function standingsBlock(data) {
  const isDrivers = seasonState.standingsTab === "drivers";
  return `
  <section class="section container season-block" style="padding-top:0">
    <div class="block-head">
      <div class="section-header">
        <h2>Classificação do campeonato</h2>
        <p>Pontuação acumulada após cada etapa, com diferença para o líder.</p>
      </div>
      ${dataStamp()}
    </div>
    <div class="filter-bar" role="tablist" aria-label="Tipo de classificação">
      <button class="filter-btn ${isDrivers ? "active" : ""}" type="button" role="tab" aria-selected="${isDrivers}" data-standings-tab="drivers">Pilotos</button>
      <button class="filter-btn ${!isDrivers ? "active" : ""}" type="button" role="tab" aria-selected="${!isDrivers}" data-standings-tab="constructors">Construtores</button>
    </div>
    <div class="championship-table-wrap" role="tabpanel">
      ${isDrivers ? driversTable(data) : constructorsTable(data)}
    </div>
  </section>`;
}

function calendarBlock(data, next) {
  return `
  <section class="section container season-block" style="padding-top:0">
    <div class="block-head">
      <div class="section-header">
        <h2>Calendário e resultados</h2>
        <p>Todas as etapas do ano. Horários no fuso do seu dispositivo; clique no vencedor para ver o pódio completo.</p>
      </div>
      ${dataStamp()}
    </div>
    <ol class="calendar">
      ${data.races.map((r) => {
        const winner = r.podium[0];
        const isNext = next && r.round === next.round;
        const state = winner ? "is-done" : isNext ? "is-next" : "is-upcoming";
        const date = new Date(r.start);
        let result;
        if (winner) {
          result = `<button class="cal-winner" type="button" data-podium-goto="${r.round}" style="--team-accent:${teamColor(winner.teamApiId)}" aria-label="Ver pódio: ${esc(gpName(r.name))}"><span class="team-swatch"></span>${esc(driverDisplayName(winner))}</button>`;
        } else if (isNext) {
          result = `<span class="cal-badge">Próxima · ${timeFormat.format(date)}</span>`;
        } else {
          result = `<span class="cal-time">${timeFormat.format(date)}</span>`;
        }
        const km = circuitKm(r.circuitId);
        const trackSvg = circuitImg(r.circuitId, r.circuit, "cal-track-svg");
        const trackCell = trackSvg
          ? (winner
            ? `<button class="cal-track cal-track-btn" type="button" data-podium-goto="${r.round}" title="Ver pódio e pista: ${esc(r.circuit)}">${trackSvg}</button>`
            : `<div class="cal-track" title="${esc(r.circuit)}">${trackSvg}</div>`)
          : `<div class="cal-track"></div>`;
        return `
        <li class="cal-row ${state}">
          <span class="cal-round">${String(r.round).padStart(2, "0")}</span>
          <time class="cal-date" datetime="${esc(r.start)}">${dayMonth(date)}</time>
          <div class="cal-gp">
            <strong>${flagImg(r.country, "gp-flag")}<span>${esc(gpName(r.name))}</span>${r.sprint ? `<span class="cal-tag">Sprint</span>` : ""}</strong>
            <span class="cal-sub">${esc(r.circuit)} · ${esc(r.locality)}, ${esc(countryPt(r.country))}${km ? ` · ${km}` : ""}</span>
          </div>
          ${trackCell}
          <div class="cal-result">${result}</div>
        </li>`;
      }).join("")}
    </ol>
  </section>`;
}

function seasonSummary(data, doneCount) {
  const leader = data.drivers[0];
  if (!leader) return `${data.races.length} etapas no calendário.`;
  return `${doneCount} de ${data.races.length} corridas disputadas · líder: ${esc(driverDisplayName(leader))}, ${fmtPts(leader.points)} pts`;
}

function seasonBodyHTML(data) {
  const now = Date.now();
  const done = data.races.filter((r) => r.podium[0]);
  // "Próxima" = primeira etapa sem resultado cuja largada não terminou há mais de 3h
  const next = data.races.find((r) => !r.podium[0] && new Date(r.start).getTime() + 3 * 3600000 > now);

  if (!done.some((r) => r.round === seasonState.podiumRound)) {
    seasonState.podiumRound = done.at(-1)?.round ?? null;
  }

  return nextRaceBlock(next, done.length, data.races.length, data)
    + podiumBlock(done)
    + standingsBlock(data)
    + calendarBlock(data, next);
}

function seasonLoadingHTML() {
  return `
  <section class="container season-block">
    <div class="season-loading" role="status">
      <span class="loading-bar" aria-hidden="true"></span>
      Carregando classificação, pódios e calendário…
    </div>
  </section>`;
}

function seasonErrorHTML(err) {
  return `
  <section class="container season-block">
    <div class="season-error" role="alert">
      <h2>Não foi possível carregar os dados da temporada</h2>
      <p>A API de dados da Fórmula 1 não respondeu (${esc(err?.message || "erro de rede")}). Verifique sua conexão e tente novamente.</p>
      <button class="btn btn-secondary" type="button" data-season-refresh>Tentar novamente</button>
    </div>
  </section>`;
}

/* ---------- view + ciclo de vida ---------- */
function seasonView() {
  const data = seasonState.data || readSeasonCache()?.data;
  return `
  <div class="view season-view">
    <header class="container season-head">
      <div class="section-header">
        <h1>Temporada ${esc(data?.season || new Date().getFullYear())}</h1>
        <p id="seasonSummary">Classificação, pódio de cada Grande Prêmio e calendário completo do campeonato.</p>
      </div>
    </header>
    <div id="seasonBody">${seasonLoadingHTML()}</div>
  </div>`;
}

function renderSeasonBody() {
  const body = document.getElementById("seasonBody");
  if (!body || !seasonState.data) return;
  const data = seasonState.data;
  body.innerHTML = seasonBodyHTML(data);
  const summary = document.getElementById("seasonSummary");
  if (summary) summary.innerHTML = seasonSummary(data, data.races.filter((r) => r.podium[0]).length);
  const h1 = document.querySelector(".season-head h1");
  if (h1) h1.textContent = `Temporada ${data.season}`;
}

function setPodiumRound(round, { scroll = false } = {}) {
  const done = seasonState.data.races.filter((r) => r.podium[0]);
  const race = done.find((r) => r.round === round);
  if (!race) return;
  seasonState.podiumRound = round;
  const stage = document.getElementById("podiumStage");
  if (stage) stage.innerHTML = podiumStage(race);
  const select = document.getElementById("podiumSelect");
  if (select) select.value = String(round);
  if (scroll) document.getElementById("podiumSection")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function refreshSeason(force) {
  const body = document.getElementById("seasonBody");
  body?.querySelectorAll("[data-season-refresh]").forEach((b) => {
    b.disabled = true;
    b.classList.add("is-loading");
  });

  return loadSeason({ force })
    .then(() => renderSeasonBody())
    .catch((err) => {
      const target = document.getElementById("seasonBody");
      if (target) target.innerHTML = seasonErrorHTML(err);
    });
}

function teardownSeason() {
  clearInterval(seasonState.timer);
  seasonState.timer = null;
}

function initSeason() {
  root.style.setProperty("--team-accent", "#e10600");
  const body = document.getElementById("seasonBody");

  body.addEventListener("click", (event) => {
    const refresh = event.target.closest("[data-season-refresh]");
    if (refresh) return refreshSeason(true);

    const tab = event.target.closest("[data-standings-tab]");
    if (tab && tab.dataset.standingsTab !== seasonState.standingsTab) {
      seasonState.standingsTab = tab.dataset.standingsTab;
      return renderSeasonBody();
    }

    const step = event.target.closest("[data-podium-step]");
    if (step) {
      const done = seasonState.data.races.filter((r) => r.podium[0]);
      const idx = done.findIndex((r) => r.round === seasonState.podiumRound);
      const target = done[idx + Number(step.dataset.podiumStep)];
      if (target) setPodiumRound(target.round);
      return;
    }

    const goto = event.target.closest("[data-podium-goto]");
    if (goto) setPodiumRound(Number(goto.dataset.podiumGoto), { scroll: true });
  });

  body.addEventListener("change", (event) => {
    if (event.target.id === "podiumSelect") setPodiumRound(Number(event.target.value));
  });

  // Contagem regressiva da próxima corrida (atualiza a cada 30 s)
  teardownSeason();
  seasonState.timer = setInterval(() => {
    const el = document.querySelector("[data-countdown]");
    if (el) el.innerHTML = countdownText(el.dataset.countdown);
  }, 30000);

  // Cache válido → renderiza na hora, sem tocar na API
  refreshSeason(false);
}
