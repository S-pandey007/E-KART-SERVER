import express from 'express';
import {getProfileController} from '../../controllers/user/user.controller.js';
import {authMiddleware} from '../../middleware/auth.middleware.js';

const router = express.Router();


// Route to get user profile
router.get("/profile", authMiddleware, getProfileController);
export default router;
