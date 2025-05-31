import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from '../models/comment.model.js'
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

const createComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, 'content required')
    }
    const video = await Video.findById(req.video?._id)
    if (!video) {
        throw new ApiError(400, 'video not found')
    }
    const comment = await Comment.create({
        content,
        video,
        owner: req.user?._id
    })
    if (!comment) {
        throw new ApiError(400, 'comment not create')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                comment,
                'comment created'
            )
        )
})
const updateComment = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, 'content required')
    }


    if (req.user?._id.toString() !== req.comment?.owner.toString()) {
        throw new ApiError(400, 'you are not the owner of the comment')
    }
    const updatedComment = await Comment.findByIdAndUpdate(req.comment?._id, {
        $set: {
            content
        }
    },
        { new: true }
    )
    if (!updateComment) {
        throw new ApiError(400, 'comment not updated')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedComment,
                "comment updated"
            )
        )
})
const deleteComment = asyncHandler(async (req, res) => {
    const findVideo = await Comment.findById(req.comment?._id)
    if (req.user?._id.toString() !== req.comment?.owner.toString()) {
        throw new ApiError(400, 'you are not the owner of the comment')
    }

    if (!findVideo) {
        throw new ApiError(400, 'comment not found')
    }
    const deleteComment = await Comment.findByIdAndDelete(findVideo)
    if (!deleteComment) {
        throw new ApiError(400, 'comment not delete')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                'comment deleted'
            )
        )

})
const getAllVideoComment = asyncHandler(async (req, res) => {
    let { page = 1, limit = 10 } = req.query

    const findVideo = await Video.findById(req.video?._id)
    if (!findVideo) {
        throw new ApiError(400, 'video not fetched')
    }

    const option = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    }
    const comments = await Comment.aggregatePaginate([
        {
            $match : {video : new mongoose.Types.ObjectId(findVideo?._id)}
        },
        {
            $sort : { createdAt : -1}
        }
    ], option)
    if (!comments) {
        throw new ApiError(400, 'comment not found')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                comments,
                "comment fetched"
            )
        )
})

export {
    createComment,
    updateComment,
    deleteComment,
    getAllVideoComment,
}