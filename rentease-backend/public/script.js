// ==========================
// Mobile Menu Toggle
// ==========================
document.addEventListener('DOMContentLoaded', function() {
  const menuToggle = document.getElementById('menuToggle');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebarOverlay');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', function() {
      sidebar.classList.toggle('active');
      sidebarOverlay.classList.toggle('active');
    });

    sidebarOverlay.addEventListener('click', function() {
      sidebar.classList.remove('active');
      sidebarOverlay.classList.remove('active');
    });
  }

  const navLinks = document.querySelectorAll('.nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
      }
    });
  });

  function handleResize() {
    if (window.innerWidth > 768) {
      if (sidebar) sidebar.classList.remove('active');
      if (sidebarOverlay) sidebarOverlay.classList.remove('active');
    }
  }

  window.addEventListener('resize', handleResize);
  handleResize();
});

// ==========================
// AGGRESSIVE Equal Card Heights Function
// ==========================
function forceEqualCardHeights() {
  const cards = document.querySelectorAll('.property-card');
  if (cards.length === 0) return;

  cards.forEach(card => {
    card.style.height = '';
    card.style.minHeight = '';
  });

  let maxHeight = 0;
  cards.forEach(card => {
    const cardHeight = card.scrollHeight;
    if (cardHeight > maxHeight) maxHeight = cardHeight;
  });

  cards.forEach(card => {
    card.style.height = maxHeight + 'px';
    card.style.minHeight = maxHeight + 'px';
    card.style.overflow = 'hidden';
  });

  setTimeout(() => {
    let finalMaxHeight = 0;
    cards.forEach(card => {
      if (card.offsetHeight > finalMaxHeight) finalMaxHeight = card.offsetHeight;
    });
    cards.forEach(card => { card.style.height = finalMaxHeight + 'px'; });
  }, 100);
}

// ==========================
// Property Cards Rendering
// ==========================
let allProperties = [];

async function fetchProperties() {
  // ✅ Dynamic backend URL
  const API_BASE = window.location.hostname.includes("localhost")
    ? "http://localhost:4000"
    : window.location.origin;  // replace with your Render backend URL

  try {
    const res = await fetch(`${API_BASE}/api/properties`);
    const data = await res.json();

    if (data.properties) {
      allProperties = data.properties;
      renderProperties(allProperties);
      initializeFilters();
    } else {
      renderProperties([]);
      initializeFilters();
    }
  } catch (err) {
    console.error("Error fetching properties:", err);
    renderProperties([]);
    initializeFilters();
  }
}

const list = document.getElementById("property-list");
const countHeading = document.getElementById("properties-count");

