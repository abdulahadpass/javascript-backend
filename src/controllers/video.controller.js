import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import { deleteOncloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.model.js";
import { v2 as cloudinary } from 'cloudinary'
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
const getAllVideo = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query;

    const pipeline = [];

    // Text Search
    if (query) {
        pipeline.push({
            $search: {
                index: "search-video",
                text: {
                    query: query,
                    path: ["title", "description"]
                }
            }
        });
    }

    // Filter by User ID
    if (userId) {
        pipeline.push({
            $match: { owner: new mongoose.Types.ObjectId(userId) }
        });
    }

    // Only published videos
    pipeline.push({
        $match: { isPublished: true }
    });

    // Sorting
    if (sortBy && sortType) {
        pipeline.push({
            $sort: {
                [sortBy]: sortType === 'asc' ? 1 : -1
            }
        });
    } else {
        pipeline.push({
            $sort: { createdAt: -1 }
        });
    }

    // Join with user collection
    pipeline.push(
        {
            $lookup: {
                from: 'users',
                localField: 'owner',
                foreignField: '_id',
                as: 'ownerDetail'
            }
        },
        { $unwind: "$ownerDetail" },
        {
            $addFields: {
                owner: {
                    _id: "$ownerDetail._id",
                    username: "$ownerDetail.username",
                    avatar: "$ownerDetail.avatar"
                }
            }
        },
        {
            $project: {
                ownerDetail: 0 // Remove the temporary field
            }
        }
    );

    const videoAggregate = Video.aggregate(pipeline);

    const options = {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10)
    };

    const video = await Video.aggregatePaginate(videoAggregate, options);

    return res
        .status(200)
        .json(new ApiResponse(200, video, "Videos fetched successfully"));
});

const createUserVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    console.log(title)
    if (
        [title, description].some((field) => field?.trim() === '')
    ) {
        throw new ApiError('All fields are required', 400)
    }
    const uploadThumbnail = req.files?.thumbnail[0]?.path
    const uploadVideo = req.files?.video[0]?.path
    if (
        [uploadThumbnail, uploadVideo].some((field) => field?.trim() === '')
    ) {
        throw new ApiError('All fields are required', 400)
    }

    const uploadThumbnailOnCloudinary = await uploadOnCloudinary(uploadThumbnail)
    const uploadVideoOnCloudinary = await uploadOnCloudinary(uploadVideo)

    const video = await Video.create({
        title,
        description,
        thumbnail: uploadThumbnailOnCloudinary.url,
        video: uploadVideoOnCloudinary.url,
        duration: uploadVideoOnCloudinary.duration,
        owner: req.user?._id
    })
    if (!video) {
        throw new ApiError('Video not created', 500)
    }
    return res.status(201)
        .json(
            new ApiResponse(201, video, 'Video created successfully')
        )
})
const getVideo = asyncHandler(async (req, res) => {
    console.log("video req", req.video)
    console.log(req.user)
    await Video.findByIdAndUpdate(req.video?._id, {
        $inc: {
            views: 1
        }
    },
    )
    await User.findByIdAndUpdate(req.user?._id, {
        $addToSet: {
            watchHistory: req.video?._id
        }
    },
    )
    return res.status(200)
        .json(
            new ApiResponse(200, req.video, 'Video fetched successfully')
        )
})
const updatedUserVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (
        [title, description].some((fields) => fields.trim() === '')
    ) {
        throw new ApiError(400, 'Field are Required')
    }

    const findVideo = await Video.findById(req.video?._id)
    if (findVideo.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, 'You are not the owner of the video')
    }
    if (findVideo?.thumbnail) {
        const public_id = findVideo.thumbnail.split('/').pop().split('.')[0]
        if (public_id) {
            await deleteOncloudinary(public_id)
        }
    }
    const thumbnail = req.file?.path
    if (!thumbnail) {
        throw new ApiError(400, 'thumbnail is required')
    }
    const uploadthumbnail = await uploadOnCloudinary(thumbnail)
    if (!uploadthumbnail.url) {
        throw new ApiError(400, 'thumbnail url is not found')
    }

    const updatedVideo = await Video.findByIdAndUpdate(req.video?._id,
        {
            title,
            description,
            thumbnail: uploadthumbnail.url
        },
        {
            new: true
        }
    )
    if (!updatedVideo) {
        throw new ApiError(400, 'video not updated')
    }

    return res.status(200)
        .json(
            new ApiResponse(200, updatedVideo, 'Video Updated Successfully')
        )
})
const deleteUserVideo = asyncHandler(async (req, res) => {
    const findVideo = await Video.findById(req.video?._id)
    if (findVideo.owner?._id.toString() !== req.user?._id.toString()) {
        throw new ApiError(400, 'You are not the owner of the video')
    }
    if (!findVideo) {
        throw new ApiError(400, "Video not Found")
    }
    if (findVideo.video) {
        const public_id = findVideo?.video.split('/').pop().split('.')[0]
        if (public_id) {
            await deleteOncloudinary(public_id)
        }
    }
    if (findVideo?.thumbnail) {
        const public_id = findVideo?.thumbnail.split('/').pop().split('.')[0]
        if (public_id) {
            await deleteOncloudinary(public_id)
        }
    }
    const deletedVideo = await Video.findByIdAndDelete(req.video?._id)
    if (!deletedVideo) {
        throw new ApiError(400, 'video not deleted')
    }
    return res.status(200)
        .json(
            new ApiResponse(200, deletedVideo, "Video deleted successfully")
        )
})


export {
    getAllVideo,
    createUserVideo,
    getVideo,
    updatedUserVideo,
    deleteUserVideo,
}