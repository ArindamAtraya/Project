function goBack() {
  window.history.back();
}

document.addEventListener("DOMContentLoaded", async () => {
  const selectedId = localStorage.getItem("selectedPropertyId");
  console.log("Selected ID:", selectedId);

  if (!selectedId) {
    document.querySelector(".top-row").innerHTML = `<p>No property selected.</p>`;
    return;
  }

  // Determine backend URL dynamically
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin;  // 🔗 replace with your Render backend URL

  try {
    // Fetch from backend
    const res = await fetch(`${API_BASE}/api/properties/${selectedId}`);
    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Failed to fetch property");
    }

    const property = data.property; // backend returns { property: {...} }

    if (property) {
      // Image Gallery (Scrollable)
      const gallery = document.getElementById("image-gallery");
      gallery.innerHTML = "";
      (property.images || []).forEach(imgSrc => {
        const img = document.createElement("img");
        img.src = imgSrc;
        img.alt = property.title;
        gallery.appendChild(img);
      });

      document.getElementById('scroll-left').addEventListener('click', () => {
        document.getElementById('image-gallery').scrollBy({ left: -300, behavior: 'smooth' });
      });
      document.getElementById('scroll-right').addEventListener('click', () => {
        document.getElementById('image-gallery').scrollBy({ left: 300, behavior: 'smooth' });
      });

      // Right Details Box
      document.getElementById("property-price").textContent = property.price || "";
      document.getElementById("property-deposit").textContent = property.deposit ? `${property.deposit} deposit` : "";
      document.getElementById("property-furnishing").textContent = property.furnishing || "";
      document.getElementById("property-availability").textContent = `Availability: ${property.availability || "N/A"}`;
      document.getElementById("call-btn").textContent = property.phone ? `📞 Call ${property.phone}` : "📞 Call Owner";
      document.getElementById("whatsapp-btn").textContent = "💬 WhatsApp Owner";

      // PG Name and Other Details Box
      document.getElementById("property-title").textContent = property.title;
      document.getElementById("property-location").textContent = property.location;
      document.getElementById("bedrooms").textContent = property.beds || "-";
      document.getElementById("bathrooms").textContent = property.baths || "-";
      document.getElementById("area").textContent = property.sqFt || "-";
      document.getElementById("gender").textContent = property.gender || "Any";
      document.getElementById("property-description").textContent = property.description || "";

      // Amenities (if available)
      if (property.amenities && Array.isArray(property.amenities)) {
        const amenitiesContainer = document.querySelector(".amenities-grid");
        amenitiesContainer.innerHTML = property.amenities
          .map(a => `<div class="amenity-badge">${a}</div>`)
          .join("");
      }

      // Button Events
      document.getElementById("call-btn").addEventListener("click", () => {
        if (property.phone) {
          window.location.href = `tel:${property.phone}`;
        }
      });

      document.getElementById("whatsapp-btn").addEventListener("click", () => {
        if (property.whatsapp) {
          window.location.href = `https://wa.me/${property.whatsapp}`;
        }
      });
    }
  } catch (err) {
    console.error("Error loading property details:", err);
    document.querySelector(".top-row").innerHTML = `<p>Error loading property details.</p>`;
  }
});
