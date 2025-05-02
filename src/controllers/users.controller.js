import { asyncHandler } from '../utils/asyncHandler.js'
import { ApiError } from '../utils/ApiError.js'
import { User } from '../models/user.model.js'
import { uploadOnCloudinary } from '../utils/cloudinary.js'
import { ApiResponse } from '../utils/ApiResponse.js'

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
        throw new ApiError(400, "All Feilds are required")
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

    console.log(avatarLocalPath)

    if (!avatarLocalPath) {
        throw new ApiError(400, 'Avatar is required')
    }
    // upload on cloudinary, avatar
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coveredImageLocalPath)
    // console.log(avatar);
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

    const isPasswordValid = await user.isPasswordCorrected(password)

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
    await User.findByIdAndUpdate(req.user._id,
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

export {
    registerUser,
    loginUser,
    logOutUser,
}