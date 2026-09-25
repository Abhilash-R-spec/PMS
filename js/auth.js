const AUTH_BIN = "6a82ee86da38895dfeee7302";
const SESSION_KEY = "sfj_session";

const Auth = {
  USER_CONFIG_KEY: "auth_users",

  async sha256(text) {
    const data = new TextEncoder().encode(text);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(buf))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  },

  async getUsers() {
    const headers = {
      "Content-Type": "application/json",
      "X-Master-Key": JsonBin.getKey(),
      "X-Bin-Meta": "false"
    };
    const res = await fetch(`https://api.jsonbin.io/v3/b/${AUTH_BIN}`, { headers });
    if (!res.ok) throw new Error("Auth server unavailable (" + res.status + ")");
    const users = await res.json();
    return Array.isArray(users) ? users : [];
  },

  async saveUsers(users) {
    const headers = {
      "Content-Type": "application/json",
      "X-Master-Key": JsonBin.getKey(),
      "X-Bin-Meta": "false"
    };
    const res = await fetch(`https://api.jsonbin.io/v3/b/${AUTH_BIN}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(users)
    });
    if (!res.ok) throw new Error("Auth save failed (" + res.status + ")");
  },

  isLoggedIn() {
    return sessionStorage.getItem(SESSION_KEY) === "1";
  },

  login(username, role) {
    sessionStorage.setItem(SESSION_KEY, "1");
    sessionStorage.setItem("sfj_user", username);
    sessionStorage.setItem("sfj_role", role || "viewer");
  },

  logout() {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem("sfj_user");
    sessionStorage.removeItem("sfj_role");
  },

  currentUser() {
    return sessionStorage.getItem("sfj_user");
  },

  role() {
    return sessionStorage.getItem("sfj_role") || "viewer";
  },

  isAdmin() {
    return this.role() === "admin";
  },

  isShepherd() {
    return this.role() === "shepherd";
  },

  canEdit() {
    return this.isAdmin() || this.isShepherd();
  },

  gate() {
    if (!this.isLoggedIn()) {
      location.href = "login.html?next=" + encodeURIComponent(location.pathname.split("/").pop());
      return;
    }
  },

  gateRole(page) {
    if (!this.isLoggedIn()) {
      location.href = "login.html?next=" + encodeURIComponent(page);
      return false;
    }
    const role = this.role();
    if (role === "viewer" && page !== "stats.html") {
      location.replace("stats.html");
      return false;
    }
    if (role !== "viewer" && page === "stats.html") {
      // staff may also view stats
      return true;
    }
    return true;
  },

  async verify(username, password) {
    const users = await this.getUsers();
    const passHash = await this.sha256(password);
    const u = users.find((x) => x.username === username && x.passHash === passHash);
    return u ? { username: u.username, role: u.role || "viewer" } : null;
  },

  async changeOwnPassword(username, oldPass, newPass) {
    const users = await this.getUsers();
    const oldHash = await this.sha256(oldPass);
    const u = users.find((x) => x.username === username);
    if (!u) throw new Error("User not found");
    if (u.passHash !== oldHash) throw new Error("Current password is incorrect");
    u.passHash = await this.sha256(newPass);
    await this.saveUsers(users);
  },

  async adminResetPassword(username, newPass) {
    const users = await this.getUsers();
    const u = users.find((x) => x.username === username);
    if (!u) throw new Error("User not found");
    u.passHash = await this.sha256(newPass);
    await this.saveUsers(users);
  },

  async adminAddUser(username, password, role) {
    const users = await this.getUsers();
    if (users.some((x) => x.username === username)) throw new Error("Username already exists");
    if (!["admin", "shepherd", "viewer"].includes(role)) throw new Error("Invalid role");
    users.push({
      userId: "U" + String(users.length + 1).padStart(3, "0"),
      username,
      passHash: await this.sha256(password),
      role
    });
    await this.saveUsers(users);
  },

  async adminDeleteUser(username) {
    if (username === this.currentUser()) throw new Error("Cannot delete your own account");
    const users = await this.getUsers();
    if (users.length <= 1) throw new Error("At least one account must remain");
    await this.saveUsers(users.filter((u) => u.username !== username));
  }
};