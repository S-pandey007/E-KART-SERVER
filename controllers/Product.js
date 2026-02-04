import Product from "../models/product-model.js";
import { getProductDetailById } from "../services/products/product.service.js";

const getProductsByCategoryId = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ categoryId });

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No product found for this category",
      });
    }
    res.status(201).json({
      success: true,
      products,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product",
      error: error.message,
    });
  }
};

const getProductDetailByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    console.log("productId:", id);
    const response = await getProductDetailById(id);
    if (!response.success) {
      return res.status(404).json({
        success: false,
        message: response.message,
      });
    } else {
      return res.status(201).json({
        success: true,
        product: response.product,
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch product detail",
      error: error.message,
    });
  }
};

export { getProductsByCategoryId,getProductDetailByIdController };
