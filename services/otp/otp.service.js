import OtpModel from "../../models/otp-model.js";
import logger from "../../config/logger.js";
import { sendOtpEmail,sendForgotPasswordEmail } from "../email/email.service.js";
const generateOtp=async(email,fullName,purpose = "verify_email")=>{

    try{

        // validate inputs
        if(!email) throw new Error("Email is required to generate OTP");
        if(!fullName) throw new Error("Full name is required to generate OTP");
        if(!["verify_email","forgot_password"].includes(purpose)){
            throw new Error("Invalid purpose for OTP generation");
        }
        
        // Generate a 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        //set OTP expiry time to 10 minutes from now
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        // delete previous OTPs for the same email and purpose
        await OtpModel.deleteMany({email,purpose});

        // store in db
        await OtpModel.create({
            email,
            otp,
            purpose,
            expiresAt
        });
        
        //send OTP via email based on purpose
        if(purpose === "verify_email"){
            await sendOtpEmail({to:email,fullName,otp});
        } else if(purpose === "forgot_password"){
            await sendForgotPasswordEmail({to:email,fullName,otp});
        }
        
        // logger.info(`OTP generated for ${email} for purpose ${purpose}`);
    
        return {
            success:true,
            message:"OTPsent successfully"
        }
    }catch(error){
        logger.error("Error in generating OTP",error);
        return {
            success:false,
            error:error.message
        }
    }

}

const verifyOtp = async(email,otp,purpose="verify_email")=>{
    try {
        const otpEntry = await OtpModel.findOne({email,purpose});

        if(!otpEntry){
            logger.warn(`No OTP entry found for ${email} and purpose ${purpose}`);
            return {success:false, message:"OTP not found or expired"};
        }

        // check expiry
        if(otpEntry.expiresAt <new Date()){
            await OtpModel.deleteMany({email,purpose});
            logger.warn(`OTP for ${email} has expired`);
            return {success:false, message:"OTP has expired"};
        }

        // compare otp
        const isMatch = otpEntry.otp === otp;
        if(!isMatch){
            logger.warn(`Invalid OTP provided for ${email}`);
            return {success:false, message:"Invalid OTP"};
        }

        // OTP is valid, delete it
        await OtpModel.deleteMany({email,purpose});
        return {success:true, message:"OTP verified successfully"}
    } catch (error) {
        logger.error("Error in verifying OTP", error);
        return{
            success:false,
            message:error.message
        }
    }
}

export {
    generateOtp,
    verifyOtp
}
