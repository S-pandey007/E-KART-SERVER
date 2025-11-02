import Category from '../models/category-model.js';

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

export {getAllCategory}