import express from 'express';
import {createOrder, createTransaction, getOrdersByUserId} from '../controllers/Order.js'
const router = express.Router();

router.post("/transaction",createTransaction);
router.get("/",getOrdersByUserId);
router.post("/",createOrder)
export default router;