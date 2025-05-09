import { Router } from 'express'
import { changePassword, getChannalDetail, getCurrentUser, getWatchHistory, loginUser, logOutUser, refreshAccessToken, registerUser, updateAccountDetail, updateAvatarFile, updateCoverImageFile } from '../controllers/users.controller.js'
import { upload } from '../middleware/multer.middleware.js'
import { verifyJwt } from '../middleware/auth.middleware.js';
const router = Router()

router.route('/register').post(
    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
);
router.route('/login').post(loginUser)

//secured route
router.route('/logout').post(verifyJwt, logOutUser)
router.route('/refresh-token').post(refreshAccessToken)
router.route('/change-password').post(verifyJwt, changePassword)
router.route('/current-user').get(verifyJwt, getCurrentUser)
router.route('/update-account').patch(verifyJwt, updateAccountDetail)
router.route('/avatar').patch(verifyJwt, upload.single("avatar"), updateAvatarFile)
router.route('/cover-image').patch(verifyJwt, upload.single('coverImage'), updateCoverImageFile)
router.route('/c/:username').get(verifyJwt, getChannalDetail)
router.route('/history').get(verifyJwt, getWatchHistory)

export default router