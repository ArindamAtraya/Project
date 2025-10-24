document.addEventListener("DOMContentLoaded", function() {
  const loginForm = document.getElementById("loginForm");
  const loginButton = loginForm.querySelector('.btn-primary');
  
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    // Basic validation
    if (!email || !password) {
      showMessage('Please fill in all fields', 'error');
      return;
    }

    if (!isValidEmail(email)) {
      showMessage('Please enter a valid email address', 'error');
      return;
    }

    // Show loading state
    setLoadingState(true);

    try {
      const res = await fetch("http://localhost:4000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.userName || email.split("@")[0]);
        showMessage('✅ Login successful! Redirecting...', 'success');
        
        // Redirect after a short delay
        setTimeout(() => {
          window.location.href = "home.html";
        }, 1000);
      } else {
        showMessage('❌ ' + (data.message || "Invalid email or password"), 'error');
      }
    } catch (err) {
      console.error("Login error:", err);
      showMessage('⚠️ Network error. Please check your connection and try again.', 'error');
    } finally {
      setLoadingState(false);
    }
  });

  // Helper function to validate email
  function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Helper function to show messages
  function showMessage(message, type) {
    // Remove existing messages
    const existingMessage = document.querySelector('.message');
    if (existingMessage) {
      existingMessage.remove();
    }

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${type === 'error' ? 'error-message' : 'success-message'}`;
    messageDiv.textContent = message;
    
    // Insert after the form title
    const form = document.getElementById('loginForm');
    form.parentNode.insertBefore(messageDiv, form);
    
    // Auto-remove success messages after 3 seconds
    if (type === 'success') {
      setTimeout(() => {
        if (messageDiv.parentNode) {
          messageDiv.remove();
        }
      }, 3000);
    }
  }

  // Helper function to set loading state
  function setLoadingState(isLoading) {
    if (isLoading) {
      loginButton.disabled = true;
      loginButton.innerHTML = '<div class="loading"></div> Logging in...';
      loginButton.style.opacity = '0.8';
    } else {
      loginButton.disabled = false;
      loginButton.innerHTML = 'Login';
      loginButton.style.opacity = '1';
    }
  }

  // Add input validation styling
  const inputs = document.querySelectorAll('input');
  inputs.forEach(input => {
    input.addEventListener('blur', function() {
      if (this.value.trim() === '') {
        this.style.borderColor = '#e0e0e0';
      } else if (this.type === 'email' && !isValidEmail(this.value)) {
        this.style.borderColor = '#dc3545';
      } else {
        this.style.borderColor = '#28a745';
      }
    });

    input.addEventListener('input', function() {
      if (this.style.borderColor === 'rgb(220, 53, 69)') {
        this.style.borderColor = '#e0e0e0';
      }
    });
  });

  // Handle back button click properly
  const backButton = document.querySelector('.back-button');
  if (backButton) {
    backButton.addEventListener('click', function(e) {
      e.preventDefault();
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.href = 'home.html';
      }
    });
  }
});