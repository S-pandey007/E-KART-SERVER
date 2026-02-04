import mongoose, { Schema } from "mongoose";

const ProductSchema = new Schema({
    name:{type:String,required:true,index:true},
    brand:{type:String,index:true},
    image:{type:String,required:true},
    originalPrice:{type:Number,required:true},
    sellingPrice:{type:Number,required:true,index:true},
    wowPrice:{type:Number},
    description:{type:String},
    rating:{type:Number},
    ratingCount:{type:String},
    assured:{type:Boolean},
    discountPercent:{type:Number},
    exchangeOffer:{type:String},
    deliveryText:{type:String},
    warranty:{type:String},
    category: { type: String, required: true, index: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true }

},{timestamps:true})


ProductSchema.index({name:"text"});
const Product = mongoose.model("Product",ProductSchema);
export default Product;