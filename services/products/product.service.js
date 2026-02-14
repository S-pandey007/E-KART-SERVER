import Product from "../../models/product-model.js";

const getProductDetailById = async (id) => {
  try {
    if (!id) {
     throw new Error("Product ID is required");
    }
    const product = await Product.findById(id).populate({
        path:"variants",
    }) 
    return product
  } catch (error) {
   console.error("Database error from getProductDetailById",error)
  }
};

export { getProductDetailById };
