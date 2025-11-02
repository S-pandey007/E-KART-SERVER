import express from "express";
import {getAllCategory} from '../controllers/Category.js';

const router = express.Router();

router.get("/",getAllCategory);

export default router