let current = null;
let cache = [];

const $ = (id) => document.getElementById(id);

if (!Auth.isLoggedIn()) {
  location.replace("login.html");
} else if (Auth.role() === "viewer") {
  location.replace("stats.html");
}

function toast(msg, isErr = false) {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + (isErr ? "err" : "ok");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = "toast"), 3000);
}

function renderNav(selId) {
  const nav = $("navList");
  nav.innerHTML = "";
  for (const c of COLLECTIONS) {
    const li = document.createElement("li");
    li.className = "nav-item" + (c.id === selId ? " active" : "");
    li.dataset.id = c.id;
    const clear = Auth.isAdmin()
      ? `<span class="nav-clear" title="Delete ALL records" data-id="${c.id}" data-name="${c.label}">&times;</span>`
      : "";
    li.innerHTML = `<span class="nav-label">${c.label}</span>${clear}`;
    nav.appendChild(li);
  }
  const isAdmin = Auth.isAdmin();
  document.querySelectorAll(".admin-only").forEach((el) => {
    el.style.display = isAdmin ? "" : "none";
  });
}

function getIdField() {
  return current.fields.find((f) => f.key.endsWith("Id"));
}

function render() {
  renderNav(current ? current.id : null);
  if (!current) return;
  $("pageTitle").textContent = current.label;

  const q = ($("search").value || "").trim().toLowerCase();
  const rows = q
    ? cache.filter((r) =>
        Object.values(r).join(" ").toLowerCase().includes(q)
      )
    : cache;
  $("count").textContent = `${rows.length} record${rows.length === 1 ? "" : "s"}`;

  const thead = $("thead-row");
  thead.innerHTML = "";
  for (const f of current.fields) {
    const th = document.createElement("th");
    th.textContent = f.label;
    thead.appendChild(th);
  }
  const th = document.createElement("th");
  th.textContent = "Actions";
  th.className = "actions-th";
  thead.appendChild(th);

  const idKey = getIdField();
  const tbody = $("tbody");
  tbody.innerHTML = "";
  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="99" class="empty">No records found.</td></tr>`;
    return;
  }
  for (const row of rows) {
    const tr = document.createElement("tr");
    for (const f of current.fields) {
      const td = document.createElement("td");
      let v = row[f.key];
      if (v === null || v === undefined) v = "";
      if (typeof v === "object") v = JSON.stringify(v);
      const isTxt = f.type === "textarea" || f.type === "text";
      if (String(v).length > 36) {
        td.title = String(v);
        if (isTxt) v = String(v).slice(0, 36) + "…";
      }
      td.textContent = v;
      tr.appendChild(td);
    }
    const td = document.createElement("td");
    td.className = "actions";
    td.innerHTML = `<button class="btn btn-sm edit" title="Edit">✎</button>
                    <button class="btn btn-sm del" title="Delete">🗑</button>`;
    tr.appendChild(td);
    td.querySelector(".edit").addEventListener("click", () => openEdit(row));
    td.querySelector(".del").addEventListener("click", () => removeRecord(row));
    tbody.appendChild(tr);
  }
}

function buildForm(row) {
  const form = $("form");
  form.innerHTML = "";
  for (const f of current.fields) {
    const wrap = document.createElement("div");
    wrap.className = "field";
    const lab = document.createElement("label");
    lab.textContent = f.label + (f.required ? " *" : "");
    const val = row && row[f.key] != null ? row[f.key] : "";

    let input;
    if (f.type === "textarea") {
      input = document.createElement("textarea");
      input.rows = 4;
    } else if (f.type === "select") {
      input = document.createElement("select");
      const empty = document.createElement("option");
      empty.value = "";
      empty.textContent = "— select —";
      input.appendChild(empty);
      for (const o of f.options) {
        const opt = document.createElement("option");
        opt.value = o;
        opt.textContent = o;
        input.appendChild(opt);
      }
    } else {
      input = document.createElement("input");
      input.type = f.type || "text";
      if (f.type === "number") input.step = "any";
    }
    input.name = f.key;
    input.className = "input";
    if (f.type !== "select") input.value = val;
    else input.value = String(val || "");
    if (f.required) input.required = true;

    wrap.appendChild(lab);
    wrap.appendChild(input);
    form.appendChild(wrap);
  }
}

function openAdd() {
  if (!current) return toast("Select a collection first.", true);
  $("modalTitle").textContent = `Add ${current.label}`;
  window._editing = null;
  buildForm(null);
  $("modal").classList.add("open");
}

function openEdit(row) {
  $("modalTitle").textContent = `Edit ${current.label}`;
  window._editing = row;
  buildForm(row);
  $("modal").classList.add("open");
}

function closeModal() {
  $("modal").classList.remove("open");
}

function formToRow() {
  const fd = new FormData($("form"));
  const row = {};
  for (const f of current.fields) {
    let v = fd.get(f.key);
    if (f.type === "number") v = v !== "" && v != null ? Number(v) : null;
    if (f.type === "select" && v === "") v = null;
    if (v === "" && f.type === "text") v = "";
    row[f.key] = v;
  }
  return row;
}

async function save(evt) {
  evt.preventDefault();
  const row = formToRow();
  const idKey = getIdField();
  if (window._editing) {
    const idx = cache.findIndex((r) => r[idKey.key] == window._editing[idKey.key]);
    if (idx >= 0) cache[idx] = row;
  } else {
    cache.push(row);
  }
  try {
    await JsonBin.write(current.binId, cache);
    closeModal();
    render();
    toast("Saved ✓");
  } catch (err) {
    toast("Save failed: " + err.message, true);
  }
}

async function removeRecord(row) {
  const idKey = getIdField();
  const label = idKey ? row[idKey.key] : "record";
  if (!confirm(`Delete "${label}"?`)) return;
  cache = cache.filter((r) => r !== row);
  try {
    await JsonBin.write(current.binId, cache);
    render();
    toast("Deleted ✓");
  } catch (err) {
    toast("Delete failed: " + err.message, true);
  }
}

async function clearCollection(colId) {
  const c = COLLECTIONS.find((x) => x.id === colId);
  if (!confirm(`Delete ALL records in "${c.label}"? This cannot be undone.`)) return;
  const wasCurrent = current && current.id === colId;
  try {
    await JsonBin.write(c.binId, []);
    if (wasCurrent) {
      cache = [];
      render();
    }
    toast(`Cleared ${c.label} ✓`);
  } catch (err) {
    toast("Clear failed: " + err.message, true);
  }
}

async function selectCollection(id) {
  const c = COLLECTIONS.find((x) => x.id === id);
  if (!c) return;
  current = c;
  cache = [];
  render();
  try {
    const data = await JsonBin.read(c.binId);
    cache = Array.isArray(data) ? data : [];
    render();
  } catch (err) {
    if (/401|403|unauthorized|forbidden/i.test(err.message)) {
      toast("API access problem — please contact the administrator.", true);
    } else {
      toast("Load failed: " + err.message, true);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    const tag = document.getElementById("userTag");
    tag.textContent = "👤 " + (Auth.currentUser() || "user");
  }
  document.getElementById("btnLogout").addEventListener("click", () => {
    Auth.logout();
    location.replace("login.html");
  });
  $("navList").addEventListener("click", (e) => {
    const item = e.target.closest(".nav-item");
    if (!item) return;
    if (e.target.classList.contains("nav-clear")) {
      clearCollection(item.dataset.id);
      return;
    }
    selectCollection(item.dataset.id);
  });
  $("btnAdd").addEventListener("click", openAdd);
  $("btnClose").addEventListener("click", closeModal);
  $("form").addEventListener("submit", save);
  $("btnPw").addEventListener("click", () => {
    $("pwOld").value = "";
    $("pwNew").value = "";
    $("pwNew2").value = "";
    $("pwModal").classList.add("open");
  });
  $("btnPwClose").addEventListener("click", () => $("pwModal").classList.remove("open"));
  $("pwForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const oldP = $("pwOld").value;
    const n1 = $("pwNew").value;
    const n2 = $("pwNew2").value;
    if (n1 !== n2) return toast("New passwords do not match.", true);
    try {
      await Auth.changeOwnPassword(Auth.currentUser(), oldP, n1);
      $("pwModal").classList.remove("open");
      toast("Password updated ✓");
    } catch (err) {
      toast(err.message, true);
    }
  });
  $("search").addEventListener("input", render);

  if (Auth.isAdmin()) {
    $("btnUsers").addEventListener("click", openUsersModal);
    $("btnUsersClose").addEventListener("click", () => $("usersModal").classList.remove("open"));
    $("userAddForm").addEventListener("submit", onAddUser);
  }

  renderNav();
  selectCollection(COLLECTIONS[0].id);
});

async function openUsersModal() {
  $("usersModal").classList.add("open");
  await renderUserList();
}

async function renderUserList() {
  const list = $("userList");
  list.innerHTML = "";
  let users;
  try {
    users = await Auth.getUsers();
  } catch (err) {
    list.innerHTML = `<li class="user-item err">${err.message}</li>`;
    return;
  }
  const me = Auth.currentUser();
  for (const u of users) {
    const li = document.createElement("li");
    li.className = "user-item";
    const isMe = u.username === me;
    li.innerHTML = `<span class="user-name">${u.username}${isMe ? " (you)" : ""}</span>
                    <span class="badge badge-${u.role}">${u.role}</span>`;
    if (isMe) {
      const resetBtn = document.createElement("button");
      resetBtn.className = "btn btn-sm edit";
      resetBtn.textContent = "Reset";
      resetBtn.addEventListener("click", () => onResetPassword(u.username));
      li.appendChild(resetBtn);
    } else {
      const resetBtn = document.createElement("button");
      resetBtn.className = "btn btn-sm edit";
      resetBtn.textContent = "Reset";
      resetBtn.addEventListener("click", () => onResetPassword(u.username));
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm del";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => onDeleteUser(u.username));
      li.append(resetBtn, delBtn);
    }
    list.appendChild(li);
  }
}

async function onAddUser(e) {
  e.preventDefault();
  const uname = $("uaUsername").value.trim();
  const pass = $("uaPassword").value;
  const role = $("uaRole").value;
  if (!uname || !pass) return;
  try {
    await Auth.adminAddUser(uname, pass, role);
    $("uaUsername").value = "";
    $("uaPassword").value = "";
    toast(`Added ${uname} ✓`);
    await renderUserList();
  } catch (err) {
    toast(err.message, true);
  }
}

async function onDeleteUser(uname) {
  if (!confirm(`Delete user "${uname}"?`)) return;
  try {
    await Auth.adminDeleteUser(uname);
    toast(`Deleted ${uname} ✓`);
    await renderUserList();
  } catch (err) {
    toast(err.message, true);
  }
}

async function onResetPassword(uname) {
  const np = prompt(`New password for "${uname}" (min 6 chars):`);
  if (!np || np.length < 6) return toast("Password must be at least 6 characters.", true);
  try {
    await Auth.adminResetPassword(uname, np);
    toast(`Password reset for ${uname} ✓`);
  } catch (err) {
    toast(err.message, true);
  }
}