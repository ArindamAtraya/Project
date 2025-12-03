document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("⚠️ You must be logged in to view your properties.");
    window.location.href = "login.html";
    return;
  }

  const container = document.getElementById("properties-container");
  const modal = document.getElementById("editModal");
  const closeModalBtn = document.getElementById("closeModal");
  const editForm = document.getElementById("editForm");

  // ✅ For image editing
  let existingImages = [];
  const imagePreview = document.createElement("div");
  imagePreview.id = "imagePreview";
  imagePreview.className = "flex flex-wrap gap-2 mt-2";

  // Determine backend URL dynamically
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin;

  try {
    const response = await fetch(`${API_BASE}/api/properties/my-properties`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await response.json();

    if (!response.ok) {
      container.innerHTML = `
        <p class="text-red-600">❌ Failed to load properties</p>
        <p class="text-sm text-gray-500">(${data.message || data.error || "Unknown error"})</p>
      `;
      return;
    }

    if (data.properties.length === 0) {
      container.innerHTML = `<p class="text-gray-600">📭 You haven't added any properties yet.</p>`;
      return;
    }

    data.properties.forEach(property => {
      console.log("🔍 DEBUG Property Data:", {
        title: property.title,
        price: property.price,
        type: property.type,
        rawPrice: property.price
      });

      const card = document.createElement("div");
      card.className = "bg-white rounded-lg shadow-md overflow-hidden flex flex-col";

      // ✅ Show ALL images in a horizontal preview
      let imagesHtml = "";
      if (property.images && property.images.length > 0) {
        imagesHtml = `
          <div class="flex overflow-x-auto gap-2 p-2 bg-gray-100">
            ${property.images.map(img => `
              <img src="${img}" alt="Property Image" class="h-32 w-48 object-cover rounded">
            `).join("")}
          </div>
        `;
      } else {
        imagesHtml = `
          <div class="bg-gray-200 h-32 flex items-center justify-center text-gray-500">
            No Images
          </div>
        `;
      }

      card.innerHTML = `
        ${imagesHtml}
        <div class="p-4 flex flex-col flex-1">
          <h3 class="text-lg font-semibold text-gray-800">${property.title}</h3>
          <p class="text-gray-600">${property.location}</p>
          <p class="text-blue-600 font-bold mt-2">${property.price}</p>
          <p class="text-sm text-gray-500">${property.beds} Beds • ${property.baths} Baths • ${property.sqFt} SqFt</p>
          
          <div class="flex gap-2 mt-4">
            <button class="edit-btn flex-1 px-3 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
              data-id="${property._id}">Edit</button>
            <button class="delete-btn flex-1 px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              data-id="${property._id}">Delete</button>
          </div>
        </div>
      `;
      container.appendChild(card);
    });

    // Delete property
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        if (!confirm("🗑️ Are you sure you want to delete this property?")) return;

        try {
          const res = await fetch(`${API_BASE}/api/properties/${id}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` },
          });

          const result = await res.json();
          if (!res.ok) {
            alert(`❌ Failed: ${result.message || result.error || "Unknown error"}`);
            return;
          }

          alert(result.message || "Property deleted");
          window.location.reload();
        } catch (err) {
          alert("⚠️ Server error while deleting property.");
          console.error(err);
        }
      });
    });

    // Edit property (open modal)
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        try {
          const res = await fetch(`${API_BASE}/api/properties/${id}`);
          const result = await res.json();

          if (!res.ok) {
            alert(`❌ Failed to load property: ${result.message || result.error || "Unknown error"}`);
            return;
          }

          const p = result.property;

          // Prefill form fields - extract only numbers for editing
          const rawPrice = p.price.replace(/\D/g, '');
          
          editForm.dataset.id = id;
          editForm.title.value = p.title;
          editForm.type.value = p.type || "";
          editForm.location.value = p.location;
          editForm.price.value = rawPrice;
          editForm.deposit.value = p.deposit ? p.deposit.replace(/\D/g, '') : "";
          editForm.description.value = p.description || "";
          editForm.beds.value = p.beds || 0;
          editForm.baths.value = p.baths || 0;
          editForm.sqFt.value = p.sqFt || "";
          editForm.gender.value = p.gender || "Any";
          editForm.furnishing.value = p.furnishing || "";
          editForm.phone.value = p.phone || "";

          // ✅ Load amenities
          const amenityCheckboxes = editForm.querySelectorAll('input[name="amenities"]');
          amenityCheckboxes.forEach(cb => {
            cb.checked = p.amenities?.includes(cb.value) || false;
          });

          // ✅ Load images into preview
          existingImages = p.images || [];
          imagePreview.innerHTML = "";

          if (existingImages.length > 0) {
            existingImages.forEach(url => {
              const div = document.createElement("div");
              div.className = "relative inline-block";
              div.innerHTML = `
                <img src="${url}" class="h-20 w-20 object-cover rounded">
                <button type="button" class="remove-image absolute top-0 right-0 bg-red-500 text-white text-xs px-1" data-url="${url}">✖</button>
              `;
              imagePreview.appendChild(div);
            });
          }

          // ✅ Always attach preview below file input
          const fileInput = editForm.querySelector('input[name="images"]');
          if (fileInput) {
            fileInput.insertAdjacentElement("afterend", imagePreview);
          }

          modal.classList.remove("hidden");
        } catch (err) {
          alert("⚠️ Server error while loading property.");
          console.error(err);
        }
      });
    });

    // ✅ Remove image from preview
    imagePreview.addEventListener("click", (e) => {
      if (e.target.classList.contains("remove-image")) {
        const url = e.target.dataset.url;
        existingImages = existingImages.filter(img => img !== url);
        e.target.parentElement.remove();
      }
    });

    // Close modal
    closeModalBtn.addEventListener("click", () => {
      modal.classList.add("hidden");
    });

    // Save edited property
    editForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = editForm.dataset.id;
      const formData = new FormData(editForm);

      // ✅ Add kept images
      formData.append("existingImages", JSON.stringify(existingImages));

      try {
        const res = await fetch(`${API_BASE}/api/properties/${id}`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });

        const result = await res.json();
        if (!res.ok) {
          alert(`❌ Failed to update: ${result.message || result.error || "Unknown error"}`);
          return;
        }

        alert(result.message || "Property updated");
        modal.classList.add("hidden");
        window.location.reload();
      } catch (err) {
        alert("⚠️ Server error while updating property.");
        console.error(err);
      }
    });

  } catch (error) {
    console.error("Error fetching properties:", error);
    container.innerHTML =
      `<p class="text-red-600">⚠️ Server error. Please try again.</p>`;
  }
});