import dotenv from "dotenv";
import Product from "./models/product-model.js";
import Category from "./models/category-model.js";
import { categoriesData } from "./seedData.js";
import { Dataset } from "./utils/Data.js";
import Influencer from "./models/InfluencerSchema-model.js";
import { InfluencerData } from "./utils/InfulancerData.js";
dotenv.config();

async function seedData() {
  try {
    await Product.deleteMany();
    await Category.deleteMany();

    const categoriesDocs = await Category.insertMany(categoriesData);

    const categoriesMap = categoriesDocs.reduce((map, category) => {
      map[category.name.trim()] = category._id;
      return map;
    }, {});

    Dataset.forEach((product) => {
      if (!categoriesMap[product.category]) {
        console.log("❌ Missing category:", product.category);
      }
    });

    const productWithCategoryIds = Dataset.map((product) => ({
      ...product,
      category: product.category.trim(),
      categoryId: categoriesMap[product.category.trim()],
    }));

    await Product.insertMany(productWithCategoryIds);

    console.log("data seed successfully");
  } catch (error) {
    console.error("Error seeding data", error);
  }
}

async function seedInfulancerData() {
  try {
    await Influencer.deleteMany();
    await Influencer.insertMany(InfluencerData);
    console.log("infulacer data added");
  } catch (error) {
    console.error("Error seeding Infulacer data", error);
  }
}

export { seedData, seedInfulancerData };
