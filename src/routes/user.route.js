import { Router } from 'express'
import { loginUser, logOutUser, refreshAccessToken, registerUser } from '../controllers/users.controller.js'
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
            maxCount : 1
        }
    ]),
    registerUser
);
router.route('/login').post(loginUser)

//secured route
router.route('/logout').post(verifyJwt, logOutUser)
router.route('/refresh-token').post(refreshAccessToken)

export default router