const API_BASE = "https://api.jsonbin.io/v3/b";
const KEY_STORAGE = "sfj_jsonbin_key";
const DEFAULT_KEY = "$2a$10$E9wLiyGDbIf7H9.U6zYt4eR3TjDMCyZ0.2g32wEWXRUC9SgTsAXQS";

const JsonBin = {
  getKey() {
    return localStorage.getItem(KEY_STORAGE) || DEFAULT_KEY;
  },
  setKey(key) {
    localStorage.setItem(KEY_STORAGE, key.trim());
  },
  hasKey() {
    return !!this.getKey();
  },
  async request(binId, { method = "GET", body = null } = {}) {
    const headers = {
      "Content-Type": "application/json",
      "X-Master-Key": this.getKey(),
      "X-Bin-Meta": "false"
    };
    const res = await fetch(`${API_BASE}/${binId}`, {
      method,
      headers,
      body: body !== null ? JSON.stringify(body) : null
    });
    if (!res.ok) {
      let msg = `HTTP ${res.status}`;
      try {
        const err = await res.json();
        msg = err.message || msg;
      } catch (e) {}
      throw new Error(msg);
    }
    return res.json();
  },
  async read(binId) {
    return this.request(binId);
  },
  async write(binId, record) {
    return this.request(binId, { method: "PUT", body: record });
  }
};