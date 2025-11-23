import logger from "../../config/logger.js";
import transorter from "../../config/mail/transporter.js";
import {otpEmailTemplate} from "../../utils/mail/templates/otp.template.js"
import {forgotPasswordTemplate} from "../../utils/mail/templates/forgotPassword.template.js"
 const sendOtpEmail = async({to,fullName, otp})=>{
    try{

        if(!to) throw new Error("Recipient email address is required");
        if(!otp) throw new Error("OTP is required to send email");
        // logger.info(`Preparing to send OTP email to ${to} with OTP: ${otp}`);
        const htmlContent = otpEmailTemplate(fullName, otp);

        const mailOptions = {
            from: `"E-KART Support" <${process.env.GMAIL_USER}>`,
            to,
            subject: "Your E-KART Verification OTP",
            html: htmlContent
        }

        const info = await transorter.sendMail(mailOptions);
        logger.info(`OTP email sent to ${to}: ${info.response}`);

        return{
            success: true,
            message: info.messageId
        }
    }catch(error){
        logger.error(`Failed to send OTP email to ${to}: ${error.message}`);
        return{
            success: false,
            message: error.message
        }
    }
}

const sendForgotPasswordEmail = async({to, fullName, otp})=>{
    try {
        if(!to) throw new Error("Recipient email address is required");
        if(!otp) throw new Error("OTP is required to send email");
        const htmlContent = forgotPasswordTemplate({ fullName, otp });
        const mailOptions = {
            from: `"E-KART Support" <${process.env.GMAIL_USER}>`,
            to,
            subject: "E-KART Password Reset OTP",
            html: htmlContent
        }
        const info = await transorter.sendMail(mailOptions);
        logger.info(`Forgot Password email sent to ${to}: ${info.response}`);
        return {
            success: true,
            message: info.messageId
        }
    } catch (error) {
        logger.error(`Failed to send Forgot Password email to ${to}: ${error.message}`);
        return {
            success: false,
            message: error.message
        }
    }
}
export { sendOtpEmail,sendForgotPasswordEmail};