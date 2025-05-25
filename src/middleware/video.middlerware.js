import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

export const verifyVideo = asyncHandler(async (req, res, next) => {
    try {
        const { videoId } = req.params
        const findVideo = await Video.findById(videoId)
        if (!findVideo) {
            throw new ApiError(400, 'Video not Found')
        }
        const video = await Video.aggregate([
            {
                $match: { _id: new mongoose.Types.ObjectId(findVideo._id) }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: "owner",
                    foreignField: '_id',
                    as: 'owner',
                    pipeline: [
                        {
                            $lookup: {
                                from: 'subscriptions',
                                localField: '_id',
                                foreignField: 'channal',
                                as: 'subscribers'
                            },
                        },

                        {
                            $addFields: {
                                subscriberCount: {
                                    $size: '$subscribers'
                                },
                                isSubscribed: {
                                    $cond: {
                                        if: { $in: [req.user?._id, '$subscribers.subscriber'] },
                                        then: true,
                                        else: false
                                    }
                                }

                            }
                        },
                        {
                            $project: {
                                fullName: 1,
                                username: 1,
                                avatar: 1,
                                subscriberCount: 1,
                                isSubscribed: 1
                            }
                        }
                    ]
                }
            },
            {
                $addFields: {
                    owner: {
                        $first: "$owner"
                    }
                }
            },
            {
                $project: {
                    title: 1,
                    description: 1,
                    thumbnail: 1,
                    video: 1,
                    duration: 1,
                    owner: {
                        _id: '$owner._id',
                        fullName: '$owner.fullName',
                        email: "$owner.email",
                        username: "$owner.username",
                        avatar: "$owner.avatar",
                        subscriberCount: "$owner.subscriberCount"
                    },
                    views: 1,
                    watchHistory: 1
                }
            }
        ])
        req.video = video[0]
        next()
    } catch (error) {
        throw new ApiError(401, error.message, "you are not the owner of the current video")
    }
})