document.addEventListener("DOMContentLoaded", function() {
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin;  // replace with your Render backend URL

  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const signupForm = document.getElementById("signupForm");
  const signupBtn = document.getElementById("signupBtn");

  // Add CSS for OTP hint and password strength
  const style = document.createElement('style');
  style.textContent = `
    .otp-hint { color: #666; font-size: 12px; margin-top: 5px; display: block; }
    .password-strength { margin-top: 5px; font-size: 12px; }
    .strength-weak { color: #dc3545; }
    .strength-medium { color: #ffc107; }
    .strength-strong { color: #28a745; }
  `;
  document.head.appendChild(style);

  // Password strength indicator
  const passwordInput = document.getElementById("signupPassword");
  passwordInput.addEventListener('input', function() {
    checkPasswordStrength(this.value);
  });

  function checkPasswordStrength(password) {
    const strengthDiv = document.querySelector('.password-strength') || createStrengthIndicator();
    let strength = 'Weak', strengthClass = 'strength-weak';

    if (password.length >= 8) {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /\d/.test(password);
      const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

      const requirementsMet = [hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar].filter(Boolean).length;

      if (requirementsMet >= 3 && password.length >= 10) { strength = 'Strong'; strengthClass = 'strength-strong'; }
      else if (requirementsMet >= 2) { strength = 'Medium'; strengthClass = 'strength-medium'; }
    }

    strengthDiv.textContent = `Password strength: ${strength}`;
    strengthDiv.className = `password-strength ${strengthClass}`;
  }

  function createStrengthIndicator() {
    const strengthDiv = document.createElement('div');
    strengthDiv.className = 'password-strength';
    passwordInput.parentNode.appendChild(strengthDiv);
    return strengthDiv;
  }

  sendOtpBtn.addEventListener("click", async () => {
    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const confirmPassword = document.getElementById("signupConfirmPassword").value;

    if (!name || !email || !password || !confirmPassword) { showMessage('Please fill in all fields', 'error'); return; }
    if (name.length < 2) { showMessage('Please enter a valid name', 'error'); return; }
    if (!isValidEmail(email)) { showMessage('Please enter a valid email address', 'error'); return; }
    if (password.length < 6) { showMessage('Password must be at least 6 characters long', 'error'); return; }
    if (password !== confirmPassword) { showMessage('Passwords do not match', 'error'); return; }

    setOtpButtonState(true, 'Sending OTP...');

    try {
      const res = await fetch(`${API_BASE}/api/send-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('✅ OTP sent to your email! Please check your inbox.', 'success');
        document.querySelector(".otp-group").style.display = "block";
        signupBtn.style.display = "block";
        sendOtpBtn.style.display = "none";
        document.getElementById("signupOtp").focus();
        startOtpTimer();
      } else {
        showMessage('❌ ' + (data.message || "Failed to send OTP"), 'error');
      }
    } catch (err) {
      console.error("OTP sending error:", err);
      showMessage('⚠️ Network error. Please check your connection.', 'error');
    } finally {
      setOtpButtonState(false, 'Send OTP');
    }
  });

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;
    const otp = document.getElementById("signupOtp").value.trim();

    if (!otp) { showMessage('Please enter the OTP', 'error'); return; }
    if (otp.length !== 6 || !/^\d+$/.test(otp)) { showMessage('Please enter a valid 6-digit OTP', 'error'); return; }

    setSignupButtonState(true, 'Verifying...');

    try {
      const res = await fetch(`${API_BASE}/api/verify-signup-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, otp }),
      });

      const data = await res.json();

      if (res.ok) {
        showMessage('✅ Account created successfully! Redirecting to login...', 'success');
        setTimeout(() => { window.location.href = "login.html"; }, 2000);
      } else {
        showMessage('❌ ' + (data.message || "OTP verification failed"), 'error');
      }
    } catch (err) {
      console.error("Signup error:", err);
      showMessage('⚠️ Network error. Please try again.', 'error');
    } finally {
      setSignupButtonState(false, 'Verify & Create Account');
    }
  });

  // Helper functions
  function isValidEmail(email) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); }
  function showMessage(message, type) {
    const existingMessage = document.querySelector('.message'); if (existingMessage) existingMessage.remove();
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'error' ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    const form = document.getElementById('signupForm');
    form.parentNode.insertBefore(messageDiv, form);
    if (type === 'success') setTimeout(() => { if (messageDiv.parentNode) messageDiv.remove(); }, 5000);
  }
  function setOtpButtonState(isLoading, text) { sendOtpBtn.disabled = isLoading; sendOtpBtn.innerHTML = isLoading ? '<div class="loading"></div> ' + text : text; sendOtpBtn.style.opacity = isLoading ? '0.7' : '1'; }
  function setSignupButtonState(isLoading, text) { signupBtn.disabled = isLoading; signupBtn.innerHTML = isLoading ? '<div class="loading"></div> ' + text : text; signupBtn.style.opacity = isLoading ? '0.7' : '1'; }

  function startOtpTimer() {
    let timeLeft = 300;
    const timerElement = document.createElement('div');
    timerElement.className = 'otp-timer';
    timerElement.style.cssText = 'color: #666; font-size: 12px; margin-top: 5px; text-align: center;';
    const otpGroup = document.querySelector('.otp-group');
    const existingTimer = otpGroup.querySelector('.otp-timer');
    if (existingTimer) existingTimer.remove();
    otpGroup.appendChild(timerElement);

    const timer = setInterval(() => {
      const minutes = Math.floor(timeLeft / 60);
      const seconds = timeLeft % 60;
      timerElement.textContent = `OTP expires in: ${minutes}:${seconds.toString().padStart(2, '0')}`;
      if (timeLeft <= 0) {
        clearInterval(timer);
        timerElement.textContent = 'OTP has expired. Please request a new one.';
        timerElement.style.color = '#dc3545';
        sendOtpBtn.style.display = 'block';
        signupBtn.style.display = 'none';
        document.querySelector(".otp-group").style.display = "none";
      }
      timeLeft--;
    }, 1000);
  }

  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => { if (input.style.borderColor === 'rgb(220, 53, 69)') input.style.borderColor = '#e0e0e0'; });
  });

  function validateField(field) {
    const value = field.value.trim();
    if (!value) { field.style.borderColor = '#e0e0e0'; return; }

    switch(field.type) {
      case 'email': field.style.borderColor = isValidEmail(value) ? '#28a745' : '#dc3545'; break;
      case 'password':
        if (field.id === 'signupConfirmPassword') {
          const password = document.getElementById('signupPassword').value;
          field.style.borderColor = value === password ? '#28a745' : '#dc3545';
        } else { field.style.borderColor = value.length >= 6 ? '#28a745' : '#dc3545'; }
        break;
      case 'text': if (field.id === 'signupName') field.style.borderColor = value.length >= 2 ? '#28a745' : '#dc3545'; break;
    }
  }

  const backButton = document.querySelector('.back-button');
  if (backButton) backButton.addEventListener('click', (e) => {
    e.preventDefault();
    if (window.history.length > 1) window.history.back();
    else window.location.href = 'home.html';
  });

  document.getElementById('signupOtp')?.addEventListener('keypress', function(e) {
    if (e.key === 'Enter' && signupBtn.style.display !== 'none') signupForm.dispatchEvent(new Event('submit'));
  });
});
