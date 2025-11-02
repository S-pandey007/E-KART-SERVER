import dotenv from 'dotenv'
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import session from 'express-session';
import ConnectMongoDBSession from 'connect-mongodb-session';
import Product from '../models/product-model.js';
import Category from '../models/category-model.js';
import Order from '../models/order-model.js'
import User from '../models/user-model.js'
import Transaction from '../models/transaction-model.js'
import * as AdminJSMongoose from '@adminjs/mongoose';
import {dark,light,noSidebar} from '@adminjs/themes'
dotenv.config()

AdminJS.registerAdapter(AdminJSMongoose)

const DEFAULT_ADMIN={
    email:"shubhampandey8663@gmail.com",
    password:"sanika"
}

const authenticate = async(email,password)=>{
    if(email ===DEFAULT_ADMIN.email && password ===DEFAULT_ADMIN.password){
        return Promise.resolve(DEFAULT_ADMIN)
    }
    return null
}

export const buildAdminJS = async(app)=>{

    const admin = new AdminJS({
        resources:[
            {resource:Product},
            {resource:Category},
            {resource:User},
            {resource:Order},
            {resource:Transaction},
        ],
        branding:{
            companyName:"Kart",
            withMadeWithLove:false,
            favicon:"https://th.bing.com/th/id/OIP.nburQyj1SHjExRBzaHJUWwHaEc?w=266&h=180&c=7&r=0&o=7&pid=1.7&rm=3",
            logo:"https://th.bing.com/th/id/OIP.Glf5hBEVosddwDfoAtXWNQHaGh?w=209&h=184&c=7&r=0&o=7&pid=1.7&rm=3"
        },
        defaultTheme:dark.id,
        availableThemes:[dark,light,noSidebar],
        rootPath:"/admin"
    })

    const MongoDBStore = ConnectMongoDBSession(session)
    const sessionStore = new MongoDBStore({
        uri:process.env.MONGODB_URI,
        collection:'sessions'
    })

    const adminRouter = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate,
            cookieName:'adminjs',
            cookiePassword:process.env.COOKIE_PASSWORD
        },
        null,
        {
            store:sessionStore,
            resave:true,
            saveUninitialized:true,
            secret:process.env.COOKIE_PASSWORD,
            cookie:{
                httpOnly:process.env.NODE_ENV === 'production',
                secure:process.env.NODE_ENV==="production"
            },
            name:"adminjs"
        }
    )

    app.use(admin.options.rootPath,adminRouter);
}