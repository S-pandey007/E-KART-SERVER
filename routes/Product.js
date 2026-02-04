import express from "express";
import {getProductDetailByIdController, getProductsByCategoryId, } from '../controllers/Product.js';

const router = express.Router();

router.get("/:categoryId",getProductsByCategoryId);
router.get("/byId/:id",getProductDetailByIdController);

export default router