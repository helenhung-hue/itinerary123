/* =========================================================================
   Sydney trip journal — view logic (vanilla JS, no build step)
   ========================================================================= */

const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
const state = { view: "home", day: 0 };

/* ---------------------------------------------------- trip data store
   Source of truth = your browser. Falls back to the seed in data.js.
   The Editor screen writes here; Export downloads a commit-ready data.js. */
const STORE_KEY = "sydney_trip_v1";
function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }
function loadTrip() {
  try { const s = localStorage.getItem(STORE_KEY); if (s) return JSON.parse(s); } catch (e) {}
  return deepCopy(window.DEFAULT_TRIP);
}
function saveTrip() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(TRIP)); } catch (e) {}
}
function resetTrip() {
  localStorage.removeItem(STORE_KEY);
  TRIP = deepCopy(window.DEFAULT_TRIP);
}
let TRIP = loadTrip();

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

/* A representative location photo, keyed on the place name.
   LoremFlickr serves keyword-matched Flickr photos with no API key. */
function photoUrl(it, size = 160) {
  const q = it.photo || it.map || it.title || "";
  const kw = q.toLowerCase()
    .replace(/[^a-z0-9 ]/g, " ")          // drop CJK / punctuation
    .trim().split(/\s+/).slice(0, 3).join(",");
  if (!kw) return "";
  return `https://loremflickr.com/${size}/${size}/${kw}`;
}

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
  const photo = clickable ? photoUrl(it) : "";
  const right = photo
    ? `<img class="t-thumb" loading="lazy" alt="" src="${photo}"
         onerror="this.classList.add('t-thumb--off')">`
    : (clickable ? `<div class="t-go">›</div>` : "");
  return `<div class="t-item" ${clickable ? `data-map="${esc(it.map)}"` : ""}>
    <div class="t-time ${it.time ? "" : "empty"}">${it.time || "·"}</div>
    <div class="t-body">
      <div class="t-title">${esc(it.title)}</div>
      ${it.note ? `<div class="t-note">${esc(it.note)}</div>` : ""}
      ${tags.length ? `<div class="t-tags">${tags.join("")}</div>` : ""}
    </div>
    ${right}
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
          <div class="f-sub">AUD → HKD · 即時匯率</div></div>
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

/* ============================== EDITOR =============================== */
function setPath(obj, path, value) {
  const ks = path.split("."); let o = obj;
  for (let i = 0; i < ks.length - 1; i++) o = o[ks[i]];
  o[ks[ks.length - 1]] = value;
}
const PARTS = ["Breakfast", "Morning", "All Day", "Lunch", "Afternoon", "Dinner", "Night"];
const TAGS  = ["", "hotel", "car", "tip"];
const ICONS = ["sun", "cloud", "cloud-rain"];

function edField(label, path, val, type = "text") {
  return `<label class="ed-f"><span>${label}</span>
    <input class="ed-in" data-path="${path}" type="${type}" value="${esc(val == null ? "" : val)}"></label>`;
}
function edSelect(label, path, val, opts) {
  return `<label class="ed-f"><span>${label}</span>
    <select class="ed-in" data-path="${path}">${
      opts.map(o => `<option value="${o}" ${o === val ? "selected" : ""}>${o || "—"}</option>`).join("")
    }</select></label>`;
}

function viewEditor() {
  const t = TRIP;
  let h = `<div class="section-head"><h2>Editor</h2><span class="more">編輯行程</span></div>
    <p class="t-note" style="padding:0 4px 12px">Edits save to this device automatically. Use <b>Export</b> to publish for everyone.</p>`;

  h += `<div class="card ed-card"><div class="ed-h">Trip</div>
    ${edField("Title", "title", t.title)}
    ${edField("Subtitle", "subtitle", t.subtitle)}
    ${edField("Tagline", "tagline", t.tagline)}
    <div class="ed-row">${edField("Currency", "currency.code", t.currency.code)}
      ${edField("Target", "currency.target", t.currency.target)}
      ${edField("Fallback rate", "currency.rate", t.currency.rate, "number")}</div></div>`;

  t.days.forEach((d, di) => {
    h += `<div class="card ed-card"><div class="ed-h">Day ${di + 1}
        <button class="ed-del" data-act="delDay" data-d="${di}">Delete day</button></div>
      <div class="ed-row">${edField("Date", `days.${di}.date`, d.date, "date")}
        ${edField("Weekday", `days.${di}.dow`, d.dow)}</div>
      ${edField("Label", `days.${di}.label`, d.label)}
      ${edField("City", `days.${di}.city`, d.city)}
      ${edField("Hotel", `days.${di}.hotel`, d.hotel || "")}
      <div class="ed-row">${edField("Weather", `days.${di}.weather.text`, d.weather.text)}
        ${edField("Min°", `days.${di}.weather.min`, d.weather.min, "number")}
        ${edField("Max°", `days.${di}.weather.max`, d.weather.max, "number")}</div>
      ${edSelect("Icon", `days.${di}.weather.icon`, d.weather.icon, ICONS)}
      <div class="ed-h2">Stops</div>`;

    d.items.forEach((it, ii) => {
      const p = `days.${di}.items.${ii}`;
      h += `<div class="ed-item">
        <div class="ed-row">${edSelect("Part", `${p}.part`, it.part, PARTS)}
          ${edField("Time", `${p}.time`, it.time || "")}</div>
        ${edField("Title", `${p}.title`, it.title)}
        ${edField("Note", `${p}.note`, it.note || "")}
        ${edField("Location (for map/photo)", `${p}.map`, it.map || "")}
        <div class="ed-row">
          <label class="ed-f ed-chk"><input type="checkbox" class="ed-in" data-path="${p}.booked" ${it.booked ? "checked" : ""}><span>Booked</span></label>
          ${edSelect("Tag", `${p}.tag`, it.tag || "", TAGS)}</div>
        <button class="ed-del" data-act="delItem" data-d="${di}" data-i="${ii}">Remove stop</button></div>`;
    });
    h += `<button class="ed-add" data-act="addItem" data-d="${di}">+ Add stop</button></div>`;
  });

  h += `<button class="ed-add wide" data-act="addDay">+ Add day</button>`;

  h += `<div class="card ed-card"><div class="ed-h">Saved spots</div>`;
  t.saved.forEach((s, si) => {
    h += `<div class="ed-item">${edField("Title", `saved.${si}.title`, s.title)}
      ${edField("Note", `saved.${si}.note`, s.note || "")}
      ${edField("Location", `saved.${si}.map`, s.map || "")}
      <button class="ed-del" data-act="delSaved" data-i="${si}">Remove</button></div>`;
  });
  h += `<button class="ed-add" data-act="addSaved">+ Add saved spot</button></div>`;

  h += `<div class="ed-actions">
    <button class="ed-btn primary" data-act="done">Save &amp; view</button>
    <button class="ed-btn" data-act="export">⬇ Export data.js</button>
    <button class="ed-btn" data-act="import">⬆ Import file</button>
    <button class="ed-btn danger" data-act="reset">Reset to default</button></div>
    <input type="file" id="ed-file" accept=".js,.json,application/json,text/javascript" style="display:none">`;
  return h;
}

function exportData() {
  const js = "/* Sydney trip data — exported from the in-app editor. Replace js/data.js with this and push. */\n"
    + "window.DEFAULT_TRIP = " + JSON.stringify(TRIP, null, 2) + ";\n";
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([js], { type: "text/javascript" }));
  a.download = "data.js"; a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function editorAction(act, ds) {
  const di = ds.d != null ? +ds.d : null, ii = ds.i != null ? +ds.i : null;
  switch (act) {
    case "addItem": TRIP.days[di].items.push({ part: "Morning", title: "New stop" }); break;
    case "delItem": TRIP.days[di].items.splice(ii, 1); break;
    case "addDay": {
      const last = TRIP.days[TRIP.days.length - 1];
      const nd = new Date((last ? last.date : "2026-06-20") + "T00:00:00"); nd.setDate(nd.getDate() + 1);
      TRIP.days.push({ date: nd.toISOString().slice(0, 10),
        dow: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][nd.getDay()],
        label: "New day", city: "", hotel: null,
        weather: { text: "Mostly Sunny", min: 12, max: 20, icon: "sun" }, items: [] });
      break;
    }
    case "delDay":
      if (TRIP.days.length > 1) { TRIP.days.splice(di, 1); state.day = Math.min(state.day, TRIP.days.length - 1); }
      break;
    case "addSaved": TRIP.saved.push({ title: "New spot", map: "" }); break;
    case "delSaved": TRIP.saved.splice(ii, 1); break;
    case "reset":
      if (confirm("Reset everything to the original itinerary? Your edits will be lost.")) { resetTrip(); state.day = 0; }
      break;
    case "export": exportData(); return;
    case "import": $("#ed-file").click(); return;
    case "done": state.view = "home"; saveTrip(); render(); return;
  }
  saveTrip(); render();
}

function wireEditor(c) {
  $$(".ed-in", c).forEach(el => {
    const ev = el.type === "checkbox" ? "change" : "input";
    el.addEventListener(ev, () => {
      let v = el.type === "checkbox" ? el.checked : el.value;
      if (el.type === "number") v = v === "" ? null : Number(v);
      setPath(TRIP, el.dataset.path, v);
      saveTrip();
    });
  });
  $$("[data-act]", c).forEach(el => el.addEventListener("click", () => editorAction(el.dataset.act, el.dataset)));
  const file = $("#ed-file", c);
  if (file) file.addEventListener("change", async () => {
    const f = file.files[0]; if (!f) return;
    try {
      const txt = await f.text();
      const data = JSON.parse(txt.slice(txt.indexOf("{"), txt.lastIndexOf("}") + 1));
      if (!data || !Array.isArray(data.days)) throw new Error("not a trip file");
      TRIP = data; saveTrip(); state.day = 0; render();
      alert("Imported ✓");
    } catch (e) { alert("Import failed: " + e.message); }
  });
}

/* ============================= RENDER =============================== */
const VIEWS = { home: viewHome, plans: viewPlans, map: viewMap, wallet: viewWallet, saved: viewSaved, editor: viewEditor };

function render() {
  paintHeader();
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

  // editor bindings
  if (state.view === "editor") wireEditor(c);
}

/* ----------------------------------------------------------- wiring */
paintHeader();

$$(".tab").forEach(t => t.onclick = () => { state.view = t.dataset.view; render(); });

// gear icon opens the editor
const gear = $(".gear");
if (gear) gear.onclick = () => { state.view = "editor"; render(); };

$$(".track-arrow").forEach(a => a.onclick = () => {
  const dir = +a.dataset.dir;
  state.day = Math.min(TRIP.days.length - 1, Math.max(0, state.day + dir));
  render();
});

render();
