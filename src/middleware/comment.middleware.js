import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";

const verifyComment = asyncHandler(async (req, res, next) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'invalid id')
    }
    const findComment = await Comment.findById(commentId)

    if (!findComment) {
        throw new ApiError(400, 'comment not find')
    }
    req.comment = findComment
    next()
})

export {
    verifyComment
}