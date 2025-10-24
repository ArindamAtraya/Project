// forget-password.js
document.getElementById("forgotForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("forgotEmail").value.trim();
  const submitBtn = e.target.querySelector('button[type="submit"]');
  const originalBtnText = submitBtn.textContent;

  // Remove any existing message
  const existingMessage = document.querySelector('.message');
  if (existingMessage) {
    existingMessage.remove();
  }

  // Disable button and show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = 'Sending... <span class="spinner"></span>';

  try {
    const res = await fetch("http://localhost:4000/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      // Show success message
      showMessage("✅ OTP sent to your email successfully!", "success");
      
      // Store email for reset page
      localStorage.setItem("resetEmail", email);
      
      // Redirect after a short delay
      setTimeout(() => {
        window.location.href = "reset-password.html";
      }, 1500);
    } else {
      // Show error message
      showMessage("❌ " + (data.message || "Something went wrong"), "error");
      
      // Re-enable button
      submitBtn.disabled = false;
      submitBtn.textContent = originalBtnText;
    }
  } catch (err) {
    // Show connection error
    showMessage("⚠️ Unable to connect to server. Please ensure the backend is running.", "error");
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
  const form = document.getElementById('forgotForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  form.insertBefore(messageDiv, submitBtn);
}
