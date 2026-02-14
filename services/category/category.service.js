import Product from "../../models/product-model.js";

const getProductsByCategoryId = async (categoryId) => {
  if (!categoryId) {
    throw new Error("Category ID is required");
  }

  try {
    
    //===================================
    // when we have 1000+ of listing products.
    // use mongodb aggregation for better performace.
    //===================================

    const products = await Product.find({ categoryId })
    .populate({
        path:"variants",
    })    
    return products;
  } catch (error) {
    console.error("DB Error fetching products By categoryId:", error);
  }
};

export { getProductsByCategoryId };
