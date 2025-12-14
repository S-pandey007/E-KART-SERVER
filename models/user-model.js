import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({

    fullName:{
        type:String,
        required:true,
        trim:true,
        maxlength:20
    },
    email:{
        type:String,
        lowercase:true,
        trim:true,
        unique:true,
        sparse:true,
        match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    phoneCode:{
        type:String,
        // required:true,
    },
    phone:{
        type:String,
        trim: true,
    },
     password: {
      type: String,
    },
    profileImage: {
      type: String,
      default: null,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other", "prefer-not-to-say"],
      default: null,
    },
     dateOfBirth: {
      type: String,
      default: null,
    },
    isPhoneVerified: { type: Boolean, default: false },
  

    isEmailVerified: { type: Boolean, default: false },

    isActive: { type: Boolean, default: true },
    isBanned: { type: Boolean, default: false },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },
      loginProvider: {
      type: String,
      enum: ["password", "google", "apple", "phone"],
      default: "password",
    },

},{timestamps:true})

// userSchema.index({ phone: 1 }, { unique: true });

// userSchema.index({ email: 1 }, { unique: true, sparse: true });

userSchema.index({ isActive: 1 });
userSchema.index(
  { phone: 1 },
  {
    unique: true,
    partialFilterExpression: {
      phone: { $exists: true, $ne: null }
    }
  }
);



const User = mongoose.model("User", userSchema);
export default User;

// const UserSchema = new Schema({
//     phone:{
//         type:String,
//         required:true,
//         unique:true,
//     },
//     address:{
//         type:String
//     }
// },{timestamps:true})

