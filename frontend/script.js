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

// ==========================
// EMERGENCY OVERRIDE - Force Replace Quick Stats with Contact Us
// ==========================
function emergencyReplaceStats() {
  console.log('🚨 Running emergency stats replacement...');
  
  // Method 1: Direct DOM replacement for all stats elements
  const statsElements = document.querySelectorAll('.stats');
  console.log('Found stats elements:', statsElements.length);
  
  statsElements.forEach((stats, index) => {
    console.log(`Stats element ${index} before:`, stats.innerHTML);
    
    // Check if this is a dark sidebar (most pages)
    const isDarkSidebar = stats.closest('.sidebar') && 
                         (getComputedStyle(stats.closest('.sidebar')).backgroundColor.includes('rgb(30, 41, 59)') ||
                          getComputedStyle(stats.closest('.sidebar')).backgroundColor.includes('rgba(30, 41, 59') ||
                          stats.closest('.sidebar').classList.contains('sidebar'));
    
    if (isDarkSidebar) {
      // Dark sidebar version
      stats.innerHTML = `
        <p class="stats-title">Contact Us</p>
        <p><span class="icon">💼</span> <a href="https://www.linkedin.com/company/mynest21/" target="_blank" style="color: #cbd5e1; text-decoration: none;">LinkedIn</a></p>
        <p><span class="icon">📘</span> <a href="https://www.facebook.com/share/1ABpLQP4mx/" target="_blank" style="color: #cbd5e1; text-decoration: none;">Facebook</a></p>
        <p><span class="icon">📷</span> <a href="https://www.instagram.com/the_my_nest?igsh=MWNzZ283Z3lwNHFzaA==" target="_blank" style="color: #cbd5e1; text-decoration: none;">Instagram</a></p>
      `;
    } else {
      // Light sidebar version (add-homestay)
      stats.innerHTML = `
        <p class="stats-title">Contact Us</p>
        <p><span class="icon"><i class="fab fa-linkedin"></i></span> <a href="https://www.linkedin.com/company/mynest21/" target="_blank" style="color: #374151; text-decoration: none;">LinkedIn</a></p>
        <p><span class="icon"><i class="fab fa-facebook"></i></span> <a href="https://www.facebook.com/share/1ABpLQP4mx/" target="_blank" style="color: #374151; text-decoration: none;">Facebook</a></p>
        <p><span class="icon"><i class="fab fa-instagram"></i></span> <a href="https://www.instagram.com/the_my_nest?igsh=MWNzZ283Z3lwNHFzaA==" target="_blank" style="color: #374151; text-decoration: none;">Instagram</a></p>
      `;
    }
    
    console.log(`Stats element ${index} after:`, stats.innerHTML);
  });
  
  // Method 2: Text-based search and replace (more aggressive)
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  
  let node;
  const quickStatsKeywords = ['Active Cities', 'Listed Properties', '25+', '1000+', 'Quick Stats'];
  
  while (node = walker.nextNode()) {
    const text = node.textContent;
    if (quickStatsKeywords.some(keyword => text.includes(keyword))) {
      console.log('Found Quick Stats text node:', text);
      const parentElement = node.parentElement;
      
      // Go up to find the stats container
      let statsContainer = parentElement;
      while (statsContainer && !statsContainer.classList.contains('stats') && statsContainer !== document.body) {
        statsContainer = statsContainer.parentElement;
      }
      
      if (statsContainer && statsContainer.classList.contains('stats')) {
        const isDarkSidebar = statsContainer.closest('.sidebar') && 
                             (getComputedStyle(statsContainer.closest('.sidebar')).backgroundColor.includes('rgb(30, 41, 59)') ||
                              getComputedStyle(statsContainer.closest('.sidebar')).backgroundColor.includes('rgba(30, 41, 59'));
        
        if (isDarkSidebar) {
          statsContainer.innerHTML = `
            <p class="stats-title">Contact Us</p>
            <p><span class="icon">💼</span> <a href="https://www.linkedin.com/company/mynest21/" target="_blank" style="color: #cbd5e1; text-decoration: none;">LinkedIn</a></p>
            <p><span class="icon">📘</span> <a href="https://www.facebook.com/share/1ABpLQP4mx/" target="_blank" style="color: #cbd5e1; text-decoration: none;">Facebook</a></p>
            <p><span class="icon">📷</span> <a href="https://www.instagram.com/the_my_nest?igsh=MWNzZ283Z3lwNHFzaA==" target="_blank" style="color: #cbd5e1; text-decoration: none;">Instagram</a></p>
          `;
        } else {
          statsContainer.innerHTML = `
            <p class="stats-title">Contact Us</p>
            <p><span class="icon"><i class="fab fa-linkedin"></i></span> <a href="https://www.linkedin.com/company/mynest21/" target="_blank" style="color: #374151; text-decoration: none;">LinkedIn</a></p>
            <p><span class="icon"><i class="fab fa-facebook"></i></span> <a href="https://www.facebook.com/share/1ABpLQP4mx/" target="_blank" style="color: #374151; text-decoration: none;">Facebook</a></p>
            <p><span class="icon"><i class="fab fa-instagram"></i></span> <a href="https://www.instagram.com/the_my_nest?igsh=MWNzZ283Z3lwNHFzaA==" target="_blank" style="color: #374151; text-decoration: none;">Instagram</a></p>
          `;
        }
        console.log('Replaced Quick Stats via text search');
      }
    }
  }
}

// Run aggressively multiple times with different delays
document.addEventListener('DOMContentLoaded', function() {
  console.log('DOM Content Loaded - Starting stats replacement...');
  emergencyReplaceStats();
});

setTimeout(emergencyReplaceStats, 10);
setTimeout(emergencyReplaceStats, 50);
setTimeout(emergencyReplaceStats, 100);
setTimeout(emergencyReplaceStats, 200);
setTimeout(emergencyReplaceStats, 500);
setTimeout(emergencyReplaceStats, 1000);
setTimeout(emergencyReplaceStats, 2000);
setTimeout(emergencyReplaceStats, 5000);

// Also run when any DOM changes occur
const emergencyObserver = new MutationObserver(function(mutations) {
  let shouldRun = false;
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach(function(node) {
        if (node.nodeType === 1 && (node.classList.contains('stats') || node.querySelector('.stats'))) {
          shouldRun = true;
        }
      });
    }
  });
  
  if (shouldRun) {
    console.log('DOM changed - running stats replacement...');
    emergencyReplaceStats();
  }
});

// Start observing
emergencyObserver.observe(document.body, { 
  childList: true, 
  subtree: true,
  attributes: true,
  attributeFilter: ['class']
});

// Final nuclear option - replace any element that contains Quick Stats text
setTimeout(function() {
  const allElements = document.querySelectorAll('*');
  allElements.forEach(element => {
    if (element.textContent.includes('Active Cities') || 
        element.textContent.includes('Listed Properties') ||
        element.textContent.includes('25+') ||
        element.textContent.includes('1000+')) {
      console.log('Nuclear option: Found element with Quick Stats text:', element);
      if (element.classList.contains('stats') || element.closest('.stats')) {
        emergencyReplaceStats();
      }
    }
  });
}, 3000);

console.log('🚨 Emergency Quick Stats replacement script loaded!');