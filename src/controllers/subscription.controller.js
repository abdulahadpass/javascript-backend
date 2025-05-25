import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Subscription } from '../models/subscription.model.js'
import { isValidObjectId } from "mongoose";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channalId } = req.params
    console.log(channalId)
    if (!isValidObjectId(channalId)) {
        throw new ApiError(400, 'Subscriber not found')
    }

    if (req.user?._id.toString() === channalId?.toString()) {
        throw new ApiError(400, "You cannot subscribe to your own channel");
    }
    console.log(req.user?._id, channalId?._id)
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

export {
    toggleSubscription
}