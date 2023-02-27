import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'
import Coupon from '../models/coupon.schema'

/**********************************************************
 * @CREATE_COUPON
 * @route https://localhost:5000/api/coupon
 * @description Controller used for creating a new coupon
 * @description Only admin and Moderator can create the coupon
 * @parameters code, discount
 * @returns Coupon Object with success message "Coupon Created SuccessFully"
 *********************************************************/
export const createCollection = asyncHandler( async(req, res) => {
    const { code, discount } = req.body
    if (req.user.role !== 'ADMIN') {
        throw new CustomError('Not authorized to access this route', 401)
    }
    if (!code) {
        throw new CustomError("Coupon code is required", 400)
    }
    if (!discount) {
        throw new CustomError("Coupon discount is required", 400)
    }
    const coupon = await Coupon.create({
        code, discount
    })

    res.status(200).json({
        success: true,
        message: "Coupon created successfully",
        coupon
    })

})

/**********************************************************
 * @DEACTIVATE_COUPON
 * @route https://localhost:5000/api/coupon/deactive/:couponId
 * @description Controller used for deactivating the coupon
 * @description Only admin and Moderator can update the coupon
 * @parameters couponId from URL
 * @returns Coupon Object with success message "Coupon Deactivated SuccessFully"
 *********************************************************/
export const deactivateCoupon = asyncHandler( async(req, res) => {
    const { couponId } = req.params
    if (req.user.role !== 'ADMIN') {
        throw new CustomError('Not authorized to access this route', 401)
    }
    const coupon = await Coupon.findByIdAndUpdate(couponId, { active : false})

    res.status(200).json({
        success: true,
        message: "Coupon Deactivated SuccessFully",
        coupon
    })
})

/**********************************************************
 * @DELETE_COUPON
 * @route https://localhost:5000/api/deletecoupon/:couponId
 * @description Controller used for deleting the coupon
 * @description Only admin and Moderator can delete the coupon
 * @parameters couponId from URL
 * @returns Success Message "Coupon Deleted SuccessFully"
 *********************************************************/
export const deleteCoupon = asyncHandler ( async(req, res) => {
    const { couponId } = req.params
    if (req.user.role !== 'ADMIN') {
        throw new CustomError('Not authorized to access this route', 401)
    }
    await Coupon.findByIdAndDelete(couponId)
    res.status(200).json({
        success: true,
        message: "Coupon Deleted SuccessFully"
    })
})


/**********************************************************
 * @GET_ALL_COUPONS
 * @route https://localhost:5000/api/getallcoupons
 * @description Controller used for getting all coupons details
 * @description Only admin and Moderator can get all the coupons
 * @returns allCoupons Object
 *********************************************************/
export const getAllCoupons = asyncHandler( async(req, res) => {
    if (req.user.role !== 'ADMIN') {
        throw new CustomError('Not authorized to access this route', 401)
    }
    const allCoupons = await Coupon.find({})
    if (!allCoupons) {
        throw new CustomError("No Coupons found", 400)
    }
    res.status(200).json({
        success: true,
        allCoupons
    })
})
