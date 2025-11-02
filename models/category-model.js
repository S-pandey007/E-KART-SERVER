import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
    name:{type:String,required:true},
    image_uri:{type:String,required:true},
    products:[{type:mongoose.Schema.Types.ObjectId, ref:"Product"}],

},{timestamps:true})

const Category = mongoose.model("Category",CategorySchema);
export default Category;