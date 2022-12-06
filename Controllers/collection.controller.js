import Collection from '../models/collection.schema'
import asyncHandler from '../services/asyncHandler'
import CustomError from '../utils/customError'

/******************************************************
 * @CREATE_COLLECTION
 * @description create new collection
 * @parameters collection name
 * @REQUEST_TYPE POST
 * @returns json response with collection name
 ******************************************************/
export const createCollection = asyncHandler(async (req, res) => {
    const { name } = req.body
    if (!name) {
        throw new CustomError('Inavlid Collection name', 400)
    }
    const collection = await Collection.create({
        name: req.body
    })
    res.status(200).json({
        success: true,
        collection
    })
})