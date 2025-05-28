import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from '../models/subscription.model.js'
import mongoose, { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channalId } = req.params
    console.log(channalId)
    if (!isValidObjectId(channalId)) {
        throw new ApiError(400, 'Subscriber not found')
    }

    if (req.user?._id.toString() === channalId?.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
    const isSubscribed = await Subscription.findOne({
        subscriber: req.user?._id,
        channal: channalId
    })
    if (isSubscribed) {
        await Subscription.findByIdAndDelete(isSubscribed?._id)
        return res.status(200)
            .json(
                new ApiResponse(200, { subscribed: false }, "Unsubscribed successfully")
            )
    }
    await Subscription.create({
        subscriber: req.user?._id,
        channal: channalId
    })
    return res.status(200)
        .json(
            new ApiResponse(200, { subscribed: true }, 'Subscribed successfully')
        )
})
const getUserChannalDetails = asyncHandler(async (req, res) => {
    const { channalId } = req.params

    if (!isValidObjectId(channalId)) {
        throw new ApiError(400, 'Channal user not found')
    }
    const subscribers = await Subscription.aggregate([
        {
            $match: { channal: new mongoose.Types.ObjectId(channalId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'subscriber',
                foreignField: '_id',
                as: 'subscriber',
                pipeline: [
                    {
                        $lookup: {
                            from: 'subscriptions',
                            localField: '_id',
                            foreignField: 'channal',
                            as: 'subscribedToSubscriber'
                        }
                    },
                    {
                        $addFields: {
                            subscribedToSubscriber: {
                                $cond: {
                                    if: { $in: [new mongoose.Types.ObjectId(channalId), "$subscribedToSubscriber.subscriber"] },
                                    then: true,
                                    else: false
                                }
                            },
                            subscriberCount: {
                                $size: '$subscribedToSubscriber'
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$subscriber'
        },
        {
            $project: {
                _id: 0,
                subscriber: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    "avatar.url": 1,
                    subscribedToSubscriber: 1,
                    subscriberCount: 1,
                },
            },
        },
    ])

    return res.status(200)
        .json(
            new ApiResponse(200, subscribers, 'subscribers Fetched')
        )
})
const getSubscribedChannals = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const channalSubscribed = await Subscription.aggregate([
        {
            $match: { subscriber: new mongoose.Types.ObjectId(subscriberId) }
        },
        {
            $lookup: {
                from: 'users',
                localField: 'channal',
                foreignField: '_id',
                as: 'subscribedChannal',
                pipeline: [
                    {
                        $lookup: {
                            from: 'videos',
                            localField: '_id',
                            foreignField: 'owner',
                            as: 'videos'
                        }
                    },
                    {
                        $addFields: {
                            latestVideo: {
                                $last: '$videos'
                            }
                        }
                    }
                ]
            }
        },
        {
            $unwind: '$subscribedChannal'
        },
        {
            $project: {
                _id: 0,
                subscribedChannel: {
                    _id: '$subscribedChannal._id',
                    username: '$subscribedChannal.username',
                    fullName: '$subscribedChannal.fullName',
                    avatarUrl: '$subscribedChannal.avatar',
                    latestVideo: {
                        _id: '$subscribedChannal.latestVideo._id',
                        videoUrl: '$subscribedChannal.latestVideo.video',
                        thumbnailUrl: '$subscribedChannal.latestVideo.thumbnail',
                        owner: '$subscribedChannal.latestVideo.owner',
                        title: '$subscribedChannal.latestVideo.title',
                        description: '$subscribedChannal.latestVideo.description',
                        duration: '$subscribedChannal.latestVideo.duration',
                        createdAt: '$subscribedChannal.latestVideo.createdAt',
                        views: '$subscribedChannal.latestVideo.views'
                    },
                },
            },
        },
    ])

    return res.status(200)
        .json(
            new ApiResponse(200, channalSubscribed, 'Subscribed Channal Fetched Successfully')
        )
})
export {
    toggleSubscription,
    getUserChannalDetails,
    getSubscribedChannals
}