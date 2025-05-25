import { Router } from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js';
import { toggleSubscription } from '../controllers/subscription.controller.js';
const router = Router()

router.route('/c/:channalId').post(verifyJwt, toggleSubscription)




export default router