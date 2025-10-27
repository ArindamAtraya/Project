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

    // Determine backend URL (local or live)
    // const API_BASE = window.location.hostname.includes("localhost")
    //   ? "http://localhost:4000"
    //   : "https://mynest-sr8f.onrender.com"; 
      const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin; 

    // Collect form data
    const formData = new FormData(form);

    // ✅ Handle amenities properly (as an array)
    const amenities = Array.from(
      document.querySelectorAll("input[name='amenities']:checked")
    ).map((cb) => cb.value);

    formData.delete("amenities");
    amenities.forEach((a) => formData.append("amenities[]", a));

    try {
      const response = await fetch(`${API_BASE}/api/properties/add-property`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          // ❌ Don’t add Content-Type manually — browser handles it
        },
        body: formData,
      });

      const text = await response.text(); // safer than .json() if server sends HTML on error
      let data;
      try {
        data = JSON.parse(text);
      } catch {
        console.error("Non-JSON response:", text);
        throw new Error("Server returned unexpected data");
      }

      console.log("Backend response:", data);

      if (response.ok) {
        alert("✅ Property added successfully!");
        window.location.href = "my-properties.html";
      } else {
        alert(`❌ Failed: ${data.message || "Something went wrong"}`);
      }
    } catch (error) {
      console.error("Error adding property:", error);
      alert("⚠️ Server error. Please try again.");
    }
  });
});
