/* =========================================================================
   Sydney trip journal — view logic (vanilla JS, no build step)
   ========================================================================= */

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const state = { view: "home", day: 0 };

/* live FX rate — starts from the fallback in data.js, upgraded once fetched */
const rateState = { rate: TRIP.currency.rate, live: false, date: "", loading: false };

/* Pull the spot rate from Frankfurter (ECB reference, free, no key, CORS-ok).
   Falls back silently to the static rate when offline. */
async function fetchSpotRate() {
  if (rateState.loading || rateState.live) return;
  rateState.loading = true;
  const { code, target } = TRIP.currency;
  try {
    const r = await fetch(`https://api.frankfurter.app/latest?from=${code}&to=${target}`);
    if (!r.ok) throw new Error(r.status);
    const j = await r.json();
    const v = j.rates && j.rates[target];
    if (!v) throw new Error("no rate");
    rateState.rate = v;
    rateState.date = j.date || "";
    rateState.live = true;
  } catch (e) {
    rateState.live = false; // keep fallback
  } finally {
    rateState.loading = false;
    if (state.view === "wallet") paintRate();
  }
}

/* refresh just the wallet numbers without re-rendering the whole view */
function paintRate() {
  const sub = $("#rate-sub"), status = $("#rate-status"), inp = $("#aud-in"), out = $("#twd-out");
  if (!sub) return;
  const { code, target } = TRIP.currency;
  sub.textContent = `≈ ${target} · rate 1 ${code} = ${rateState.rate} ${target}`;
  status.textContent = rateState.live
    ? `Live spot rate · ${rateState.date}`
    : (rateState.loading ? "Fetching live rate…" : "Offline — using saved rate.");
  if (inp && out) {
    const v = parseFloat(inp.value || 0);
    out.textContent = isFinite(v)
      ? "$" + (v * rateState.rate).toLocaleString(undefined, { maximumFractionDigits: 1 }) : "—";
  }
}

/* pick the day closest to "today" on first load, else day 0 */
(function initDay() {
  const today = new Date().toISOString().slice(0, 10);
  const idx = TRIP.days.findIndex(d => d.date >= today);
  state.day = idx === -1 ? 0 : idx;
})();

