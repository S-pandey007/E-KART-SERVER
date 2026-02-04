import mongoose, { Schema } from "mongoose";

const CategorySchema = new Schema({
    name:{type:String,required:true,index:true},
    image_uri:{type:String,required:true},

},{timestamps:true})

CategorySchema.index({name:"text"});

const Category = mongoose.model("Category",CategorySchema);
export default Category;