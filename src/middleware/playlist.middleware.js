import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { isValidObjectId } from "mongoose";
import { Playlist } from "../models/playlist.model.js";

const verifyPlaylist = asyncHandler(async (req, res, next) => {
    const { playlistId } = req.params
    
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'invalid id')
    }
    const findPlaylist = await Playlist.findById(playlistId)

    if (!findPlaylist) {
        throw new ApiError(400, 'playlist not find')
    }
    req.playlist = findPlaylist
    next()
})

export {
    verifyPlaylist
}