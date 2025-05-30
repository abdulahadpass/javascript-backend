import express from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { toggleCommetLike, toggleTweetLike, toggleVideoLike, getLikedVideo } from '../controllers/like.controller.js'

const router = express.Router()

router.route('/video-like/:videoId').post(verifyJwt, toggleVideoLike)
router.route('/tweet-like/:tweetId').post(verifyJwt, toggleTweetLike)
router.route('/comment-like/:commentId').post(verifyJwt, toggleCommetLike)
router.route('/get-likedVideo').get(verifyJwt, getLikedVideo)

export default router