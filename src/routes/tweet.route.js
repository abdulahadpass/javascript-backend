import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { createTweet, updateTweet, removeTweet, getUserTweet } from '../controllers/tweet.controller.js'
import { verifyTweet } from '../middleware/tweet.middleware.js'

const router = express()

router.route('/create-tweet').post(verifyJwt, createTweet)
router.route('/update-tweet/:tweetId').patch(verifyJwt, verifyTweet, updateTweet)
router.route('/delete-tweet/:tweetId').post(verifyJwt, verifyTweet, removeTweet)
router.route('/getTweets/:userId').get(verifyJwt, getUserTweet)

export default router