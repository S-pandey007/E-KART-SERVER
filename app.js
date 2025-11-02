import express from 'express';
import dotenv from 'dotenv';
import debug from 'debug';
import connectDB from './config/db.js'

import userRouter from './routes/User.js'
import categoryRouter from './routes/Category.js'
import productRouter from './routes/Product.js'
import orderROuter from './routes/Order.js'
import { buildAdminJS } from './config/AdminSetup.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const serverLog = debug('app:server');
const errorLog = debug('app:error');

app.use(express.json());
connectDB();
app.use('/users',userRouter);
app.use('/category',categoryRouter);
app.use('/product',productRouter);
app.use('/order',orderROuter);

const start = async ()=>{
    try{

        await buildAdminJS(app);

        app.listen(PORT,(err,addr)=>{
            if(err){
                 errorLog('Server failed to start: %O', err);
            }else{
                serverLog(`Server started on port ${PORT} URL : http://localhost:${PORT}/admin`);

            }
        })
    }catch(error){
        errorLog('Unexpected error during startup: %O', error);
    }
}

start();