// add-homestay.js not being used till now simply been made
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("homestayForm");
    const token = localStorage.getItem("token");
    const userName = localStorage.getItem("userName");
    const logoutBtn = document.getElementById("logoutBtn");
    const loginLink = document.getElementById("loginLink");
    const userInfo = document.getElementById("user-info");
  
    // 1️⃣ Authentication Check
    if (!token) {
      localStorage.setItem("redirectAfterLogin", "add-homestay.html");
      alert("⚠️ Please log in to add a homestay.");
      window.location.href = "login.html";
      return;
    }
  
    // 2️⃣ Show username bottom-right and logout button
    if (userName) {
      userInfo.textContent = `👋 Hello, ${userName}`;
    }
    loginLink.style.display = "none";
    logoutBtn.style.display = "inline-block";
  
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("userName");
      window.location.href = "login.html";
    });
  
    // 3️⃣ Handle form submit
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(form);
  
      const amenities = Array.from(document.querySelectorAll("input[name='amenities']:checked"))
        .map(cb => cb.value);
      formData.delete("amenities");
      if (amenities.length > 0) formData.append("amenities", amenities.join(","));
  
      formData.set("gender", "Any");
  
      try {
        const res = await fetch("http://localhost:4000/api/properties/add-property", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
  
        const data = await res.json();
        if (res.ok) {
          alert("✅ Homestay added successfully!");
          sessionStorage.removeItem("rentease_properties_cache");
          window.location.href = "my-properties.html";
        } else {
          alert(`❌ Failed: ${data.message || "Error adding homestay"}`);
        }
      } catch (err) {
        console.error("Error adding homestay:", err);
        alert("⚠️ Server error. Please try again.");
      }
    });
  
    // 4️⃣ Image validation
    const imageInput = document.getElementById("images");
    imageInput.addEventListener("change", (e) => {
      const files = e.target.files;
      if (files.length > 5) {
        alert("⚠️ Maximum 5 images allowed");
        imageInput.value = "";
      } else {
        const helpText = imageInput.nextElementSibling;
        helpText.textContent = `${files.length} image(s) selected`;
        helpText.style.color = "green";
      }
    });
  });
  