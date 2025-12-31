import {Router} from 'express';
import {searchSuggestionsController,searchProductListController}from '../../controllers/search/search.controller.js'

const router = Router();

router.get("/suggesstions",searchSuggestionsController)
router.get("/products",searchProductListController)
export default router