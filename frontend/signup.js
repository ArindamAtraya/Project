document.getElementById("signupForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  try {
    const res = await fetch("http://localhost:4000/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, confirmPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Signup successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert("❌ " + (data.message || "Signup failed"));
    }
  } catch (err) {
    alert("⚠️ Error connecting to server");
    console.error(err);
  }
});
