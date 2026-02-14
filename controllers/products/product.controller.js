
import { getProductDetailById } from "../../services/products/product.service.js";


const getProductDetailByIdController = async (req, res) => {
  const { id } = req.params;
  try {
    if(!id){
      return res.status(400).json({
        success:false,
        message:"Product ID is required"
      })
    }
    const response = await getProductDetailById(id);
    if (!response || response.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No product found with the given ID",
        product:{}
      });
    } else {
      return res.status(200).json({
        success: true,
        product: response,
      });
    }
  } catch (error) {
    console.error("Error from getProductDetailByIdController:", error)
    res.status(500).json({
      success: false,
      message: "Failed to fetch product detail",
      error: error.message,
    });
  }
};

export {getProductDetailByIdController };
