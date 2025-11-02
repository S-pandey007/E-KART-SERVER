import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    address:{
        type:String
    }
},{timestamps:true})

const User = mongoose.model("User", UserSchema);
export default User;