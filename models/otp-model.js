import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({

    email:{
        type:String,
        required:true,
        lowercase:true,
        trim:true
    },
    otp:{
        type:String,
        required:true
    },
    purpose:{
        type:String,
        required:true,
        enum:["verify_email", "login", "forgot_password"],
        required:true
    },
    expiresAt:{
        type:Date,
        required:true,
        index:{expires:0}
    }
},{timestamps:true})

export const OtpModel = mongoose.model('Otp', otpSchema);
export default OtpModel;