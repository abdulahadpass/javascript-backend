import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Like } from '../models/like.model.js'
import mongoose, { isValidObjectId } from "mongoose";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, 'inValid video Id')
    }

    const alreadyLiked = await Like.findOne({
        video: videoId,
        likedBy: req.user?._id
    })

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLikeds: false },
                    'un liked'
                )
            )
    }
    await Like.create({
        video: videoId,
        likedBy: req.user?._id
    })
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                'liked video'
            )
        )
})
const toggleCommetLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, 'invalid id')
    }
    const alreadyLiked = await Like.findOne({
        comment: commentId,
        likedBy: req.user?._id
    })

    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "un liked"
                )
            )
    }
    await Like.create({
        comment: commentId,
        likedBy: req.user?._id
    })
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "un liked"
            )
        )

})
const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, 'invalid id')
    }
    const alreadyLiked = await Like.findOne({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    if (alreadyLiked) {
        await Like.findByIdAndDelete(alreadyLiked?._id)
        return res.status(200)
            .json(
                new ApiResponse(
                    200,
                    { isLiked: false },
                    "un liked"
                )
            )
    }
    await Like.create({
        tweet: tweetId,
        likedBy: req.user?._id
    })
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                { isLiked: true },
                "Like tweet"
            )
        )
})
const getLikedVideo = asyncHandler(async (req, res) => {
    const likedVideo = await Like.aggregate([
        {
            $match: { likedBy: new mongoose.Types.ObjectId(req.user?._id) }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'video',
                foreignField: '_id',
                as: 'LikedVideoDetails',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'ownerDetails'
                        }
                    },
                    {
                        $unwind: '$ownerDetails'
                    }
                ]
            }
        },
        {
            $unwind: '$LikedVideoDetails'
        },
        {
            $project: {
                _id: 0,
                LikedVideoDetails: {
                    id: 1,
                    "videoFile.url": 1,
                    "thumbnail.url": 1,
                    owner: 1,
                    title: 1,
                    description: 1,
                    views: 1,
                    duration: 1,
                    createdAt: 1,
                    isPublished: 1,
                    ownerDetails: {
                        _id: 1,
                        username: 1,
                        fullName: 1,
                        avatar: 1
                    }
                }
            }
        }
    ])
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                likedVideo,
                "liked videos fetched successfully"
            )
        );
})
export {
    toggleVideoLike,
    toggleCommetLike,
    toggleTweetLike,
    getLikedVideo,
}