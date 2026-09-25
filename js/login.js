const $ = (id) => document.getElementById(id);

function toast(msg, isErr = false) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "toast show " + (isErr ? "err" : "ok");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => (t.className = "toast"), 3000);
}

document.addEventListener("DOMContentLoaded", () => {
  if (Auth.isLoggedIn()) {
    location.replace("index.html");
    return;
  }

  $("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    const user = $("username").value.trim();
    const pass = $("password").value;
    $("loginError").textContent = "";
    $("loginBtn").disabled = true;
    $("loginBtn").textContent = "Checking…";

    try {
      const result = await Auth.verify(user, pass);
      if (result) {
        Auth.login(result.username, result.role);
        toast("Welcome, " + result.username + " ✓");
        setTimeout(() => {
          const next = new URLSearchParams(location.search).get("next") || "index.html";
          location.replace(next);
        }, 400);
      } else {
        toast("Invalid username or password", true);
        $("loginError").textContent = "Invalid username or password.";
        $("loginBtn").disabled = false;
        $("loginBtn").textContent = "Sign in";
      }
    } catch (err) {
      toast("Login error: " + err.message, true);
      $("loginError").textContent = err.message;
      $("loginBtn").disabled = false;
      $("loginBtn").textContent = "Sign in";
    }
  });
});