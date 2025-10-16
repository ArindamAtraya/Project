// add-property.js

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("propertyForm");
  
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const token = localStorage.getItem("token");
      if (!token) {
        alert("⚠️ Please login first to add a property.");
        window.location.href = "login.html";
        return;
      }
  
      // Collect form data
      const formData = new FormData(form);
  
      // ✅ Collect amenities (multiple checkboxes)
      const amenities = Array.from(document.querySelectorAll("input[name='amenities']:checked"))
        .map(cb => cb.value);
      // Remove default amenities from FormData (checkboxes already included)
        formData.delete("amenities");
      if (amenities.length > 0) {
        formData.append("amenities", amenities.join(","));
      }
      
      try {
        const response = await fetch("http://localhost:4000/api/properties/add-property", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`, // token required for auth
          },
          body: formData, // FormData automatically handles files + text
        });
  
        const data = await response.json();
        console.log("Backend response:", data);
  
        if (response.ok) {
          alert("✅ Property added successfully!");
          window.location.href = "my-properties.html"; // Redirect to My Properties
        } else {
          alert(`❌ Failed: ${data.message || "Something went wrong"}`);
        }
      } catch (error) {
        console.error("Error adding property:", error);
        alert("⚠️ Server error. Please try again.");
      }
    });
  });
  