/* -------------------------------------------------------------- helpers */
const $  = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => (s == null ? "" : String(s).replace(/[&<>"]/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])));
const mapUrl = q => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(q);
const weatherIcon = i => ({ "sun": "☀️", "cloud-rain": "🌦️", "cloud": "☁️" }[i] || "☀️");

/* ------------------------------------------------------------- header */
function paintHeader() {
  $("#tagline").textContent   = TRIP.tagline;
  $("#subtitle").textContent  = TRIP.subtitle;
  $("#trip-title").textContent = TRIP.title;
}

/* ---------------------------------------------------- date pill strip */
function paintDates() {
  const strip = $("#date-strip");
  strip.innerHTML = TRIP.days.map((d, i) => {
    const dt = new Date(d.date + "T00:00:00");
    return `<button class="pill ${i === state.day ? "active" : ""}" data-day="${i}">
      <div class="pdow">${d.dow}</div>
      <div class="pday">${dt.getDate()}</div>
      <div class="pmon">${MONTHS[dt.getMonth()]}</div>
    </button>`;
  }).join("");

  $$(".pill", strip).forEach(p =>
    p.onclick = () => { state.day = +p.dataset.day; render(); });

  // progress dot + counter
  const pct = TRIP.days.length > 1 ? state.day / (TRIP.days.length - 1) : 0;
  $("#track-dot").style.left = (pct * 100) + "%";
  $("#day-counter").textContent = `Day ${state.day + 1} / ${TRIP.days.length}`;

  // keep active pill in view
  const active = $(".pill.active", strip);
  if (active) active.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
}

/* ----------------------------------------------------- itinerary item */
function itemRow(it) {
  const tags = [];
  if (it.booked) tags.push(`<span class="chip booked">Booked${it.time ? " " + it.time : ""}</span>`);
  if (it.tag === "hotel") tags.push(`<span class="chip hotel">🛏 Hotel</span>`);
  if (it.tag === "car")   tags.push(`<span class="chip car">🚗 Car</span>`);
  if (it.tag === "tip")   tags.push(`<span class="chip tip">💡 Tip</span>`);

  const clickable = !!it.map;
  return `<div class="t-item" ${clickable ? `data-map="${esc(it.map)}"` : ""}>
    <div class="t-time ${it.time ? "" : "empty"}">${it.time || "·"}</div>
    <div class="t-body">
      <div class="t-title">${esc(it.title)}</div>
      ${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ""}
      ${tags.length ? `<div class="t-tags">${tags.join("")}</div>` : ""}
    </div>
    ${clickable ? `<div class="t-go">›</div>` : ""}
  </div>`;
}

/* ============================= VIEWS ================================= */
function viewPlans() {
  const d = TRIP.days[state.day];
  const order = ["Breakfast", "Morning", "All Day", "Lunch", "Afternoon", "Dinner", "Night"];
  const groups = {};
  d.items.forEach(it => (groups[it.part] = groups[it.part] || []).push(it));

  let html = `<div class="banner">
      <span class="b-ic">${weatherIcon(d.weather.icon)}</span>
      <span class="b-tx"><b>${esc(d.weather.text)}</b>
        <small>${d.weather.min}–${d.weather.max}°C · ${esc(d.city)}</small></span>
    </div>`;

  order.forEach(part => {
    if (!groups[part]) return;
    html += `<div class="part-group">
      <div class="part-label">${part}</div>
      ${groups[part].map(itemRow).join("")}
    </div>`;
  });

  if (d.hotel) html += `<div class="banner" data-map="${esc(d.hotel)}" style="cursor:pointer">
      <span class="b-ic">🛏</span>
      <span class="b-tx"><b>${esc(d.hotel)}</b><small>Tonight's stay</small></span>
    </div>`;

  return `<div class="section-head"><h2>${esc(d.label)}</h2>
    <span class="more">${d.dow} ${d.date.slice(8)} Jun</span></div>${html}`;
}

function viewHome() {
  const d = TRIP.days[state.day];
  const next = d.items.find(it => it.time) || d.items[0];

  return `
    <div class="banner" data-view="plans" style="cursor:pointer">
      <span class="b-ic">✈️</span>
      <span class="b-tx"><b>${TRIP.days.length}-day Sydney itinerary</b>
        <small>20–27 June · tap to view today</small></span>
    </div>

    <div class="card">
      <div class="section-head" style="padding:0 0 10px">
        <h2>今日行程</h2><span class="more" data-view="plans">查看全部</span>
      </div>
      <div class="weather-chip">${weatherIcon(d.weather.icon)}
        <b>${esc(d.weather.text)}</b> · ${d.weather.min}–${d.weather.max}°C</div>
      <div style="margin-top:12px">${itemRow(next)}</div>
      <p class="t-note" style="text-align:center;margin-top:6px">
        還有 ${Math.max(d.items.length - 1, 0)} 個行程 · ${esc(d.label)}</p>
    </div>

    <div class="section-head"><h2>功能總覽</h2><span class="more">Menu</span></div>
    <div class="feature-grid">
      <div class="feature" data-view="plans">
        <div class="f-ic">🗓</div>
        <div><div class="f-en">Plans</div><div class="f-zh">每日行程</div>
          <div class="f-sub">時間 · 地點 · 備註</div></div>
      </div>
      <div class="feature" data-view="map">
        <div class="f-ic">📍</div>
        <div><div class="f-en">Map</div><div class="f-zh">地圖導航</div>
          <div class="f-sub">所有地點一鍵開啟</div></div>
      </div>
      <div class="feature" data-view="wallet">
        <div class="f-ic">💱</div>
        <div><div class="f-en">Wallet</div><div class="f-zh">匯率換算</div>
          <div class="f-sub">AUD → 台幣</div></div>
      </div>
      <div class="feature" data-view="saved">
        <div class="f-ic">🔖</div>
        <div><div class="f-en">Saved</div><div class="f-zh">備用景點</div>
          <div class="f-sub">想去的地方</div></div>
      </div>
    </div>`;
}

function viewMap() {
  // collect every mappable place across the trip
  const rows = [];
  TRIP.days.forEach((d, di) => {
    d.items.filter(it => it.map).forEach(it => {
      rows.push(`<div class="t-item" data-map="${esc(it.map)}">
        <div class="t-time empty">D${di + 1}</div>
        <div class="t-body"><div class="t-title">${esc(it.title)}</div>
          ${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ""}</div>
        <div class="t-go">›</div></div>`);
    });
  });
  return `<div class="section-head"><h2>地圖導航</h2>
    <span class="more">${rows.length} spots</span></div>
    <p class="t-note" style="padding:0 4px 12px">Tap any place to open it in Google Maps.</p>
    ${rows.join("")}`;
}

function viewWallet() {
  const c = TRIP.currency;
  return `<div class="section-head"><h2>匯率換算</h2>
    <span class="more">${c.code} → ${c.target}</span></div>
    <div class="card">
      <div class="amount-row">
        <input id="aud-in" type="number" inputmode="decimal" placeholder="Amount in ${c.code}" value="100" />
      </div>
      <div class="convert-out">
        <div class="big" id="twd-out">—</div>
        <div class="sub" id="rate-sub">≈ ${c.target} · rate 1 ${c.code} = ${rateState.rate} ${c.target}</div>
      </div>
    </div>
    <p class="t-note" style="text-align:center" id="rate-status">${
      rateState.live ? "Live spot rate · " + rateState.date : "Tap to fetch the live spot rate."
    }</p>`;
}

function viewSaved() {
  const rows = TRIP.saved.map(s => `<div class="t-item" data-map="${esc(s.map)}">
    <div class="t-time empty">★</div>
    <div class="t-body"><div class="t-title">${esc(s.title)}</div>
      ${s.note ? `<div class="t-note">${esc(s.note)}</div>` : ""}</div>
    <div class="t-go">›</div></div>`).join("");
  return `<div class="section-head"><h2>備用景點</h2><span class="more">Wishlist</span></div>
    <p class="t-note" style="padding:0 4px 12px">想去但還沒排進行程的地方。</p>${rows}`;
}

/* ============================= RENDER =============================== */
const VIEWS = { home: viewHome, plans: viewPlans, map: viewMap, wallet: viewWallet, saved: viewSaved };

function render() {
  paintDates();
  const c = $("#content");
  c.classList.remove("fade-in"); void c.offsetWidth; c.classList.add("fade-in");
  c.innerHTML = (VIEWS[state.view] || viewHome)();

  // tabbar active state
  $$(".tab").forEach(t => t.classList.toggle("active", t.dataset.view === state.view));

  // wire map links
  $$("[data-map]", c).forEach(el =>
    el.onclick = () => window.open(mapUrl(el.dataset.map), "_blank", "noopener"));

  // wire in-content view jumps (banners, "查看全部", feature cards)
  $$("[data-view]", c).forEach(el =>
    el.addEventListener("click", e => {
      e.stopPropagation();
      state.view = el.dataset.view; render();
    }));

  // wallet live conversion + spot-rate fetch
  const inp = $("#aud-in");
  if (inp) {
    inp.addEventListener("input", paintRate);
    paintRate();
    fetchSpotRate(); // upgrade to the live rate when online
  }
}

/* ----------------------------------------------------------- wiring */
paintHeader();

$$(".tab").forEach(t => t.onclick = () => { state.view = t.dataset.view; render(); });

$$(".track-arrow").forEach(a => a.onclick = () => {
  const dir = +a.dataset.dir;
  state.day = Math.min(TRIP.days.length - 1, Math.max(0, state.day + dir));
  render();
});

render();
