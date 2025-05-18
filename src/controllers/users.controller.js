import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { deleteOncloudinary, uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import { Types } from 'mongoose'

const generateAccessTokenAndRefreshToken = async (userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    }
    catch (error) {
        throw new ApiError(500, 'Something wents wrong while generating access and refresh token')
    }
}
const registerUser = asyncHandler(async (req, res) => {
    // get user detail from frontend
    // validation
    // check user already exist 
    // check for img , check for avatar
    // upload on cloudinary, avatar
    // create a user with object 
    // check the user
    // remove password and refreshToken
    // check user Creation
    // return res

    const { username, fullName, email, password } = req.body // get user detail
    console.log("username: ", username, "password: ", password)

    //// validation
    if (
        [fullName, username, email, password].some((fields) => fields?.trim() === "")
    ) {
        throw new ApiError(400, "All Fields are required")
    }
    // check user already exist 
    const existedUser = await User.findOne({
        $or: [{ username, email }]
    }
    )
    if (existedUser) {
        throw new ApiError(409, 'User Already Existed')
    }
    // check for img , check for avatar
    const avatarLocalPath = req.files?.avatar[0]?.path;

    let coveredImageLocalPath;
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coveredImageLocalPath = req.files.coverImage[0].path;
    }


    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required')
    }
    // upload on cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coveredImageLocalPath)
    console.log(avatar.public_id);
    // console.log(coverImage)

    if (!avatar) {
        throw new ApiError(400, 'Avatar is required')
    }
    // create user
    const user = await User.create({
        fullName,
        username: username.toLowerCase(),
        email,
        password,
        avatar: avatar.url,
        coverImage: coverImage?.url || ""
    })
    //remove password and refreshToken
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    // check user created
    if (!createdUser) {
        throw new ApiError(500, 'Something Wents wrong while creating a user')
    }
    // return res
    return res.status(201).json(
        new ApiResponse(201, createdUser, 'User Registered Successfully')
    )

})
const loginUser = asyncHandler(async (req, res) => {
    // user detail -> req.body
    // login on emial or username
    // find user
    // check password
    // send access or rehreshToken
    // send cookies

    const { username, email, password } = req.body
    console.log(email, password)
    if (
        ![username, email].some((field) => field?.trim())
    ) {
        throw new ApiError(400, "username or email is not found")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, 'User nor Found')
    }

    const isPasswordValid = await user.isCorrectedPassword(password)
    console.log(isPasswordValid)
    if (!isPasswordValid) {
        throw new ApiError(404, 'Invalid user credential')
    }

    const { accessToken, refreshToken } = await generateAccessTokenAndRefreshToken(user._id)


    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

    const option = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, option)
        .cookie("refreshToken", refreshToken, option)
        .json(
            new ApiResponse(200, {
                user: loggedInUser,
                accessToken,
                refreshToken
            }),
            "User loggedIn successfully "
        )


})
const logOutUser = asyncHandler(async (req, res) => {
    await User.findByIdAndUpdate(req.user?._id,
        {
            $set: { refreshToken: undefined }
        },
        {
            new: true
        }
    )
    const option = {
        httpOnly: true,
        secure: true
    }
    res.status(200)
        .clearCookie('accessToken', option)
        .clearCookie('refreshToken', option)
        .json(
            new ApiResponse(200, {}, 'User Logged Out')
        )
})
const refreshAccessToken = asyncHandler(async (req, res) => {
    const incomingToken = req.cookies.refreshToken || req.body.refreshToken
    if (!incomingToken) {
        throw new ApiError(401, 'Unauthorize requesst')
    }

    try {
        const decodedToken = jwt.verify(incomingToken, process.env.REFRESH_TOKEN_SECRET)

        const user = await User.findById(decodedToken._id)

        if (!user) {
            throw new Error(401, "unauthorize request")
        }

        if (incomingToken !== user?.refreshToken) {
            throw new ApiError(401, 'Refresh Token is expired or used')
        }

        const { accessToken, newRefreshToken } = await generateAccessTokenAndRefreshToken(user._id)

        const option = {
            httpOnly: true,
            secure: true,
        }

        res.status(200)
            .cookie("accessToken", accessToken, option)
            .cookie("refreshToken", newRefreshToken, option)
            .json(
                new ApiResponse(200, { accessToken, refreshToken: newRefreshToken, }, "Access Token Refreshed")
            )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid Refresh Token")
    }
})
const changePassword = asyncHandler(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordValid = await user.isCorrectedPassword(oldPassword)
    if (!isPasswordValid) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({ validateBeforeSave: false })

    return res.status(200)
        .json(new ApiResponse(200, {}, "Password Change Successfully"))
})
const getCurrentUser = asyncHandler(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, req.user, "Current User Fetch Successfully"))
})
const updateAccountDetail = asyncHandler(async (req, res) => {
    const { fullName, email } = req.body

    if (
        [fullName, email].some((fields) => fields?.trim() === '')
    ) {
        throw new ApiError(400, "All Fields are Required")
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        { new: true }
    ).select('-password')

    return res
        .status(200)
        .json(new ApiResponse(200, user, "Account Detail Updated"))
})
const updateAvatarFile = asyncHandler(async (req, res) => {
    const avatarLocalPath = req.file?.path
    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is missing")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if (avatar.url) {
        throw new ApiError(400, "Avatar Url is not found")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            avatar: avatar.url
        },
        { new: true }
    ).select('-password')
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Avatar Updated Successfully"))
})
const updateCoverImageFile = asyncHandler(async (req, res) => {
    const coverImageLocalPath = req.file?.path
    if (!coverImageLocalPath) {
        throw new ApiError(400, "Cover Image file is missing")
    }
    const coverImage = await uploadOnCloudinary(avatarLocalPath)
    if (coverImage.url) {
        throw new ApiError(400, "Cover Image Url is not found")
    }
    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            coverImage: coverImage.url
        },
        { new: true }
    ).select('-password')

    return res
        .status(200)
        .json(new ApiResponse(200, user, "coverImage Updated Successfully"))
})
const getChannalDetail = asyncHandler(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        throw new ApiError(400, 'User is missing')
    }

    const channal = await User.aggregate([
        {
            $match: { uaername: username?.toLowerCase() }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: "_id",
                foreignField: "channal",
                as: 'subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: "_id",
                foreignField: "subscriber",
                as: 'subscribedTo'
            }
        },
        {
            $addFields: {
                subscriberCount: {
                    $size: 'subscribers'
                },
                channelToSubscriberCount: {
                    $size: 'subscribedTo'
                },
                $cond: {
                    if: { $in: [req.user?._id, 'subscribers.subscriber'] },
                    then: true,
                    else: false
                }
            }
        },
        {
            $project: {
                subscribers: 0,
                subscribedTo: 0,
            },
            $project: {
                _id: 1,
                username: 1,
                fullName: 1,
                email: 1,
                avatar: 1,
                coverImage: 1,
                subscriberCount: 1,
                channelToSubscriberCount: 1,
                isSubscribed: 1
            }
        },
    ])
    if (!channal?.length) {
        throw new ApiError(404, 'Channal not Found')
    }
    return res.status(200)
        .json(new ApiResponse(200, channal[0], 'Channal Detail Fetched Successfully'))
})
const getWatchHistory = asyncHandler(async (req, res) => {
    if (!Types.ObjectId.isValid(req.user?._id)) {
        return res.status(400).json({ message: 'Invalid user ID' });
    }
    const user = await User.aggregate([
        {
            $match: { _id: new Types.ObjectId(req.user?._id) }
        },
        {
            $lookup: {
                from: "videos",
                localField: "watchHistory",
                foreignField: "_id",
                as: "history",
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        fullName: 1,
                                        username: 1,
                                        avatar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: "$owner"
                            }
                        }
                    }
                ]
            },
        },

    ])
    return res.status(200)
        .json(new ApiResponse(200, user[0].history, "Watch history fetched successfully"))
})


export {
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    changePassword,
    getCurrentUser,
    updateAccountDetail,
    updateAvatarFile,
    updateCoverImageFile,
    getChannalDetail,
    getWatchHistory,
}