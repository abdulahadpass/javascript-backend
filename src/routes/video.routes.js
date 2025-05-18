import { Router } from "express";
import { verifyJwt } from "../middleware/auth.middleware.js"
import { createUserVideo, deleteUserVideo, getAllVideo, getVideo, updatedUserVideo } from "../controllers/video.controller.js";
import { upload } from "../middleware/multer.middleware.js";
import { verifyVideo } from "../middleware/video.middlerware.js";
const router = Router()
router.route('/').get(verifyJwt, getAllVideo)
router.route('/create-video').post(verifyJwt, upload.fields([
    {
        name: "thumbnail",
        maxCount: 1
    },
    {
        name: "video",
        maxCount: 1
    }
]), createUserVideo)
router.route('/update-video/:videoId').post(verifyJwt, verifyVideo, upload.single('thumbnail'), updatedUserVideo)
router.route('/delete-video/:videoId').post(verifyJwt, verifyVideo, deleteUserVideo)
router.route('/getVideo/:videoId').get(verifyJwt, verifyVideo, getVideo)
export default router