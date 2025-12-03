// rentease-backend/routes/property.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Property from "../models/Property.js";
import upload from "../middleware/upload.js";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json({ properties });
  } catch (err) {
    console.error("❌ Error in GET /:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user's properties (protected)
router.get("/my-properties", authMiddleware, async (req, res) => {
  try {
    console.log("🔑 Authenticated user:", req.user);
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    const properties = await Property.find({ userId: req.user.id });
    res.json({ properties });
  } catch (err) {
    console.error("❌ Error loading my-properties:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Add new property
router.post("/add-property", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title, type, location, price, deposit, description,
      beds, baths, sqFt, gender, furnishing, phone, amenities
    } = req.body;

    console.log("📥 Raw data from frontend:", { price, type });

    // ✅ Extract only numbers from price (remove everything except digits)
    const priceNumber = price.toString().replace(/\D/g, '');
    console.log("🔢 Extracted price number:", priceNumber);
    
    let formattedPrice = '';
    if (type === "Homestay" || type === "1BHK" || type === "2BHK" || type === "3BHK" || type === "Bungalow") {
      formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/day`;
    } else {
      formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/month`;
    }

    console.log("🎯 Final formatted price:", formattedPrice);

    const imageUrls = req.files?.map(file => file.path) || [];

    let amenitiesArray = [];
    if (amenities) {
      amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(",").map(a => a.trim());
    }

    const property = new Property({
      title, 
      type, 
      location, 
      price: formattedPrice,
      deposit: deposit ? `₹${parseInt(deposit.toString().replace(/\D/g, '')).toLocaleString('en-IN')}` : "",
      description,
      beds, 
      baths, 
      sqFt, 
      gender, 
      furnishing, 
      phone,
      amenities: amenitiesArray,
      images: imageUrls,
      userId: req.user.id,
    });

    await property.save();
    res.json({ message: "Property added successfully", property });
  } catch (err) {
    console.error("❌ Error adding property:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get property by ID
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ property });
  } catch (err) {
    console.error("❌ Error in GET /:id:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update property
router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ _id: id, userId: req.user.id });
    if (!property) return res.status(404).json({ message: "Property not found or not owned by user" });

    console.log("📥 Raw data from frontend for update:", { price: req.body.price, type: req.body.type });

    // ✅ Extract only numbers from price (remove everything except digits)
    const priceNumber = req.body.price.toString().replace(/\D/g, '');
    console.log("🔢 Extracted price number for update:", priceNumber);
    
    let formattedPrice = '';
    if (req.body.type === "Homestay" || req.body.type === "1BHK" || req.body.type === "2BHK" || req.body.type === "3BHK" || req.body.type === "Bungalow") {
      formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/day`;
    } else {
      formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/month`;
    }

    console.log("🎯 Final formatted price for update:", formattedPrice);

    let amenitiesArray = [];
    if (req.body.amenities) {
      amenitiesArray = Array.isArray(req.body.amenities)
        ? req.body.amenities
        : req.body.amenities.split(",").map(a => a.trim());
    }

    const updateData = {
      title: req.body.title,
      type: req.body.type,
      location: req.body.location,
      price: formattedPrice,
      deposit: req.body.deposit ? `₹${parseInt(req.body.deposit.toString().replace(/\D/g, '')).toLocaleString('en-IN')}` : "",
      description: req.body.description,
      beds: req.body.beds,
      baths: req.body.baths,
      sqFt: req.body.sqFt,
      gender: req.body.gender,
      furnishing: req.body.furnishing,
      phone: req.body.phone,
      amenities: amenitiesArray,
    };

    let finalImages = [];
    if (req.body.existingImages) {
      try {
        const parsed = JSON.parse(req.body.existingImages);
        if (Array.isArray(parsed)) finalImages = parsed;
      } catch (e) {
        console.error("Failed to parse existingImages:", e.message);
      }
    }
    if (req.files?.length) {
      finalImages = [...finalImages, ...req.files.map(file => file.path)];
    }

    const removedImages = property.images.filter(img => !finalImages.includes(img));
    for (const url of removedImages) {
      try {
        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err.message);
      }
    }

    updateData.images = finalImages;

    const updated = await Property.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    res.json({ message: "Property updated successfully", property: updated });
  } catch (err) {
    console.error("Update Property Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Delete property
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!property) return res.status(404).json({ message: "Property not found or not owned by user" });

    for (const url of property.images) {
      try {
        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("Cloudinary delete error:", err.message);
      }
    }

    res.json({ message: "Property deleted successfully" });
  } catch (err) {
    console.error("❌ Delete Property Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Temporary route to clean existing prices
router.get("/clean-prices", async (req, res) => {
  try {
    const properties = await Property.find();
    let updatedCount = 0;
    
    for (let property of properties) {
      const oldPrice = property.price;
      // Extract only numbers
      const priceNumber = property.price.toString().replace(/\D/g, '');
      
      let formattedPrice = '';
      if (property.type === "Homestay" || property.type === "1BHK" || property.type === "2BHK" || property.type === "3BHK" || property.type === "Bungalow") {
        formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/day`;
      } else {
        formattedPrice = `₹${parseInt(priceNumber).toLocaleString('en-IN')}/month`;
      }
      
      if (oldPrice !== formattedPrice) {
        property.price = formattedPrice;
        await property.save();
        updatedCount++;
        console.log(`🔄 Updated: ${oldPrice} → ${formattedPrice}`);
      }
    }
    
    res.json({ message: `Cleaned ${updatedCount} properties` });
  } catch (err) {
    console.error("Error cleaning prices:", err);
    res.status(500).json({ message: "Error cleaning prices" });
  }
});

export default router;