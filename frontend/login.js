document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  try {
    const res = await fetch("http://localhost:4000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("userName", data.userName || email.split("@")[0]); // fallback
      alert("✅ Login successful");
      window.location.href = "home.html";
    } else {
      alert("❌ " + (data.message || "Login failed"));
    }
  } catch (err) {
    alert("⚠️ Error connecting to server");
    console.error(err);
  }
});
