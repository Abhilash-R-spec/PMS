function setKPI(id, n) {
  const el = $(id);
  if (el) el.textContent = n;
}

const PALETTE = ["#1d4ed8", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];
const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const charts = {};

function destroyChart(key) {
  if (charts[key]) {
    charts[key].destroy();
    delete charts[key];
  }
}

function makeChart(key, ctx, config) {
  destroyChart(key);
  charts[key] = new Chart(ctx, config);
}

function countBy(arr, fn) {
  const m = {};
  for (const x of arr) {
    const k = fn(x);
    if (k == null || k === "") continue;
    m[k] = (m[k] || 0) + 1;
  }
  return m;
}

function chartOptsBar(horizontal) {
  return {
    indexAxis: horizontal ? "y" : "x",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: horizontal ? { x: { beginAtZero: true } } : { y: { beginAtZero: true } }
  };
}

function renderDashboard(data) {
  const cells = data.cells || [];
  const members = data.members || [];
  const follow = data.followup || [];

  const active = cells.filter((c) => c.status === "active").length;
  const plan = cells.filter((c) => c.status === "plan").length;
  const yet = cells.filter((c) => c.status === "yet_to_start").length;

  setKPI("kpiCells", cells.length);
  setKPI("kpiActive", active);
  setKPI("kpiPlan", plan);
  setKPI("kpiYet", yet);
  setKPI("kpiMembers", members.length);
  setKPI("kpiShepherds", (data.sheperds || []).length);
  setKPI("kpiLeaders", (data.leaders || []).length);
  setKPI("kpiFollow", follow.length);
  setKPI("kpiPoints", (data.prayerpoints || []).length);

  const perCell = countBy(members, (m) => m.cellId);
  const cellName = {};
  cells.forEach((c) => (cellName[c.cellId] = c.name));
  let entries = Object.entries(perCell).map((e) => [cellName[e[0]] || e[0], e[1]]);
  entries.sort((a, b) => b[1] - a[1]);
  entries = entries.slice(0, 12);
  makeChart("members", $("chartMembers"), {
    type: "bar",
    data: {
      labels: entries.map((e) => e[0]),
      datasets: [{ label: "Members", data: entries.map((e) => e[1]), backgroundColor: "#1d4ed8" }]
    },
    options: chartOptsBar(true)
  });

  const day = countBy(cells, (c) => c.day);
  const dayLabels = DAY_ORDER.filter((d) => day[d]);
  makeChart("day", $("chartDay"), {
    type: "bar",
    data: {
      labels: dayLabels,
      datasets: [{ label: "Cells", data: dayLabels.map((d) => day[d]), backgroundColor: "#10b981" }]
    },
    options: chartOptsBar(false)
  });

  makeChart("people", $("chartPeople"), {
    type: "bar",
    data: {
      labels: ["Shepherds", "Leaders", "Follow-up", "Members", "Prayer Points"],
      datasets: [{
        label: "Count",
        data: [(data.sheperds || []).length, (data.leaders || []).length, follow.length, members.length, (data.prayerpoints || []).length],
        backgroundColor: PALETTE
      }]
    },
    options: chartOptsBar(false)
  });
}

function switchTab(tab) {
  document.querySelectorAll(".nav-item").forEach((t) =>
    t.classList.toggle("active", t.dataset.tab === tab)
  );
  $("panel-dashboard").style.display = tab === "dashboard" ? "" : "none";
  $("panel-details").style.display = tab === "details" ? "" : "none";
  $("pageTitle").textContent = tab === "dashboard" ? "Dashboard" : "Details";
  if (tab === "dashboard") renderDashboard(window._sfjData);
}

document.addEventListener("DOMContentLoaded", () => {
  if (!Auth.isLoggedIn()) {
    location.replace("login.html?next=stats.html");
    return;
  }
  $("userTag").textContent = "👤 " + Auth.currentUser();

  const isStaff = Auth.isAdmin() || Auth.isShepherd();
  $("btnManage").style.display = isStaff ? "" : "none";
  $("btnPrint").addEventListener("click", () => window.print());
  $("btnManage").addEventListener("click", () => location.replace("index.html"));
  $("btnLogout").addEventListener("click", () => {
    Auth.logout();
    location.replace("login.html");
  });

  document.querySelectorAll(".nav-item").forEach((t) =>
    t.addEventListener("click", () => switchTab(t.dataset.tab))
  );

  (async () => {
    try {
      const data = await window.SFJStats.loadAll();
      window._sfjData = data;
      renderDashboard(data);
      window.SFJStats.renderAll(data);
    } catch (err) {
      const msg = window.SFJStats.escapeHtml(err.message);
      $("panel-details").innerHTML = '<div class="empty">Failed to load: ' + msg + "</div>";
    }
  })();
});