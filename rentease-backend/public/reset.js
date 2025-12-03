// Pre-fill email if it was stored from forgot password page
window.addEventListener('DOMContentLoaded', () => {
  const savedEmail = localStorage.getItem('resetEmail');
  if (savedEmail) {
    document.getElementById('resetEmail').value = savedEmail;
  }
});

document.getElementById("resetForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("resetEmail").value.trim();
  const otp = document.getElementById("resetOtp").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Validate OTP length
  if (otp.length !== 6) {
    showMessage("❌ OTP must be 6 digits", "error");
    return;
  }

  // Validate password strength
  if (newPassword.length < 6) {
    showMessage("❌ Password must be at least 6 characters long", "error");
    return;
  }

  // Remove any existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Resetting... <span class="spinner"></span>';

  // ✅ Dynamic backend URL
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin;  // replace with your Render backend URL

  try {
    const res = await fetch(`${API_BASE}/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp, newPassword }),
    });

    const data = await res.json();

    if (res.ok) {
      // Show success message
      showMessage("✅ Password reset successful! Redirecting to login...", "success");
      
      // Clear stored email
      localStorage.removeItem('resetEmail');
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      // Show error message
      showMessage("❌ " + (data.message || "Invalid OTP or email"), "error");
      
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  } catch (err) {
    // Show connection error
    showMessage("⚠️ Error connecting to server. Please ensure the backend is running.", "error");
    console.error(err);
    
    // Re-enable button
    submitBtn.disabled = false;
    submitBtn.textContent = originalBtnText;
  }
});

// Helper function to show messages
function showMessage(text, type) {
  // Remove any existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Create new message element
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}`;
  messageDiv.textContent = text;

  // Insert before the form buttons
  const form = document.getElementById('resetForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  form.insertBefore(messageDiv, submitBtn);
}
