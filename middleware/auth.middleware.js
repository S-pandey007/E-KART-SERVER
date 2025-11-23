import jwt from 'jsonwebtoken';
import User from '../models/user-model.js';
import Session from '../models/session-model.js';
import logger from '../config/logger.js';

export const authMiddleware = async(req,res,next)=>{
    try {
        let token = req.headers.authorization;

        if(!token){
            logger.warn("authMiddleware warning: No token provided");
            return res.status(401).json({message: "No token provided"});
        }

        // verify jwt
        let decoded = jwt.verify(token,process.env.JWT_KEY);
        if(!decoded){
            logger.warn("authMiddleware warning: Invalid token");
            return res.status(401).json({message: "Invalid token"});
        }

        const {userId, sessionId} = decoded;

        // vlidate session in DB
        const session = await Session.findOne({userId, sessionId, isActive:true,expiresAt:{$gt:new Date()}});
    
        if(!session){
            logger.warn("authMiddleware warning: Session is invalid or has expired");
            return res.status(401).json({message: "Session is invalid or has expired"});
        }

        //validate user in DB
        const user = await User.findById(userId);
        if(!user){
            logger.warn("authMiddleware warning: User not found");
            return res.status(401).json({message: "User not found"});
        }

        if(!user.isActive || user.isBanned){
            logger.warn("authMiddleware warning: User is inactive or banned");
            return res.status(403).json({message: "User is inactive or banned"});
        }

        // attach user and session to request object
        req.userId = userId;
        req.sessionId = sessionId;

        next();
    } catch (error) {
        logger.error( error , "authMiddleware error");
        return res.status(500).json({message: "Internal server error"});
    }
}