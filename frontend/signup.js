// signup.js
const sendOtpBtn = document.getElementById("sendOtpBtn");
const signupForm = document.getElementById("signupForm");

sendOtpBtn.addEventListener("click", async () => {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const confirmPassword = document.getElementById("signupConfirmPassword").value;

  // Validate inputs
  if (!name || !email || !password || !confirmPassword) {
    alert("⚠️ Please fill in all fields.");
    return;
  }

  if (password !== confirmPassword) {
    alert("❌ Passwords do not match!");
    return;
  }

  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = "Sending OTP...";

  try {
    const res = await fetch("http://localhost:4000/api/send-signup-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ OTP sent to your email!");
      // Show OTP input and signup button
      document.querySelector(".otp-group").style.display = "block";
      document.getElementById("signupBtn").style.display = "block";
      sendOtpBtn.style.display = "none";
    } else {
      alert("❌ " + (data.message || "Failed to send OTP"));
    }
  } catch (err) {
    alert("⚠️ Server error. Please check backend.");
    console.error(err);
  } finally {
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = "Send OTP";
  }
});

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value;
  const otp = document.getElementById("signupOtp").value.trim();

  if (!otp) {
    alert("⚠️ Please enter OTP.");
    return;
  }

  try {
    const res = await fetch("http://localhost:4000/api/verify-signup-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, otp }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("✅ Signup successful! Please login.");
      window.location.href = "login.html";
    } else {
      alert("❌ " + (data.message || "OTP verification failed"));
    }
  } catch (err) {
    alert("⚠️ Error connecting to server");
    console.error(err);
  }
});
