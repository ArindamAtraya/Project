// forgot.js
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
    e.preventDefault();
  
    const email = document.getElementById("forgotEmail").value;
  
    const res = await fetch("http://localhost:4000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
  
    const data = await res.json();
  
    if (res.ok) {
      alert("✅ Reset link sent! Check your email.");
      window.location.href = "login.html";
    } else {
      alert("❌ " + data.message);
    }
  });
  