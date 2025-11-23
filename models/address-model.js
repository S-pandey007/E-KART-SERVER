import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    fullName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 20,
    },
    phone:{
        type:String,
        default:null,
    },
    
    addressLine1: {
      type: String,
    //   required: true,
      trim: true,
      maxlength: 120,
    },

    addressLine2: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },

     landmark: {
      type: String,
      trim: true,
      maxlength: 120,
      default: null,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    country: {
      type: String,
      required: true,
      trim: true,
      default: "India",
    },

    
    pinCode: {
      type: String,
      required: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid PIN code"],
    },

    addressType: {
      type: String,
      enum: ["home", "work", "other"],
      default: "home",
    },

 
    isDefault: {
      type: Boolean,
      default: false,
      index: true,
    },

  
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
    },
},{ timestamps: true });

addressSchema.index({ pinCode: 1 });

export default mongoose.model("Address", addressSchema);