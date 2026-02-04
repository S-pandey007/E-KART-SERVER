import Product from "../../models/product-model.js";

const getProductDetailById = async (id) => {
  try {
    if (!id) {
      return {
        success: false,
        message: "Product not found ! Try again",
        product: {},
      };
    }
    console.log("productId:", id);
    const product = await Product.findById(id);
    if (!product) {
      return {
        success: false,
        message: "Product not found ! Try again",
        product: {},
      };
    }
    return {
      success: true,
      message: "Product fetched successfully",
      product,
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    };
  }
};

export { getProductDetailById };
