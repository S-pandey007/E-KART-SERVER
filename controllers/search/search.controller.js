import logger from '../../config/logger.js'
import {getSearchSuggestions,searchProducts} from '../../services/search/search.service.js'

const searchSuggestionsController = async(req,res)=>{
    try {
        const {q,limit} = req.query;

        if(!q || typeof q !=="string"){
            return res.status(400).json({
                success:false,
                message:"Search query is requred"
            })
        }

        const data = await getSearchSuggestions(q,Number(limit)||10);

        return res.status(200).json({
            data
        })
    } catch (error) {
        logger.error(error,"Search suggestion controller");
        return res.status(500).json({
            success:false,
            message:"Internal server error",
            error:error.message
        })
    }
}

const searchProductListController = async(req,res)=>{
    try {
        const {query,category,page,limit,sort}=req.query;

        if(!query && !category){
            return res.status(400).json({
                success:false,
                message:"Search query or category is requred"
            })
        }

        const data = await searchProducts({
            query,
            category,
            page:Number(page)||1,
            limit:Number(limit)||10,
            sort
        })

        return res.status(201).json({
            data
        })

    } catch (error) {
        logger.error(error,"Search product controller")
        return res.status(500).json({
            success:false,
            message:"Inter server error",
            error:error.message
        })
    }
}

export{searchSuggestionsController,searchProductListController}