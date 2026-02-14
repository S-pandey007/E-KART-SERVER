import mongoose,{ Schema } from "mongoose";

const ProductVariantSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    index: true,
  },

  productName: { type: String, required: true},
  // dynamic attributes
  attributes: {
    type: Map,
    of: String,
  },

  // pricing
  MRP: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  originalPrice: {
    type: Number,
  },
  taxPercent: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },

  // Media
  images: [{ type: String }],
  thumbnail: { type: String },

  status: {
    type: String,
    enum: ["active", "inactive", "out_of_stock"],
    default: "active",
    index: true,
  },
},{
    timestamps: true,
});

ProductVariantSchema.index({ productId: 1, status: 1 });
ProductVariantSchema.index({ sellingPrice: 1 });

const ProductVariant =
  mongoose.models.ProductVariant ||
  mongoose.model("ProductVariant", ProductVariantSchema);

export default ProductVariant;



