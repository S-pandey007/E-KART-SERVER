import mongoose from "mongoose";
import Product from "./models/product-model.js";
import Category from "./models/category-model.js";
import { categoriesData, productsSeed, variantsSeed } from "./newSeedingData.js";
import ProductVariant from "./models/ProductVariant-model.js";

async function newSeedData() {
  try {
    console.log("🌱 Seeding started...");

    /* ---------------- DELETE OLD DATA ---------------- */
    await ProductVariant.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    /* ---------------- INSERT CATEGORIES ---------------- */
    const categoryDocs = await Category.insertMany(categoriesData);

    const categoryMap = {};
    categoryDocs.forEach((cat) => {
      categoryMap[cat.name.trim()] = cat._id;
    });

    /* ---------------- ATTACH CATEGORY ID TO PRODUCTS ---------------- */
    const productsWithCategoryId = productsSeed.map((product) => {
      const categoryId = categoryMap[product.categoryName.trim()];

      if (!categoryId) {
        console.log("❌ Missing Category:", product.categoryName);
      }

      return {
        ...product,
        categoryId,
      };
    });

    /* ---------------- INSERT PRODUCTS ---------------- */
    const productDocs = await Product.insertMany(productsWithCategoryId);

    const productMap = {};
    productDocs.forEach((prod) => {
      productMap[prod.name.trim()] = prod._id;
    });

    /* ---------------- ATTACH PRODUCT ID TO VARIANTS ---------------- */
    const variantsWithProductId = variantsSeed.map((variant) => {
      const productId = productMap[variant.productName.trim()];

      if (!productId) {
        console.log("❌ Missing Product for Variant:", variant.productName);
      }

      return {
        ...variant,
        productId,
      };
    });

    /* ---------------- INSERT VARIANTS ---------------- */
    await ProductVariant.insertMany(variantsWithProductId);

    console.log("✅ Data seeded successfully!");
    process.exit();
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

export default newSeedData;
