// rentease-backend/models/Property.js
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema(
  {
    type: { 
      type: String, 
      enum: ["PG", "Flat", "Apartment", "Homestay", "Villa", "Other"], 
      required: true 
    }, // NEW field for category

    title: { type: String, required: true },
    location: { type: String, required: true },
    price: { type: String, required: true },
    deposit: { type: String },
    description: { type: String },

    // Property details
    beds: { type: Number, default: 0 },
    baths: { type: Number, default: 0 },
    sqFt: { type: String },
    gender: { type: String, enum: ["Male", "Female", "Any", "Family"], default: "Any" },
    furnishing: { type: String },
   // availability: { type: String, default: "Available" },

    // Contact info
    phone: { type: String },
    //whatsapp: { type: String },

    // Media and features
    amenities: [{ type: String }],
    images: [{ type: String }],

    // Metadata
    verified: { type: Boolean, default: false },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const Property = mongoose.model("Property", propertySchema);

export default Property;
