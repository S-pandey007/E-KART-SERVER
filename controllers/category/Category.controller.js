import Category from '../../models/category-model.js';
import { getProductsByCategoryId } from '../../services/category/category.service.js';

const getAllCategory = async(req,res)=>{

    try {
       const categories =await Category.find();
       res.status(201).json({
        success:true,
        categories
       }) 
    } catch (error) {
     res.status(500).json({
        success:false,
        message:"Failed to retrive categories",
        error:error.message
     })   
    }
}

const getProductByCategoryController =async(req,res)=>{
   try {
      const {categoryId}=req.params;
      if(!categoryId){
         return res.status(400).json({
            success:false,
            message:"Category Id is required"
         })
      }

      const products = await getProductsByCategoryId(categoryId);
      if(!products || products.length===0){
         return res.status(404).json({
            success:false,
            message:"No products found for the given category",
            products:[]
         })
      }

      return res.status(200).json({
         success:true,
         message:"Products fetched successfully",
         products
      })

   } catch (error) {
      console.error("get product by category ID controlller error :",error);
      return res.status(500).json({
         success:false,
         message:"Failed to fetch products",
         error:error.message
      })
   }
}

export {getAllCategory,getProductByCategoryController}