import Product from '../models/product-model.js';

const getProductsByCategoryId =async(req,res)=>{
    const {categoryId} = req.params;

    try {
        const products = await Product.find({category:categoryId});

        if(!products || products.length===0){
            return res.status(404).json({
                success:false,
                message:"No product found for this category"
            })
        }
        res.status(201).json({
            success:true,
            products
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Failed to fetch product",
            error:error.message
        })
    }
}

export {getProductsByCategoryId}