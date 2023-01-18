# batchone
A full stack project for e-comm - this is backend part


Adding stars would be great, feel free to fork.
Please don't send pull request in this project.

This project is a part of my live bootcamp - Batch 1.

[Course link](http://hc.lco.dev/jscamp)

## authRoles.middleware.js || Added Features

```
import CustomError from "../utils/customError";
import asyncHandler from "../services/asyncHandler";

export const hasRoles = asyncHandler((...permittedRoles) => {
     
      // Middleware for doing Role-Based Permissions

     // Return Middleware
    return (req, _res, next) => {

        // Taking Out user from Request
        const {user} = req;

        // Checking Whether user role is in the permittedRoles List
        if (!user && !permittedRoles.includes(user.role)){
            throw new CustomError("Forbidden", 403);  // user is Forbidden
        };

        next(); // Role is Allowed, So Continue on the Next Middleware
    };
});
```


## order.controller.js || Added Additional Code

```
import Product from "../models/product.Schema";
import Coupon from "../models/coupon.Schema";
import Order from "../models/order.Schema";
import asyncHandler from "../services/asyncHandler";
import CustomError from "../utils/customError";
import Razorpay from "../config/razorpay.config";




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

    
    const coupon = await Coupon.find({code : { $eq : couponCode } });
    
    // Coupon Check DB
    if(!coupon || !coupon.active){
        throw new CustomError("Invalid Coupon Code",400);
    };

    // Verify the Product Price From Backend And Make Database Query to get all Products and Info

    const productsList = Products.map(async (product) => {

        return await Product.find({$and : [ { _id : { $eq : product._id } }, { price : { $eq : product.price } }]});

    });

    // Total Amount & Final Amount

    const totalAmount = productsList.reduce((previousAmount,nextAmount) => {
        return previousAmount+nextAmount;
    });

    const Discount = coupon.discount;

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

});
```