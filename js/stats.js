const $ = (id) => document.getElementById(id);

function toast(msg, isErr = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show " + (isErr ? "err" : "ok");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = "toast"), 3000);
}

const escapeHtml = (v) =>
  String(v == null ? "" : v).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[c]);

const fmt = (v) => {
  if (v === null || v === undefined || v === "") return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
};

function cellsByCategory(cells, cat) {
  return cells.filter((c) => c.category === cat && c.status !== "not_active");
}

function cellMeta(cell, members) {
  const list = members
    .filter((m) => m.cellId === cell.cellId)
    .map((m) => `<li>${escapeHtml(m.name)}${m.standard ? " <span class='std'>– " + escapeHtml(m.standard) + "</span>" : ""}</li>`)
    .join("");
  return `
    <div class="cell-card">
      <div class="cell-head">
        <h4>${escapeHtml(cell.name)}</h4>
        <div class="cell-schedule">
          ${cell.day ? `<span>${escapeHtml(cell.day)}</span>` : ""}
          ${cell.time ? `<span>${escapeHtml(cell.time)}</span>` : ""}
          ${cell.status && cell.status !== "active" ? `<span class="tag tag-${escapeHtml(cell.status)}">${escapeHtml(cell.status.replace(/_/g, " "))}</span>` : ""}
        </div>
      </div>
      <div class="cell-people">
        <div class="person"><b>Leader:</b> ${cell.leader ? escapeHtml(cell.leader) : "—"}</div>
        <div class="person"><b>Shepherd:</b> ${cell.shepherd ? escapeHtml(cell.shepherd) : "—"}</div>
        ${cell.capacity ? `<div class="person"><b>Capacity:</b> ${escapeHtml(cell.capacity)}</div>` : ""}
      </div>
      ${list ? `<ul class="members">${list}</ul>` : ""}
    </div>`;
}

function renderCellsSection(title, cells, members) {
  if (!cells.length) return "";
  return `
    <section class="doc-section">
      <h3>${title} (${cells.length})</h3>
      <div class="cell-grid">${cells.map((c) => cellMeta(c, members)).join("")}</div>
    </section>`;
}

function renderListSection(title, items, keyName, badge) {
  if (!items.length) return "";
  const lis = items
    .map((it) => {
      const val = it[keyName];
      const extra = badge ? badge(it) : "";
      return `<li>${escapeHtml(val)}${extra}</li>`;
    })
    .join("");
  return `
    <section class="doc-section">
      <h3>${title} (${items.length})</h3>
      <ul class="name-list">${lis}</ul>
    </section>`;
}

function renderFollowUp(items) {
  if (!items.length) return "";
  const lis = items
    .map(
      (it) => `<li><span class="fu-name">${escapeHtml(it.name)}</span>
        ${it.status && it.status !== "praying" ? `<span class="tag tag-${escapeHtml(it.status)}">${escapeHtml(it.status)}</span>` : ""}</li>`
    )
    .join("");
  return `
    <section class="doc-section">
      <h3>Follow Up Students (${items.length})</h3>
      <ul class="name-list fu-grid">${lis}</ul>
    </section>`;
}

function renderPrayerPoints(points) {
  const sorted = [...points].sort((a, b) => (a.order || 0) - (b.order || 0));
  const notes = sorted
    .map((p) => {
      const n = p.order ? `${p.order}.` : "";
      return `<li class="note">
        <span class="note-title">${escapeHtml(n)} ${escapeHtml(p.title)}</span>
        ${p.summary ? `<p class="note-body">${escapeHtml(p.summary)}</p>` : ""}
        ${p.scripture ? `<span class="note-ref">${escapeHtml(p.scripture)}</span>` : ""}
      </li>`;
    })
    .join("");
  return `
    <section class="doc-section">
      <h3>Prayer for Youth (${sorted.length} points)</h3>
      <div class="notepad">
        <ol class="notes">${notes}</ol>
      </div>
    </section>`;
}

async function loadAll() {
  const data = {};
  for (const c of COLLECTIONS) {
    const r = await JsonBin.read(c.binId);
    data[c.id] = Array.isArray(r) ? r : [];
  }
  return data;
}

function setKPI(id, n) {
  $(id).textContent = n;
}

function renderAll(data) {
  const cells = data.cells;
  const members = data.members;
  const activeCells = cells.filter((c) => c.status !== "not_active");
  setKPI("kpiCells", activeCells.length);
  setKPI("kpiMembers", members.length);
  setKPI("kpiShepherds", data.sheperds.length);
  setKPI("kpiLeaders", data.leaders.length);
  setKPI("kpiFollow", data.followup.length);

  const studentCells = cellsByCategory(cells, "student");
  const bachelorCells = cellsByCategory(cells, "bachelor");
  const instituteCells = cellsByCategory(cells, "institute");

  let html = "";
  html += renderCellsSection("Student Prayer Cells", studentCells, members);
  html += renderCellsSection("Bachelor Prayer Cells", bachelorCells, members);
  html += renderCellsSection("Institutes — Plan to Start", instituteCells, members);
  html += renderListSection("Shepherds", data.sheperds, "name");
  html += renderListSection("Prayer Cell Leaders", data.leaders, "name");
  html += renderFollowUp(data.followup);
  html += renderPrayerPoints(data.prayerpoints);

  $("statsContent").innerHTML = html || `<div class="empty">No data yet.</div>`;
}

// stats.js now only provides render helpers.
// Orchestration (tabs, KPIs, charts) lives in dashboard.js.
window.SFJStats = { loadAll, renderAll, escapeHtml };