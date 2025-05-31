import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { Tweet } from '../models/tweet.model.js'
import { isValidObjectId } from 'mongoose'

export const verifyTweet = asyncHandler(async (req, res, next) => {
    const { tweetId } = req.params
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "tweet id in not valid")
    }
    const findTweet = await Tweet.findById(tweetId)
    if (!findTweet) {
        throw new ApiError(400, 'tweet not Found')
    }
    req.tweet = findTweet
    next()
})

