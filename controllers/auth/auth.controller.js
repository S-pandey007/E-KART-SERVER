import logger from "../../config/logger.js";
import { generateOtp ,verifyOtp} from "../../services/otp/otp.service.js";
import { register,login,refreshAccessToken ,logout,resetPassword} from "../../services/auth/auth.service.js";
import User from "../../models/user-model.js";
const sendOtp = async(req , res)=>{
    try {
        const {email,fullName} = req.body;

        if(!email || !fullName){
            logger.warn("sendOtp warning: Missing required fields");
            return res.status(400).json({
                success:false,
                message:"Missing required fields"
            });
        }

        // trigger otp generation and sending 
        const result = await generateOtp(email,fullName,"verify_email");

        if(!result.success){
            logger.error(`sendOtp error: ${result.message}`);
            return res.status(500).json({
                success:false,
                message:result.message,
            })
        }
        logger.info(`OTP sent successfully to ${email}`);
        return res.status(200).json({
            success:true,
            message:"OTP sent successfully"
        })
    } catch (error) {
        logger.error(error,"sendOtp error:");
        return res.status(500).json({
            success:false,
            message:"Inter server error"
        })
    }
}

const verifyOtpController = async (req, res) => {
    try {
        const { email, otp,purpose } = req.body;

        if(!email || !otp){
            logger.warn("verifyOtpController warning: Missing required fields");
            return res.status(400).json({
                success:false,
                message:"Missing required fields"
            })

        }

        // call verify service
        const result = await verifyOtp(email,otp,purpose);

        if(!result.success){
            return res.status(400).json({
                success:false,
                message:result.message
            })
        }

        logger.info(`OTP verified for ${email} for purpose ${purpose}`);
        return res.status(200).json({
            success:true,
            message:"OTP verified successfully"
        })
    } catch (error) {
        logger.error(error,"verifyOtpController error:");
        return res.status(500).json({
            success:false,
            message:"Internal server error while verifying OTP"
        })
    }
}


const registerController= async(req,res)=>{
    try {
    const {
    fullName,
    email,
    password,
    otp,
    gender,
    dateOfBirth,
    loginProvider} = req.body;
    logger.info(`registerController: Registration attempt for email: ${email}`);

    const result = await register({
    fullName,
    email,
    password,
    otp,
    gender,
    dateOfBirth,
    loginProvider
    })

    if(!result.success){
    logger.warn(`registerController warning: ${result.message}`);
        return res.status(400).json({
        success:false,
        message:result.message
        })
    }
    logger.info(`registerController: User registered successfully: ${email}`);
    return res.status(201).json({
        success:true,
        message:"User registered successfully",
        data:result.data
    })
    } catch (error) {
        logger.error( error , "registerController error");
        return res.status(500).json({
        success:false,
        message:"Internal server error during registration"
        })
    }
}

const loginController = async(req,res)=>{
    try {
        const {email,password} = req.body;

        const result= await login({email,password});

        if(!result.success){
            logger.warn(`loginController warning: ${result.message}`);
            return res.status(400).json({
                success:false,
                message:result.message
            })
        }
        logger.info(`loginController: User logged in successfully: ${email}`);
        return res.status(200).json({
            success:true,
            message:"User logged in successfully",
            data:result.data
        })
    } catch (error) {
        logger.error( error , "loginController error");
        return res.status(500).json({
            success:false,
            message:"Internal server error during login"
        })
    }
}

const refreshAccessTokenController = async(req,res)=>{
    try {
        const {refreshToken} = req.body;

        const result = await refreshAccessToken({refreshToken});
        if(!result.success){
            logger.warn("refreshAccessTokenController warning: Invalid refresh token");
            return res.status(400).json({
                success:false,
                message:result.message
            })
        }
        logger.info("refreshAccessTokenController: Access token refreshed successfully");
        return res.status(201).json({
            success:true,
            message:"Access token refreshed successfully",
            data:result.data
        })
    } catch (error) {
        logger.error( error , "refreshAccessTokenController error");
        return res.status(500).json({
            success:false,
            message:"Internal server error during token refresh"
        })
    }
}

//logout
const logoutController = async(req,res)=>{
    try {
        const userId = req.userId;
        const sessionId = req.sessionId;

        const result = await logout({userId, sessionId});
        if(!result.success){
            logger.warn("logoutController warning: Logout failed");
            return res.status(400).json({ success:false, message:result.message });
        }
        logger.info(`logoutController: User ${userId} logged out successfully`);
        return res.status(200).json({ success:true, message:'Logged out successfully' });
    } catch (error) {
        logger.error( error , "logoutController error");
        return res.status(500).json({ success:false, message:"Internal server error during logout" });
    }
}


//forgot password otp
const forgotPasswordOTPController = async(req,res)=>{
    try {
        const {email,fullName} = req.body;
        if(!email || !fullName){
            logger.warn("forgotPasswordController warning: Missing required fields");
            return res.status(400).json({
                success:false,
                message:"Missing required fields"
            })
        }

        // check user exista
        const user = await User.findOne({email});

        if(!user){
            logger.warn(`forgotPasswordController warning: No user found with email: ${email}`);
            return res.status(404).json({
                success:false,
                message:"No user found with the provided email"
            })
        }
        // generate otp and send otp
        const result = await generateOtp(email,fullName,"forgot_password");

        if(!result.success){
            logger.error(`forgotPasswordController error: ${result.message}`);
            return res.status(500).json({
                success:false,
                message:result.message
            })
        }
        logger.info(`Forgot password OTP sent successfully to ${email}`);
        return res.status(200).json({
            success:true,
            message:"Forgot password OTP sent successfully"
        })
    } catch (error) {
        logger.error(error, "forgotPasswordOTPController error");
        return res.status(500).json({
            success:false,
            message:"Internal server error during forgot password OTP process"
        })
    }
}

// reset password controller
const resetPasswordController = async(req,res)=>{
    try {
        const {email,newPassword} = req.body;

        const result = await resetPassword({email,newPassword});
        if(!result.success){
            logger.warn(`resetPasswordController warning: ${result.message}`);
            return res.status(400).json({
                success:false,
                message:result.message
            })
        }
        logger.info(`resetPasswordController: Password reset successfully for ${email}`);
        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    } catch (error) {
        logger.error( error , "resetPasswordController error");
        return res.status(500).json({
            success:false,
            message:"Internal server error during password reset"
        })
    }
}
export {
    sendOtp,
    verifyOtpController,
    registerController,
    loginController,
    refreshAccessTokenController,
    logoutController,
    forgotPasswordOTPController,
    resetPasswordController
}