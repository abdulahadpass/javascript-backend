import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";
import mongoose, { isValidObjectId } from "mongoose";
import { Video } from "../models/video.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (
        [name, description].some((fields) => fields?.trim() === '')
    ) {
        throw new ApiError(400, 'field are required')
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user?._id
    })
    if (!playlist) {
        throw new ApiError(400, 'playlist not create')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                playlist,
                'playlist created'
            )
        )
})
const updatePlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    if (
        [name, description].some((fields) => fields.trim() === '')
    ) {
        throw new ApiError(400, 'fields required')
    }
    const findPlaylist = await Playlist.findById(req.playlist?._id)
    if (!findPlaylist) {
        throw new ApiError(400, 'playlist not found')
    }
    if (req.user?._id.toString() !== req.playlist?.owner.toString()) {
        throw new ApiError(400, 'you are not the owner of the video')
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(findPlaylist, {
        $set: {
            name,
            description,
        }
    }, {
        new: true
    })
    if (!updatePlaylist) {
        throw new ApiError(400, 'play list not found')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                'updated Successful'
            )

        )

})
const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, 'id invalid')
    }
    if (req.user?._id.toString() !== req.playlist?.owner.toString()) {
        throw new ApiError(400, 'you are not the owner of the video')
    }
    const deletePlaylist = await Playlist.findByIdAndDelete(playlistId)
    if (!deletePlaylist) {
        throw new ApiError(400, 'playlist not Deleted')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                {},
                'delete successfull'
            )
        )
})
const addVideoInPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.playlist?._id)
    const video = await Video.findById(req.video?._id)
    console.log(video);

    if (!playlist) {
        throw new ApiError(400, 'playlist not found')
    }
    if (!video) {
        throw new ApiError(400, 'video not found')
    }
    if (req.user._id.toString() !== req.playlist?.owner.toString() && req.video?.owner.toString()) {
        throw new ApiError(400, 'video not add tothe playlist')
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id,
        {
            $addToSet: {
                videos: video?._id
            }
        }, {
        new: true
    })
    if (!updatedPlaylist) {
        throw new ApiError(400, 'not add video in the playlist')
    }
    console.log(updatePlaylist);

    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                'video add successfully'
            )
        )
})
const removVideoFromPlaylist = asyncHandler(async (req, res) => {
    const playlist = await Playlist.findById(req.playlist?._id)
    const video = await Video.findById(req.video?._id)
    if (!playlist) {
        throw new ApiError(400, 'playlist not found')
    }
    if (!video) {
        throw new ApiError(400, 'video not found')
    }
    if (req.user._id.toString() !== req.playlist?.owner.toString() && req.video?.owner.toString()) {
        throw new ApiError(400, 'video not add tothe playlist')
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(playlist?._id,
        {
            $pull: {
                videos: video?._id
            }
        },
        {
            new: true
        }
    )
    if (!updatedPlaylist) {
        throw new ApiError(400, 'not updated')
    }
    return res.status(200)
        .json(
            new ApiResponse(
                200,
                updatedPlaylist,
                'updated successfully'
            )
        )
})
const getPlaylistById = asyncHandler(async (req, res) => {
    console.log(req.playlist)
    const playListVideo = await Playlist.aggregate([
        {
            $match : {_id : new mongoose.Types.ObjectId(req.playlist?._id)}
        },
        {
            $lookup : {
                from : 'videos',
                localField : 'videos',
                foreignField : '_id',
                as : 'videos'
            }
        },
        {
            $match : {
                "videos.isPublished" : true
            }
        },
        {
            $lookup : {
                from : 'users',
                localField : 'owner',
                foreignField : '_id',
                as : 'owner'
            }
        },
        {
            $addFields : {
                totalVideos : {
                    $size : '$videos' 
                },
                totalViews : {
                    $sum : '$videos.views'
                },
                owner : {
                    $first : '$owner'
                }
            }
        },
        {
            $project: {
                name: 1,
                description: 1,
                createdAt: 1,
                updatedAt: 1,
                totalVideos: 1,
                totalViews: 1,
                videos: {
                    _id: 1,
                    video: 1,
                    thumbnail: 1,
                    title: 1,
                    description: 1,
                    duration: 1,
                    createdAt: 1,
                    views: 1
                },
                owner: {
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        }
    ])
    console.log(playListVideo)
     return res
        .status(200)
        .json(new ApiResponse(200, playListVideo[0], "playlist fetched successfully"));
})
const getPlaylistUserId = asyncHandler(async(req, res)=>{
    const {userId} = req.params
    if(!isValidObjectId(userId)){
        throw new ApiError(400, 'invalid id')
    }
    const userPlaylist = await Playlist.aggregate([
        {
            $match : {
                owner : new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup : {
                from : 'videos',
                localField : 'videos',
                foreignField : '_id',
                as : 'videos'
            }
        },
        {
            $addFields: {
                totalVideo : {
                    $size : '$videos'
                },
                totalViews : {
                    $sum : '$videos.views'
                }
            }
        },
        {
            $project  : {
                _id : 1,
                name : 1,
                description : 1,
                totalVideo : 1,
                totalViews :1,
                updatedAt : 1
            }
        }
    ])
    return res.status(200)
    .json(
        new ApiResponse(
            200,
            userPlaylist,
            'user playList fetched'
        )
    )
})
export {
    createPlaylist,
    updatePlaylist,
    deletePlaylist,
    addVideoInPlaylist,
    removVideoFromPlaylist,
    getPlaylistById,
    getPlaylistUserId,
}