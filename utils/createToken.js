import dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from "uuid";

const JWT_SECRET = process.env.JWT_KEY;        
const ACCESS_EXPIRES_IN = process.env.ACCESS_EXPIRES_IN;
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN;

// generate access token and refresh token
const generateToken = ({userId,sessionId})=>{
   const accessToken = jwt.sign({userId,sessionId},JWT_SECRET,{expiresIn:ACCESS_EXPIRES_IN});
    const refreshToken = jwt.sign({userId,sessionId},JWT_SECRET,{expiresIn:REFRESH_EXPIRES_IN});
    return {accessToken,refreshToken};
}

export const generateSessionId = () => uuidv4();
export { generateToken}