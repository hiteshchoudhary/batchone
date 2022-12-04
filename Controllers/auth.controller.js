import User from '../models/user.schema.js'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'
import mailHelper from '../utils/mailHelper'


export const cookieOptions = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    //could be in a separate file in utils
}


/******************************************************
 * @SIGNUP
 * @route http://localhost:5000/api/auth/signup
 * @description User signUp Controller for creating new user
 * @parameters name, email, password
 * @returns User Object
 ******************************************************/
export const signUp = asyncHandler(async (req, res) => {
    const {name, email, password } = req.body

    if (!name || !email || !password) {
        throw new CustomError('Please fill all fields', 400)
    }
    //check if user exists
    const existingUser = await User.findOne({email})

    if (existingUser) {
        throw new CustomError('User already exists', 400)  
    }

    const user = await User.create({
        name,
        email,
        password
    });
    const token = user.getJwtToken()
    console.log(user);
    user.password = undefined

    res.cookie("token", token, cookieOptions)

    res.status(200).json({
        success: true,
        token,
        user
    })

})

/******************************************************
 * @LOGIN
 * @route http://localhost:5000/api/auth/login
 * @description User signIn Controller for loging new user
 * @parameters  email, password
 * @returns User Object
 ******************************************************/

export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body

    if ( !email || !password) {
        throw new CustomError('Please fill all fields', 400)
    }

    const user = User.findOne({email}).select("+password")

    if (!user) {
        throw new CustomError('Invalid credentials', 400)
    }

    const isPasswordMatched = await user.comparePassword(password)

    if (isPasswordMatched) {
        const token = user.getJwtToken()
        user.password = undefined;
        res.cookie("token", token, cookieOptions)
        return res.status(200).json({
            success: true,
            token,
            user
        })
    }

    throw new CustomError('Invalid credentials - pass', 400)

})


/******************************************************
 * @LOGOUT
 * @route http://localhost:5000/api/auth/logout
 * @description User logout bby clearing user cookies
 * @parameters  
 * @returns success message
 ******************************************************/
export const logout = asyncHandler(async (_req, res) => {
    // res.clearCookie()
    res.cookie("token", null, {
        expires: new Date(Date.now()),
        httpOnly: true
    })
    res.status(200).json({
        success: true,
        message: "Logged Out"
    })
})

/******************************************************
 * @FORGOT_PASSWORD
 * @route http://localhost:5000/api/auth/password/forgot
 * @description User will submit email and we will generate a token
 * @parameters  email
 * @returns success message - email send
 ******************************************************/

export const forgotPassword = asyncHandler(async(req, res) => {
    const {email} = req.body
    //check email for null or ""

    const user = await User.findOne({email})
    if (!user) {
        throw new CustomError('User not found', 404)
    }
    const resetToken = user.generateForgotPasswordToken()

    await user.save({validateBeforeSave: false})

    const resetUrl = 
    `${req.protocol}://${req.get("host")}/api/auth/password/reset/${resetToken}`

    const text = `Your password reset url is
    \n\n ${resetUrl}\n\n
    `

    try {
        await mailHelper({
            email: user.email,
            subject: "Password reset email for website",
            text:text,
        })
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email}`
        })
    } catch (err) {
        //roll back - clear fields and save
        user.forgotPasswordToken = undefined
        user.forgotPasswordExpiry = undefined

        await user.save({validateBeforeSave: false})

        throw new CustomError(err.message || 'Email sent failure', 500)
    }

})


