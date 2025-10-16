function goBack() {
    window.history.back();
}

document.addEventListener("DOMContentLoaded", () => {
    const selectedId = localStorage.getItem("selectedPropertyId");

    const properties = [
      {
        type: "PG",
        title: "Comfortable PG in Koramangala",
        location: "Koramangala, Bangalore",
        price: "₹12,000/month",
        verified: true,
        beds: 1,
        baths: 1,
        furnishing: "fully furnished",
        amenities: ["WiFi", "Parking", "Security", "Food", "+1 more"],
        img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1200&q=80"
      },
      {
        type: "Apartment",
        title: "Spacious 2BHK Apartment in BTM Layout",
        location: "BTM Layout, Bangalore",
        price: "₹25,000/month",
        verified: true,
        beds: 2,
        baths: 2,
        furnishing: "semi furnished",
        amenities: ["WiFi", "Parking", "Security"],
        img: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80"
      }
    ];

    const property = properties.find(p => p.title === selectedId);

    const container = document.getElementById("property-details");

    if(property) {
        container.innerHTML = `
            <div class="card-img">
                <img src="${property.img}" alt="${property.title}">
                <span class="property-type">${property.type}</span>
                <span class="price-badge ${property.verified ? "verified" : ""}">
                    ${property.verified ? "✔ Verified " : ""}${property.price}
                </span>
            </div>
            <div class="card-body">
                <h3>${property.title}</h3>
                <p class="location">📍 ${property.location}</p>
                <div class="details">
                    <span>🛏 ${property.beds} Bed</span>
                    <span>🛁 ${property.baths} Bath</span>
                    <span class="furnishing">${property.furnishing}</span>
                </div>
                <div class="amenities">
                    ${property.amenities.map(a => `<span>${a}</span>`).join("")}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<p>Property details not found.</p>`;
    }
});
