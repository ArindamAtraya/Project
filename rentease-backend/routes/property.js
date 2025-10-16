// rentease-backend/routes/property.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Property from "../models/Property.js";
import upload from "../middleware/upload.js"; // 👈 for image uploads
import { v2 as cloudinary } from "cloudinary"; // 👈 add this

const router = express.Router();

/**
 * ========================
 * PUBLIC ROUTES
 * ========================
 */

// Get all properties (public)
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get my properties (protected)
router.get("/my-properties", authMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id });
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: "Server error in /my-properties", error: err.message });
  }
});

/**
 * ========================
 * PROTECTED ROUTES
 * ========================
 */

// ✅ Add property with Cloudinary images
router.post("/add-property", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title, type, location, price, deposit, description,
      beds, baths, sqFt, gender, furnishing, phone, amenities
    } = req.body;

    // ✅ Extract Cloudinary image URLs
    const imageUrls = req.files && req.files.length > 0 
      ? req.files.map(file => file.path) 
      : [];

    // ✅ Ensure amenities is always an array
    let amenitiesArray = [];
    if (amenities) {
      if (Array.isArray(amenities)) amenitiesArray = amenities;
      else if (typeof amenities === "string") {
        amenitiesArray = amenities.split(",").map(a => a.trim());
      }
    }

    const property = new Property({
      title,
      type,
      location,
      price,
      deposit,
      description,
      beds,
      baths,
      sqFt,
      gender,
      furnishing,
      phone,
      amenities: amenitiesArray,
      images: imageUrls, // ✅ Cloudinary URLs
      userId: req.user.id,
    });

    await property.save();
    res.json({ message: "✅ Property added successfully", property });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Update property (add/remove images support)
router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;

    // Find property first (so we know old images)
    const property = await Property.findOne({ _id: id, userId: req.user.id });
    if (!property) {
      return res.status(404).json({ message: "❌ Property not found or not owned by user" });
    }

    // ✅ Normalize amenities
    let amenitiesArray = [];
    if (req.body.amenities) {
      if (Array.isArray(req.body.amenities)) amenitiesArray = req.body.amenities;
      else if (typeof req.body.amenities === "string") {
        amenitiesArray = req.body.amenities.split(",").map(a => a.trim());
      }
    }

    // ✅ Build update data
    const updateData = {
      title: req.body.title,
      type: req.body.type,
      location: req.body.location,
      price: req.body.price,
      deposit: req.body.deposit,
      description: req.body.description,
      beds: req.body.beds,
      baths: req.body.baths,
      sqFt: req.body.sqFt,
      gender: req.body.gender,
      furnishing: req.body.furnishing,
      phone: req.body.phone,
      amenities: amenitiesArray
    };

    // ✅ Handle images
    let finalImages = [];

    // Start with existing images (kept on frontend)
    if (req.body.existingImages) {
      try {
        const parsed = JSON.parse(req.body.existingImages);
        if (Array.isArray(parsed)) finalImages = parsed;
      } catch (e) {
        console.error("❌ Failed to parse existingImages:", e.message);
      }
    }

    // Add new uploads if any
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newImages];
    }

    // ✅ Delete images that were removed
    const removedImages = property.images.filter(img => !finalImages.includes(img));
    for (const url of removedImages) {
      try {
        const publicId = url.split("/").pop().split(".")[0]; // extract public_id from URL
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("❌ Cloudinary delete error:", err.message);
      }
    }

    updateData.images = finalImages;

    // ✅ Update property
    const updated = await Property.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    res.json({ message: "✅ Property updated successfully", property: updated });
  } catch (err) {
    console.error("❌ Update Property Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ✅ Delete property (also delete images)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!property) {
      return res.status(404).json({ message: "❌ Property not found or not owned by user" });
    }

    // Delete all images from Cloudinary
    for (const url of property.images) {
      try {
        const publicId = url.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error("❌ Cloudinary delete error:", err.message);
      }
    }

    res.json({ message: "✅ Property deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get property by ID (public)
router.get("/:id", async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: "Property not found" });
    res.json({ property });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
