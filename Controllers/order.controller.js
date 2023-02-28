import Product from "../models/product.schema.js";
import Coupon from "../models/coupon.schema.js";
import Order from "../models/order.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import razorpay from "../config/razorpay.config.js";

/**********************************************************
 * @GENEARATE_RAZORPAY_ID 
 * @route https://localhost:5000/api/order/razorpay
 * @description Controller used for genrating razorpay Id
 * @description Creates a Razorpay Id which is used for placing order
 * @returns Order Object with "Order Id generated successfully"
 *********************************************************/
export const generateRazorpayOrderId = asyncHandler( async (req, res)=>{
    //get product and coupon from frontend
    const { products, coupon, address, phoneNumber, paymentMode  } = req.body
    
    let tempProduct;
    let totalAmount;
    let finalAmount;
    //verfiy product price from backend
    // DB query to get all products info one by one
    products.array.forEach(async (element) => {
        tempProduct = await Product.findById(element._id)
        if ( !tempProduct ) {
            throw new CustomError( 'Product not Avaiable' , 400)
        }
        if (tempProduct.price !== element.price) {
            throw new CustomError( 'Tampered data' , 400)
        }
        totalAmount += tempProduct.price
        tempProduct = null
    });
    
    if (coupon) {
        const couponValue = await Coupon.findOne({ code: coupon })
        if (!couponValue) {
            throw new CustomError( 'Invalide Coupon Code' , 400)
        }
        finalAmount = totalAmount + (couponValue.discount /100)
    } else {
        finalAmount = totalAmount
    }

    const options = {
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        receipt: `receipt_${new Date().getTime()}`
    }

    const razorpayOrder = await razorpay.orders.create(options)

    //if order does not exist
    if (!razorpayOrder) {
        throw new CustomError( 'something whent wrong while creating order' , 400)
    }
    // success then, send it to front end
    const order = new Order.create({
        products,
        user : req.user._id,
        address,
        phoneNumber,
        amount : finalAmount,
        coupon,
        transactionId : razorpayOrder.transactionId,
        status : 'ORDERED',
        paymentMode
    })

    res.status(200).json({
        success: true,
        message: "order created successfully",
        order
    })
})

