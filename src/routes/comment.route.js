import { Router } from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { verifyVideo } from '../middleware/video.middlerware.js'
import { createComment, deleteComment, getAllVideoComment, updateComment } from '../controllers/comment.controller.js'
import { verifyComment } from '../middleware/comment.middleware.js'

const router = Router()

router.route('/create-comment/:videoId').post(verifyJwt, verifyVideo, createComment)
router.route('/update-comment/:commentId').patch(verifyJwt, verifyComment, updateComment)
router.route('/delete-comment/:commentId').post(verifyJwt, verifyComment, deleteComment)
router.route('/getVideoComment/:videoId').get(verifyJwt, verifyVideo, getAllVideoComment)

export default router