function renderProperties(data) {
  list.innerHTML = "";

  if (!data.length) {
    countHeading.textContent = "No Properties Found";
    return;
  }

  data.forEach(p => {
    const card = document.createElement("div");
    card.className = "property-card";

    const title = p.title && p.title.length > 50 ? p.title.substring(0, 50) + '...' : p.title;
    const amenities = p.amenities && p.amenities.length 
      ? p.amenities.slice(0, 4).map(a => `<span>${a}</span>`).join("") 
      : "<span>No amenities</span>";

    card.innerHTML = `
      <div class="card-img">
        <img src="${p.images && p.images.length > 0 ? p.images[0] : "https://via.placeholder.com/600x400"}" alt="${title}">
        <span class="property-type">${p.type || "Property"}</span>
        <span class="price-badge ${p.verified ? "verified" : ""}">
          ${p.verified ? "✔ Verified " : ""}${p.price}
        </span>
      </div>
      <div class="card-body">
        <h3>${title}</h3>
        <p class="location">📍 ${p.location || "Location not specified"}</p>
        <div class="details">
          <span>🛏 ${p.beds || "-"} Bed</span>
          <span>🛁 ${p.baths || "-"} Bath</span>
          <span class="furnishing">${p.furnishing || "N/A"}</span>
        </div>
        <div class="amenities">${amenities}</div>
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

  countHeading.textContent = `${data.length} Properties Found`;

  setTimeout(forceEqualCardHeights, 50);
  setTimeout(forceEqualCardHeights, 200);
  setTimeout(forceEqualCardHeights, 500);
}

// Initial fetch
fetchProperties();

// ==========================
// Search and Filter Functionality
// ==========================
const searchInput = document.getElementById("search-input");
const searchModal = document.getElementById("searchModal");
const searchBtn = document.getElementById("search-btn");
const searchForm = document.getElementById("searchForm");
const closeSearch = searchModal?.querySelector(".close");

if (searchInput) searchInput.addEventListener("click", () => searchModal.setAttribute("aria-hidden", "false"));
if (searchBtn) searchBtn.addEventListener("click", () => searchModal.setAttribute("aria-hidden", "false"));
if (closeSearch) closeSearch.addEventListener("click", () => searchModal.setAttribute("aria-hidden", "true"));

window.addEventListener("click", (e) => { 
  if (e.target === searchModal) searchModal.setAttribute("aria-hidden", "true"); 
});

if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const cityArea = document.getElementById("searchInput").value.toLowerCase();
    const propertyType = document.getElementById("propertyType").value.toLowerCase();

    const filtered = allProperties.filter(p => {
      const matchesText =
        (p.location && p.location.toLowerCase().includes(cityArea)) ||
        (p.title && p.title.toLowerCase().includes(cityArea));
      const matchesType = propertyType === "any" ? true : (p.type && p.type.toLowerCase().includes(propertyType));
      return matchesText && matchesType;
    });

    renderProperties(filtered);
    searchModal.setAttribute("aria-hidden", "true");
  });
}

// ==========================
// Quick Filters
// ==========================
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filter-option");

  filterButtons.forEach(btn => {
    btn.addEventListener("click", function() {
      filterButtons.forEach(b => b.classList.remove("active"));
      this.classList.add("active");

      const selectedType = this.getAttribute("data-type");
      let filtered;

      if (selectedType === "pg") filtered = allProperties.filter(p => p.type && p.type.toLowerCase().includes("pg"));
      else if (selectedType === "apartment") filtered = allProperties.filter(p => p.type && (p.type.toLowerCase().includes("apartment") || p.type.toLowerCase().includes("rent")));
      else if (selectedType === "flat") filtered = allProperties.filter(p => p.type && p.type.toLowerCase().includes("flat"));
      else if (selectedType === "villa") filtered = allProperties.filter(p => {
        if (!p.type) return false;
        const type = p.type.toLowerCase();
        return type.includes("1bhk") || type.includes("2bhk") || type.includes("3bhk") || type.includes("bungalow");
      });
      else filtered = allProperties;

      renderProperties(filtered);
    });
  });
}

// ==========================
// User Authentication
// ==========================
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userName = localStorage.getItem("userName");

  const loginLink = document.getElementById("login-link");
  const signupLink = document.getElementById("signup-link");
  const nav = document.querySelector("nav");

  if (token && userName) {
    if (loginLink) loginLink.style.display = "none";
    if (signupLink) signupLink.style.display = "none";

    if (nav) {
      const navList = nav.querySelector("ul");
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
    }

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
  }

  if (list) {
    list.addEventListener("click", (e) => {
      const viewBtn = e.target.closest(".btn.view");
      if (viewBtn) {
        const token = localStorage.getItem("token");
        const id = viewBtn.getAttribute("data-id");
        const link = viewBtn.getAttribute("data-link");
        localStorage.setItem("selectedPropertyId", id);
        if (token) window.location.href = link;
        else {
          localStorage.setItem("redirectAfterLogin", link);
          window.location.href = "login.html";
        }
      }
    });
  }
});

// ==========================
// Window Event Listeners
// ==========================
window.addEventListener('load', function() {
  setTimeout(forceEqualCardHeights, 100);
  setTimeout(forceEqualCardHeights, 500);
});

window.addEventListener('resize', function() {
  setTimeout(forceEqualCardHeights, 100);
});

document.addEventListener('click', function(e) {
  if (e.target.classList.contains('filter-option')) {
    setTimeout(() => {
      forceEqualCardHeights();
      setTimeout(forceEqualCardHeights, 300);
    }, 200);
  }
});

const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      setTimeout(forceEqualCardHeights, 100);
    }
  });
});

if (list) {
  observer.observe(list, { childList: true, subtree: true });
}
