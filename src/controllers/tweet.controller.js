import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, 'content must be required')
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    })

    if (!tweet) {
        throw new ApiError(400, 'failed to create tweet')
    }
    return res.status(200)
        .json(
            new ApiResponse(200, tweet, 'Tweet created Successfully')
        )
})
const removeTweet = asyncHandler(async (req, res) => {
    if(req.user?._id !== req.tweet?.owner?._id){
        throw new ApiError(400, 'you are not the owner of tha tweet')
    }
    const dltTweet = await Tweet.findByIdAndDelete(req.tweet?._id)
    if (!dltTweet) {
        throw new ApiError(400, 'tweet not deleted')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                'tweet delete successfullt'
            )
        )
})
const updateTweet = asyncHandler(async (req, res) => {
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, 'content is required')
    }
     if(req.user?._id !== req.tweet?.owner?._id){
        throw new ApiError(400, 'you are not the owner of tha tweet')
    }

    const tweet = await Tweet.findByIdAndUpdate(req.tweet?._id,
        {
            content
        },
        {
            new: true
        }
    )

    if (!tweet) {
        throw new ApiError(400, 'twwet not update')
    }
    return res.status(200)
        .json(
            new ApiResponse(200, tweet, 'Tweet Updated Successfully')
        )
})
const getUserTweet = asyncHandler(async (req, res) => {
    const { userId } = req.params

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, 'User id not valid')
    }
    const tweet = await Tweet.aggregate([
        {
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerTweets',
                pipeline: [
                    {
                        $project: {
                            username: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $lookup: {
                from: 'likes',
                localField: '_id',
                foreignField: 'tweet',
                as: 'likeDetails',
                pipeline: [
                    {
                        $project: {
                            likedBy: 1,
                        }
                    }
                ]
            }
        },
        {
            $addFields: {
                likeCount: {
                    $size: '$likeDetails'
                },
                ownerTweets: {
                    $first: "$ownerTweets",
                },
                isLiked: {
                    $cond: {
                        if: { $in: [req.user?._id, "$likeDetails.likedBy"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $sort: {
                createdAt: -1
            }
        },
        {
            $project: {
                content: 1,
                ownerTweets: 1,
                likesCount: 1,
                createdAt: 1,
                isLiked: 1
            }
        }
    ])
    return res
        .status(200)
        .json(new ApiResponse(200, tweet, "Tweets fetched successfully"));
})

export {
    createTweet,
    removeTweet,
    updateTweet,
    getUserTweet
}