import Router from 'express'
import { verifyJwt } from '../middleware/auth.middleware.js'
import { createPlaylist, updatePlaylist, deletePlaylist, addVideoInPlaylist, removVideoFromPlaylist, getPlaylistById, getPlaylistUserId } from '../controllers/playlist.controller.js'
import { verifyPlaylist } from '../middleware/playlist.middleware.js'
import { verifyVideo } from '../middleware/video.middlerware.js'

const router = Router()
router.route('/create-playlist').post(verifyJwt, createPlaylist)
router.route('/update-playlist/:playlistId').patch(verifyJwt, verifyPlaylist, updatePlaylist)
router.route('/delete-playlist/:playlistId').post(verifyJwt, verifyPlaylist, deletePlaylist)
router.route('/add-video/:playlistId/:videoId').post(verifyJwt, verifyPlaylist, verifyVideo, addVideoInPlaylist)
router.route('/remove-video/:playlistId/:videoId').post(verifyJwt, verifyPlaylist, verifyVideo, removVideoFromPlaylist)
router.route('/getPlaylist-video/:playlistId').get(verifyPlaylist, getPlaylistById)
router.route('/user/:userId').get(getPlaylistUserId)

export default router