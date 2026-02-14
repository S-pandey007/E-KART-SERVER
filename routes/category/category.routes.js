import express from "express";
import { getAllCategory, getProductByCategoryController } from "../../controllers/category/Category.controller.js";


const router = express.Router();

router.get("/",getAllCategory);
router.get("/:categoryId",getProductByCategoryController);

export default router