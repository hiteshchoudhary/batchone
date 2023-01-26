import Product from "../models/product.schema.js";
import Coupon from "../models/coupon.schema.js";
import Order from "../models/order.schema.js";
import asyncHandler from "../services/asyncHandler.js";
import CustomError from "../utils/customError.js";
import razorpay from "../config/razorpay.config.js";

/**********************************************************
 * @GENEARATE_RAZORPAY_ID
 * @REQUEST_TYPE POST
 * @Route https://localhost:5000/api/order/razorpay
 * @Description 1. Controller used for genrating razorpay Id
 *              2. Creates a Razorpay Id which is used for placing order
 * @Parameters 
 * @Returns Order Object with "Razorpay order id generated successfully"
 *********************************************************/

export const generateRazorpayOrderId = asyncHandler (async (req, res) =>{

    // Get Product and Coupon From Frontend

    const { products : Products, code : couponCode} = req.body;

    if(!Products){
        throw new CustomError("No Product was Found",404);
    };

    let coupon;

    // Checks Coupon Only if Coupon Code is not Null
    if(couponCode !== null){
        
        // Queru Database for Cooupon using Aggregation and makes a Copy
        coupon = await Coupon.find({code : { $eq : couponCode } });
        
        // Coupon Check DB
        if(!coupon || !coupon.active){
            throw new CustomError("Invalid Coupon Code",400);
        };

    }

    // Verify the Product Price From Backend And Make Database Query to get all Products and Info

    const productsList = Products.map(async (product) => {

        return await Product.find({$and : [ { _id : { $eq : product._id } }, { price : { $eq : product.price } }]});

    });

    // Total Amount & Final Amount

    const totalAmount = productsList.reduce((previousAmount,Product) => {
        return previousAmount + Product.price;
    });

    const Discount = couponCode !== null ? (totalAmount * coupon.discount)/100 : 0;

    // finalAmount = totalAmount - Discount
    const finalAmount = totalAmount - Discount;

    const options = {
        amount : Math.round(finalAmount * 100),
        currency : "INR",
        receipt : `Receipt_${new Date().getTime()}`, 
    };

    const order = await Razorpay.orders.create(options);

    // If Order Does Not Exists
    if(!order){
        throw new CustomError("An Error occured on the Server. Please try to Place a Order Again ",400);
    };

    // Success Then, Send it to Frontend

    res.status(201).json({
        success : true,
        message: "Order Created Successfully",
        order
    });

    // Unsetting Products, coupon, productsList, totalAmount, Discount, finalAmount, options, order 
    // to Free Up Space from the Memory
    
    Products.remove();
    coupon.remove();
    productsList.remove();
    totalAmount.remove();
    Discount.remove();
    finalAmount.remove();
    options.remove();
    order.remove();

});

