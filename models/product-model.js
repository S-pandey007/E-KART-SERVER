import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema(
  {
    // basic info
    name: { type: String, required: true, index: true },
    brandLogo: { type: String },
    brandName: { type: String, index: true },

    // description
    shortDescription: { type: String },
    longDescription: { type: String },

    // category
    categoryName: { type: String, required: true, index: true },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    // Search
    tags: [{ type: String, index: true }],

    // Status
    status: {
      type: String,
      enum: ["draft", "active", "inactive", "archived"],
      default: "draft",
      index: true,
    },

    // review
    averageRating: { type: Number, default: 0 },
    totalReviews: { type: Number, default: 0 },

    // media gallery
    thumbnail: { type: String },
    mediaGallery: [{ type: String }],

    // Soft delete
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

//========================================
// MongoDB does NOT store variants inside Product
// It is NOT a real DB field
// It is computed dynamically using another collection

// whenever I ask for variants,
// go to ProductVariant collection and find documents where 
// productId = this product _id."
// Parent → children relationship
//========================================
ProductSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "productId",
});

// virtual fields are not included by default.
ProductSchema.set("toObject", { virtuals: true });
ProductSchema.set("toJSON", { virtuals: true });

ProductSchema.index({
  name: "text",
  shortDescription: "text",
  tags: "text",
  brandName: "text",
});
const Product = mongoose.model("Product", ProductSchema);
export default Product;
