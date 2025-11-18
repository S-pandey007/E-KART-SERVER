import Razorpay from 'razorpay';
import crypto from 'crypto';
import Order from '../models/order-model.js';
import Transcation from '../models/transaction-model.js';

const createTransaction = async(req,res)=>{
    const {amount,userId}=req.body;
    console.log("Amount:", amount, "User ID:", userId); // Debugging line to check input values
    const razorpay = new Razorpay({
        key_id:process.env.RAZOR_PAY_KEY_ID,
        key_secret:process.env.RAZOR_PAY_SECRET
    })

    const options={
        amount:amount,
        currency:"INR",
        receipt:`receipt#${Date.now()}`
    }

    try {
        
        if(!amount || !userId){
            return res.status(400).json({
                sucess:false,
                message:"Something went wrong when create Order"
            })
        }

        const razorpayOrder = await razorpay.orders.create(options);
        console.log("Razorpay Order:", razorpayOrder); // Debugging line to check created order
        res.status(201).json({
            success:true,
            message:"Order create successfully",
            key:process.env.RAZOR_PAY_KEY_ID ,
            amount:razorpayOrder.amount,
            currency:razorpayOrder.currency,
            order_id:razorpayOrder.id
        })
    } catch (error) {
        res.status(500).json({
            sucess:false,
            message:"Failed to create order",
            error:error.message
        })
    }
}


const createOrder = async(req,res)=>{
    const{
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        userId,
        cartItems,
        deliveryDate,
        address
    }=req.body;
    // console.log("Create Order Request Body:", req.body); // Debugging line to check request body
    const key_secret = process.env.RAZOR_PAY_SECRET;
    // console.log("Key Secret:", key_secret); // Debugging line to check key secret
    const generated_signature = crypto.createHmac('sha256',key_secret).update(razorpay_order_id+"|"+razorpay_payment_id).digest('hex');

    if(generated_signature === razorpay_signature){
        try {
            const transaction = await  Transcation.create({
                user:userId,
                orderId:razorpay_order_id,
                paymentId:razorpay_payment_id,
                status:"Success",
                amount:cartItems.reduce(
                    (total,item)=>total+item?.quantity * item?.price,0
                )
            })

            const order = await Order.create({
                user:userId,
                address,
                deliveryDate,
                items:cartItems?.map((item)=>({
                    product:item?._id,
                    quantity:item?.quantity
                })),
                status:'Order Placed'
            })
            // console.log("Order before saving transaction ID:", order); // Debugging line to check order before saving

            await order.save();
            transaction.order =  order._id;
            await transaction.save();

            console.log("Order created successfully:", order); // Debugging line to check created order
            res.status(201).json({
                success:true,
                message:"Payment verified order create",
                order
            })
        } catch (error) {
            console.error("Error creating transaction or order:", error); // Debugging line to check error
            res.status(500).json({
                status:"failed",
                message:"Failed to create transaction or order",
                error
            })
        }
    }
}

const getOrdersByUserId = async(req,res)=>{
   const userId = req.params.userId;
    // console.log("User ID:", userId); // Debugging line to check userId
    try {
        const orders = await Order.find({user:userId}).
        populate("user","name email")
        .populate("items.product","name price image_uri ar_uri")
        .sort({createAt:-1});
        console.log("Orders:", orders); // Debugging line to check retrieved orders
        if(!orders || orders.length===0){
            return res.status(404).json({
                success:false,
                message:"No orders found for this user"
            })
        }

        res.status(200).json({
            success:true,
            orders
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:"Failed to retrieve orders",
            error:error.message
        })
    }
}
export {createTransaction,createOrder,getOrdersByUserId}