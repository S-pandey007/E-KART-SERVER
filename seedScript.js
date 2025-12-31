import dotenv from 'dotenv';
import Product from './models/product-model.js'
import Category from './models/category-model.js'
import {categoriesData} from './seedData.js'
import { Dataset } from './utils/Data.js';
import Influencer from './models/InfluencerSchema-model.js';
import { InfluencerData } from './utils/InfulancerData.js';
dotenv.config();

async function seedData() {
    try {
        
        await Product.deleteMany();
        await Category.deleteMany();

        const categoriesDocs= await Category.insertMany(categoriesData);

        const categoriesMap = categoriesDocs.reduce((map,category)=>{
            map[category.name]=category._id;
            return map
        })

        const productWithCategoryIds = Dataset.map((product)=>({
            ...product,
            category:categoriesMap[product.category]
        }))

        await Product.insertMany(productWithCategoryIds)

        console.log("data seed successfully")
} catch (error) {
        console.error("Error seeding data",error)
    }
}


async function seedInfulancerData(){
    try {
        await Influencer.deleteMany();
         await Influencer.insertMany(InfluencerData)
        console.log("infulacer data added")
    } catch (error) {
        console.error("Error seeding Infulacer data",error)
    }
}

export {seedData,seedInfulancerData}
