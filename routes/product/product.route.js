import express from "express";
import { getProductDetailByIdController } from "../../controllers/products/product.controller.js";

const router = express.Router();

router.get("/byId/:id",getProductDetailByIdController);

export default router