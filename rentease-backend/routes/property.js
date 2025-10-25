// rentease-backend/routes/property.js
import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import Property from "../models/Property.js";
import upload from "../middleware/upload.js"; // for image uploads
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

/**
 * ========================
 * PUBLIC ROUTES
 * ========================
 */

// Get all properties
router.get("/", async (req, res) => {
  try {
    const properties = await Property.find();
    res.json({ properties });
  } catch (err) {
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Get user's properties (protected)
router.get("/my-properties", authMiddleware, async (req, res) => {
  try {
    const properties = await Property.find({ userId: req.user.id });
    res.json({ properties });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

/**
 * ========================
 * PROTECTED ROUTES
 * ========================
 */

// Add new property with Cloudinary images
router.post("/add-property", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title, type, location, price, deposit, description,
      beds, baths, sqFt, gender, furnishing, phone, amenities
    } = req.body;

    const imageUrls = req.files?.map(file => file.path) || [];

    let amenitiesArray = [];
    if (amenities) {
      amenitiesArray = Array.isArray(amenities) ? amenities : amenities.split(",").map(a => a.trim());
    }

    const property = new Property({
      title, type, location, price, deposit, description,
      beds, baths, sqFt, gender, furnishing, phone,
      amenities: amenitiesArray,
      images: imageUrls,
      userId: req.user.id,
    });

    await property.save();
    res.json({ message: "Property added successfully", property });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Update property (images + amenities)
router.put("/:id", authMiddleware, upload.array("images", 5), async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOne({ _id: id, userId: req.user.id });
    if (!property) return res.status(404).json({ message: "Property not found or not owned by user" });

    // Normalize amenities
    let amenitiesArray = [];
    if (req.body.amenities) {
      amenitiesArray = Array.isArray(req.body.amenities) ? req.body.amenities : req.body.amenities.split(",").map(a => a.trim());
    }

    // Build update object
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

    // Handle images: keep existing + new uploads
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

    // Delete removed images from Cloudinary
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

// Delete property + images
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const property = await Property.findOneAndDelete({ _id: id, userId: req.user.id });

    if (!property) return res.status(404).json({ message: "Property not found or not owned by user" });

    // Delete images from Cloudinary
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
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

export default router;
