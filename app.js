import express from 'express';
import dotenv from 'dotenv';
import debug from 'debug';
import connectDB from './config/db.js'

import userRouter from './routes/User.js'
import categoryRouter from './routes/Category.js'
import productRouter from './routes/Product.js'
import orderROuter from './routes/Order.js'
import authRouter from './routes/auth/auth.routes.js'
import profileRouter from './routes/user/user.routes.js'
import { buildAdminJS } from './config/AdminSetup.js';

import logger from './config/logger.js';
import httpLogger from './middleware/httpLogger.js'
import { verifyMailTransporter } from './config/mail/transporter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


app.use(express.json());
app.use(httpLogger); 


connectDB(); // connect to database
verifyMailTransporter(); // verify mail transporter

app.use('/users',userRouter);
app.use('/category',categoryRouter);
app.use('/product',productRouter);
app.use('/order',orderROuter);
app.use('/auth',authRouter);
app.use('/my',profileRouter);

const start = async ()=>{
    try{

        await buildAdminJS(app);

        app.listen(PORT,(err,addr)=>{
            if(err){
                 logger.error('Server failed to start: %O', err);
            }else{
                logger.info(`Server started on port ${PORT} URL : http://localhost:${PORT}/admin`);

            }
        })
    }catch(error){
        logger.error('Unexpected error during startup: %O', error);
    }
}

start();


// ruka qlyy ggye cmuf