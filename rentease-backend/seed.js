// seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "./models/Property.js";

dotenv.config();

const properties = [
  {
    type: "PG",
    title: "Comfortable PG in Koramangala",
    location: "5th Block, Koramangala, Near Forum Mall",
    price: "₹12,000/month",
    deposit: "₹24,000",
    description: "Well-maintained PG with all modern amenities.",
    beds: 1,
    baths: 1,
    sqFt: "200",
    gender: "Female",
    furnishing: "Fully Furnished",
    availability: "Available",
    phone: "9876543210",
    whatsapp: "9876543210",
    amenities: ["WiFi", "Parking", "Security", "Food", "Laundry"],
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=900&q=80",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&q=80"
    ]
  },
  {
    type: "Apartment",
    title: "Spacious 2BHK Apartment in BTM Layout",
    location: "BTM Layout, Bangalore",
    price: "₹25,000/month",
    deposit: "₹50,000",
    description: "Spacious 2BHK with balcony, near IT hubs.",
    beds: 2,
    baths: 2,
    sqFt: "950",
    gender: "Family",
    furnishing: "Semi Furnished",
    availability: "Available",
    phone: "9123456789",
    whatsapp: "9123456789",
    amenities: ["WiFi", "Parking", "Balcony"],
    images: [
      "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=900&q=80"
    ]
  },
  {
    type: "Homestay",
    title: "Kumarichiga Homestay Retreat",
    location: "Indiranagar, Bangalore",
    price: "₹2,000/day",
    deposit: "",
    description: "Cozy homestay perfect for short visits.",
    beds: 1,
    baths: 1,
    sqFt: "300",
    gender: "Any",
    furnishing: "Furnished",
    availability: "Available",
    phone: "9001234567",
    whatsapp: "9001234567",
    amenities: ["WiFi", "Parking", "Kitchen Access"],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&q=80",
      "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=900&q=80"
    ]
  },
  {
    type: "Villa",
    title: "Luxury Villa in Whitefield",
    location: "Whitefield, Bangalore",
    price: "₹60,000/month",
    deposit: "₹1,00,000",
    description: "Lavish villa with private pool and garden.",
    beds: 4,
    baths: 3,
    sqFt: "2500",
    gender: "Family",
    furnishing: "Luxury Furnished",
    availability: "Available",
    phone: "9876501234",
    whatsapp: "9876501234",
    amenities: ["Pool", "Garden", "WiFi", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&q=80",
      "https://images.unsplash.com/photo-1502673530728-f79b4cab31b1?w=900&q=80"
    ]
  }
];

mongoose
  .connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    const count = await Property.countDocuments();
    if (count === 0) {
      await Property.insertMany(properties);
      console.log("🌱 Default properties seeded successfully!");
    } else {
      console.log(`ℹ️ Database already has ${count} properties. Skipping seeding.`);
    }

    process.exit();
  })
  .catch((err) => {
    console.error("❌ DB Connection Error:", err);
    process.exit(1);
  });
