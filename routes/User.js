import express  from 'express';
import {loginOrSignUp} from '../controllers/User.js'

const router = express.Router();

router.post("/",loginOrSignUp);

export default router