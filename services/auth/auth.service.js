import dotenv from 'dotenv';
dotenv.config();
import { verifyOtp } from '../otp/otp.service.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from '../../config/logger.js';
import User from '../../models/user-model.js';
import Session from '../../models/session-model.js';
import { generateToken, generateSessionId } from '../../utils/createToken.js';

// session create
const createSession =async (userId)=>{
    try {
        const sessionId = generateSessionId();

    const {accessToken, refreshToken} = generateToken({userId, sessionId});

    // compute expirey for session (refresh token lifetime)
    logger.debug(`Calculating session expiry time ${process.env.REFRESH_EXPIRES_IN} days`);
    const days = parseInt(process.env.REFRESH_EXPIRES_IN);
    const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    logger.info(`Creating session for user: ${userId} with sessionId: ${sessionId}`);
    logger.debug(`Refresh token expires at: ${expiresAt}`);
    // save session in db
    const session = await Session.create({
        userId,
        sessionId,
        refreshToken,
        isActive: true,
        expiresAt
    })

    // await session.save();
    if(!session){
        throw new Error('Failed to create session');
    }
    logger.info('Session created successfully for user:', userId);
    return {
        accessToken,
        refreshToken,
        sessionId
    }
    } catch (error) {
        logger.error(error,'Error creating session:');
        throw new Error('Error creating session');
    }
}

// register user
const register = async({
    fullName,
    email,
    password,
    otp,
    gender,
    dateOfBirth,
    loginProvider="password"
})=>{
    try {
           // validation
    if(!fullName || !email || !password || !otp){
        return {success:false,message:'All fields are required'};
    }

    // check if user already exists
    const existing = await User.findOne({email});
    if(existing){
        return {success:false,message:'User already exists'};
    }

    // verify otp
    const IsverifyOtp = await verifyOtp(email, otp, 'verify_email');
    if(!IsverifyOtp.success){
        logger.warn(`OTP verification failed for ${email}: ${IsverifyOtp.message}`);
        return { success:false, message: IsverifyOtp.message };

    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // create user
    const user = await User.create({
        fullName,
        email,
        password: hashedPassword,
        gender,
        dateOfBirth,
        loginProvider,
        isEmailVerified:true,
        isActive:true,
        isBanned:false
    })

    if(!user){
        return {success:false,message:'Failed to create user'};
    }
    logger.info('User registered successfully:', email);

    // create session
    const {refreshToken,accessToken,sessionId} = await createSession(user._id);

     const userSafe = user.toObject();
     delete userSafe.password
    return{
        success:true,
        message:'User registered successfully',
        data:{
            userSafe,
            accessToken,
            refreshToken,
            sessionId
        }
    }
    } catch (error) {
        logger.error( error , 'Error registering user:');
        return {success:false,message:'Error registering user'
    }
}
}

// login user
const login = async({email,password})=>{
    try {
        
        // validation
    if(!email || !password){
        return {success:false,message:'Email and password are required'};
    }

    // find user
    const user = await User.findOne({email}).select('+password');
    if(!user){
        return {success:false,message:'Invalid email or password'};
    }

    // check if active /banned
    if(!user.isActive||user.isBanned){
        return {success:false,message:'User account is inactive or banned'};
    }

    // compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch){
        return {success:false,message:'Invalid email or password'};
    }
        
    // create session

    const {refreshToken,accessToken,sessionId} = await createSession(user._id);

    const userSafe = user.toObject();
    delete userSafe.password;
    return {
        success:true,
        message:'User logged in successfully',
        data:{
            userSafe,
            accessToken,
            refreshToken,
            sessionId
        }
    }
    } catch (error) {
        logger.error( error , 'Error logging in user:');
        return {success:false,message:'Error logging in user'};
    }
}


// refresh access token
const refreshAccessToken = async({refreshToken})=>{

    try {
        // validation
        if(!refreshToken){
            return {success:false,message:'Refresh token is required'};
        }

        // verify refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_KEY);
        const {userId, sessionId} = decoded;

        if(!userId || !sessionId){
            return {success:false,message:'Invalid refresh token'};
        }

        // find session
        const session = await Session.findOne({userId, sessionId, refreshToken, isActive:true});
        if(!session){
            return {success:false,message:'Invalid session'};
        }


        // check expiry
        if(session.expiresAt < new Date()){
            session.isActive = false;
            await session.save();
            return {success:false,message:'Session has expired, please login again'};
        }

        // generate new access token
        const accessToken = jwt.sign(
            {userId, sessionId},
            process.env.JWT_KEY,
            {expiresIn:process.env.ACCESS_EXPIRES_IN}
        );

        return {
            success:true,
            message:'Access token refreshed successfully',
            data:{
                accessToken
            }
        }
    } catch (error) {
        logger.error( error , 'Error refreshing access token:');
        return {success:false,message:'Error refreshing access token'
    }
}
}


// logout
const logout = async({userId, sessionId})=>{
    try {
        const session = await Session.deleteOne({userId, sessionId, isActive:true});
        if(!session){
            logger.warn(`No active session found for userId: ${userId} and sessionId: ${sessionId}`);
            return {success:false,message:'No active session found'};
        }
        logger.info(`UserId: ${userId} logged out successfully from sessionId: ${sessionId}`);
        return {success:true,message:'Logged out successfully'};
    } catch (error) {
        logger.error( error , 'Error logging out user:');
        return {success:false,message:'Error logging out user'
    }
}
}

// reset password
const resetPassword = async({email,newPassword})=>{
    try {
        if(!email || !newPassword){
            logger.warn("resetPassword warning: Email and new password are required");
            return {success:false,message:'Email and new password are required'};
        }

        // find user
        const user = await User.findOne({email});
        if(!user){
            logger.warn(`resetPassword warning: No user found with email: ${email}`);
            return {success:false,message:'No user found with the provided email'};
        }

        if(!user.isActive || user.isBanned){
            logger.warn(`resetPassword warning: User account is inactive or banned for email: ${email}`);
            return {success:false,message:'User account is inactive or banned'};
        }

        // hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;
        await user.save();

        logger.info(`Password reset successfully for user with email: ${email}`);
        return {success:true,message:'Password reset successfully'};
    } catch (error) {
        logger.error( error , 'Error resetting password:');
        return {success:false,message:'Error resetting password'};
    }
}
export {
    register,
    login,
    refreshAccessToken,
    logout,
    resetPassword

}