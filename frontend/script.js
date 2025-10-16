// ==========================
// Property Cards Rendering (Dynamic from API)
// ==========================
let allProperties = []; // store fetched properties for search

async function fetchProperties() {
  try {
    const res = await fetch("http://localhost:4000/api/properties");
    const data = await res.json();

    if (data.properties) {
      allProperties = data.properties; // save for search
      renderProperties(allProperties);
    } else {
      renderProperties([]);
    }
  } catch (err) {
    console.error("Error fetching properties:", err);
    renderProperties([]);
  }
}

const list = document.getElementById("property-list");
const countHeading = document.getElementById("properties-count");

// Function to render properties
function renderProperties(data) {
  list.innerHTML = ""; // clear old cards

  if (!data.length) {
    countHeading.textContent = "No Properties Found";
    return;
  }

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "property-card";

    card.innerHTML = `
      <div class="card-img">
      <img src="${p.images && p.images.length > 0 ? p.images[0] : "https://via.placeholder.com/600x400"}" alt="${p.title}">
        <span class="property-type">${p.type || "Property"}</span>
        <span class="price-badge ${p.verified ? "verified" : ""}">
          ${p.verified ? "✔ Verified " : ""}${p.price}
        </span>
      </div>
      <div class="card-body">
        <h3>${p.title}</h3>
        <p class="location">📍 ${p.location}</p>
        <div class="details">
          <span>🛏 ${p.beds || "-"} Bed</span>
          <span>🛁 ${p.baths || "-"} Bath</span>
          <span class="furnishing">${p.furnishing || "N/A"}</span>
        </div>
        <div class="amenities">
          ${p.amenities && p.amenities.length 
            ? p.amenities.map(a => `<span>${a}</span>`).join("")
            : "<span>No amenities listed</span>"
          }
        </div>
        <div class="actions">
          <button class="btn view" data-link="property-details.html" data-id="${p._id}">
            <span>👁</span> View Details
          </button>
          <button class="btn call" data-link="tel:+919999999999"><span>📞</span></button>
        </div>
      </div>
    `;
    list.appendChild(card);
  });

  // Update count
  countHeading.textContent = `${data.length} Properties Found`;
}

// 🔥 Call fetch on page load
fetchProperties();


// ==========================
// Popup Search Modal
// ==========================
const searchInput = document.getElementById("search-input");
const searchModal = document.getElementById("searchModal");
const closeSearch = document.getElementById("closeSearch");
const advancedForm = document.getElementById("advancedSearchForm");

// Open modal when clicking search input or button
if (searchInput) {
  searchInput.addEventListener("click", () => {
    searchModal.setAttribute("aria-hidden", "false");
  });
}
const searchBtn = document.getElementById("search-btn");
if (searchBtn) {
  searchBtn.addEventListener("click", () => {
    searchModal.setAttribute("aria-hidden", "false");
  });
}

// Close modal
if (closeSearch) {
  closeSearch.addEventListener("click", () => {
    searchModal.setAttribute("aria-hidden", "true");
  });
}

// Handle form submit
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const cityArea = document.getElementById("searchInput").value.toLowerCase();
    const propertyType = document.getElementById("propertyType").value.toLowerCase();

    // Filter logic on fetched properties
    const filtered = allProperties.filter(p => {
      const matchesText =
        (p.location && p.location.toLowerCase().includes(cityArea)) ||
        (p.title && p.title.toLowerCase().includes(cityArea));

      const matchesType = propertyType
        ? (p.type && p.type.toLowerCase().includes(propertyType))
        : true;

      return matchesText && matchesType;
    });

    renderProperties(filtered);

    // Close modal
    searchModal.setAttribute("aria-hidden", "true");
  });
}


// ==========================
// User Login State (Show/Hide Login, Signup, Logout)
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");
  console.log("Token:", token, "UserName:", userName); // Debug

  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const nav = document.querySelector("nav");
  console.log("Login Link:", loginLink, "Signup Link:", signupLink, "Nav:", nav); // Debug

  if (token && userName) {
    console.log("User is logged in, updating nav");
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";

    if (nav) {
      const navList = nav.querySelector("ul");
      if (navList) {
        // Remove existing logout
        const existingLogout = navList.querySelector("a[href='#'][style*='red']");
        if (existingLogout) existingLogout.parentElement.remove();

        // Add logout button
        const logoutItem = document.createElement("li");
        const logoutBtn = document.createElement("a");
        logoutBtn.href = "#";
        logoutBtn.textContent = "🚪 Logout";
        logoutBtn.style.color = "red";
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("userName");
          window.location.href = "login.html";
        });
        logoutItem.appendChild(logoutBtn);
        navList.appendChild(logoutItem);
        console.log("Logout button added");
      }
    }

    // Show username bottom-right
    const existingUserInfo = document.getElementById("user-info");
    if (existingUserInfo) existingUserInfo.remove();
    const bottomRight = document.createElement("div");
    bottomRight.id = "user-info";
    bottomRight.style.position = "fixed";
    bottomRight.style.bottom = "15px";
    bottomRight.style.right = "15px";
    bottomRight.style.background = "#fff";
    bottomRight.style.padding = "8px 12px";
    bottomRight.style.borderRadius = "8px";
    bottomRight.style.boxShadow = "0 2px 6px rgba(0,0,0,0.15)";
    bottomRight.style.fontSize = "14px";
    bottomRight.textContent = `👋 ${userName}`;
    document.body.appendChild(bottomRight);
    console.log("User info added");
  }

  const list = document.getElementById("property-list");
  if (list) {
    list.addEventListener("click", (e) => {
      const viewBtn = e.target.closest(".btn.view");
      if (viewBtn) {
        const token = localStorage.getItem("token");
        const id = viewBtn.getAttribute("data-id");
        const link = viewBtn.getAttribute("data-link");
        console.log("Redirecting to", link, "with id:", id);
        localStorage.setItem("selectedPropertyId", id);
        if (token) {
          window.location.href = link;
        } else {
          localStorage.setItem("redirectAfterLogin", link);
          window.location.href = "login.html";
        }
      }
    });
  }
});
