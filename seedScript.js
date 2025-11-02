import dotenv from 'dotenv';
import Product from './models/product-model.js'
import Category from './models/category-model.js'
import {categoriesData,productData} from './seedData.js'

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

        const productWithCategoryIds = productData.map((product)=>({
            ...product,
            category:categoriesMap[product.category]
        }))

        await Product.insertMany(productWithCategoryIds)

        console.log("data seed successfully")
} catch (error) {
        console.error("Error seeding data",error)
    }
}

export {seedData}
