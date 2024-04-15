import { asyncHanlder } from "../utils/asynchandler.js";
import { ApiError } from "../utils/apiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloadinary } from "../utils/Cloundnary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import mongoose from "mongoose";



const generateAccessAndRefressToken = async (userId) => {
    try {

        const user = await User.findById(userId)


        const accessToken = user.generateAccessToken()

        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken


        //we used validateBeforSave because i donot want to check validation on user just like when save the user i want that password is requird so i assure database that everything is fine ,save the user
        await user.save({ validateBeforSave: false })

        return { accessToken, refreshToken };

    } catch (error) {
        throw new ApiError(500, "something went wrong when generating access and refress token")
    }
}

const registerUser = asyncHanlder(async (req, res) => {
    //get user details from frontend
    // validation - not empty
    //check if user already exists :username ,email
    //check for images ,check for avatar
    //upload them to cloudnary,avatar
    //create user object -creat entry in db
    // remove password and refresh token field from response 
    // check for user creation 
    // return res

    const { fullName, email, username, password } = req.body
    if ([fullName, email, username, password].some((field) => !field || field.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }
    const existUser = await User.findOne(
        { $or: [{ email }, { username }] }
    )

    if (existUser) {
        throw new ApiError(409, 'Email or Username already exist')
    }



    const avatarlocalPath = req.files?.avatar[0].path
    // const coverImagelocalPath = req.files?.coverImage[0].path

    let coverImagelocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImagelocalPath = req.files.coverImage[0].path;
    }

    if (!avatarlocalPath) {
        throw new ApiError(400, "Avatar is required")
    }


    const avatar = await uploadOnCloadinary(avatarlocalPath)
    const CoverImage = await uploadOnCloadinary(coverImagelocalPath)


    if (!avatar) {
        throw new ApiError(400, "Avatar is required")
    }

    const user = await User.create({
        fullName,
        avatar: avatar.url,
        CoverImage: CoverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })


    const creatUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!creatUser) {
        throw ApiError(500, "something went wrong while restring the user")
    }


    return res.status(201).json(
        new ApiResponse(200, creatUser, "user registered succenfully")
    )
})

const LoginUser = asyncHanlder(async (req, res) => {

    //get data from body 
    //find the user 
    //check password 
    // access and refresh token 
    //send cookie


    const { username, email, password } = req.body

    console.log(req.body)

    if (!username && !email) {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "user does not exist")
    }

    //for access the method which we make in user will be access by user not User 
    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credential ")
    }
    const { accessToken, refreshToken } = await generateAccessAndRefressToken(user._id)


    const LoggenInUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )


    //set cookies

    const options = {
        httpOnly: true,
        secure: true
    }



    return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refereshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: LoggenInUser, accessToken, refreshToken
                },
                "user logged in succesfully"
            )
        )



})

const LogOutUser = asyncHanlder(async (req, res) => {

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {

                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .clearCookie("refreshToken", options)
        .json(
            new ApiResponse(200, {}, "usser Logged OUt")
        )
})


const refreshAccessToken = asyncHanlder(async (req, res) => {
    const incommingRefreshToken = req.cookies.refreshToken || req.body.refreshToken

    if (!incommingRefreshToken) {
        throw new ApiError(401, "unauthorized request")
    }

    try {
        const decodedToken = jwt.verify(
            incommingRefreshToken,
            process.env.REFERESH_TOKEN_SECERET
        )

        const user = await User.findById(decodedToken?._id)

        if (!user) {
            throw new ApiError(401, "Invalid refresh token")
        }

        if (incommingRefreshToken !== user.refreshToken) {
            throw new ApiError(401, "refrersh token is expired or used")
        }

        const options = {
            httpOnly: true,
            secure: true
        }

        const { accessToken, NewrefreshToken } = await generateAccessAndRefressToken(user?._id)

        return res
            .status(200)
            .cookie("accessToken", accessToken, options)
            .cookie("refreshToken", NewrefreshToken, options)
            .json(
                new ApiResponse(
                    200,
                    { accessToken, refreshToken: NewrefreshToken },
                    "acess token refresed"
                )
            )
    } catch (error) {
        throw new ApiError(401, error.message || "invalid refresh token")
    }



})

const changeCurrentPassword = asyncHanlder(async (req, res) => {
    const { oldPassword, newPassword } = req.body

    const user = await User.findById(req.user?._id)

    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "invalid old password")
    }

    user.password = newPassword

    await user.save({ validateBeforSave: false })

    return res
        .status(200)
        .json(new ApiResponse(200, {}, "password changed successfully"))

})

const getCurrentUser = asyncHanlder(async (req, res) => {
    return res
        .status(200)
        .json(new ApiResponse(200, { user: req.user }, "user fetched successfully"))
})

const updateAccountDetails = asyncHanlder(async (req, res) => {
    const { fullName, email } = req.body

    if (!fullName && !password) {
        throw new ApiError(400, "all field are required")
    }
    const user = User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                fullName,
                email
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(new ApiResponse(200, user, "user updated successfully"))

})

const updateAvatar = asyncHanlder(async (req, res) => {

    const avatarlocalPath = req.file?.path
    if (!avatarlocalPath) {
        throw new ApiError(400, "avatar is required")
    }

    const avatar = await uploadOnCloadinary(avatarlocalPath)

    if (!avatar.url) {
        throw new ApiError(400, "error while uploading on avatar")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                avatar: avatar.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "avatarImgae update succefully")
        )
})

const updateCoverImage = asyncHanlder(async (req, res) => {

    const coverImgaelocalPath = req.file?.path
    if (!coverImgaelocalPath) {
        throw new ApiError(400, "coverImage is required")
    }

    const coverImage = await uploadOnCloadinary(coverImgaelocalPath)

    if (!coverImage.url) {
        throw new ApiError(400, "error while uploading on coverImage")
    }


    const user = await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set: {
                coverImage: coverImage.url
            }
        },
        {
            new: true
        }
    ).select("-password")

    return res
        .status(200)
        .json(
            new ApiResponse(200, user, "coverImgae update succefully")
        )
})

const getUserChannelprofile = asyncHanlder(async (req, res) => {

    const { username } = req.params

    if (!username.trim()) {
        throw new ApiError(400, "username is required")
    }

    const channel = await User.aggregate([
        {
            $match: {
                username: username?.toLowerCase
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "subscription",
                localField: "_id",
                foreignField: "subscriber",
                as: "subscriberdTo"
            }
        },

        {
            $addFields: {
                subscriberCount: {
                    $size: "$subscribers"
                },
                channelsubscribeToCount: {
                    $size: "$subscriberdTo"
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user?._id, "$subscribers.subscriber"] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscriberCount: 1,
                channelsubscribeToCount: 1,
                isSubscribed: 1,
                avatar: 1,
                coverImage: 1,
                email: 1

            }
        }


    ])

    if (!channel.length) {
        throw new ApiError(404, "channel does not exist")
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, channel[0], "User chanel fethched succesfully")
        )
})

const getWatchHistory = asyncHanlder(async (req, res) => {


    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: "video",
                localField: "watchHistory",
                foreignField: "_id",
                as: "watchHistory",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "owner",
                            foreignField: "_id",
                            as: "owner",
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
            }
        }
    ])

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                user[0].watchHistory,
                "watch History fethced succesfully"
            )
        )
})




export { registerUser, LoginUser, LogOutUser, refreshAccessToken ,changeCurrentPassword,
    getCurrentUser,updateAccountDetails,updateAvatar,updateCoverImage,getUserChannelprofile,
    getWatchHistory
}