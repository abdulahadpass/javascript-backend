import { Router } from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js';
import { getSubscribedChannals, getUserChannalDetails, toggleSubscription } from '../controllers/subscription.controller.js';
const router = Router()

router.route('/c/:channalId').post(verifyJwt, toggleSubscription)
router.route('/c/:channalId').get(verifyJwt, getUserChannalDetails)
router.route('/u/:subscriberId').get(verifyJwt, getSubscribedChannals)




export default router