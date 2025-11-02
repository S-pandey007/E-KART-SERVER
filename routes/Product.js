import express from "express";
import {getProductsByCategoryId} from '../controllers/Product.js';

const router = express.Router();

router.get("/:categoryId",getProductsByCategoryId);

export default router