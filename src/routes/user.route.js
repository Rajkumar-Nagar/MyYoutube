import { Router } from "express";
import multer from "multer";
import { LogOutUser, LoginUser, registerUser,refreshAccessToken, changeCurrentPassword, getCurrentUser, updateAccountDetails, updateAvatar, updateCoverImage, getUserChannelprofile, getWatchHistory } from "../controllers/user.controller.js";
import { uploadOnCloadinary } from "../utils/Cloundnary.js"
import { upload } from '../moddlewares/multer.middleware.js'
import { verifyJWT } from "../moddlewares/auth.middleware.js";
const router = Router()



// console.log(upload)

router.route("/register").post(

    upload.fields([
        {
            name: "avatar",
            maxCount: 1
        },
        {
            name: "coverImage",
            maxCount: 1
        }
    ]),
    registerUser
)
router.route("/Login").post(LoginUser)

//secure routes 

router.route("/logout").post(verifyJWT, LogOutUser)

router.route("/refreshtoken").post(refreshAccessToken)

router.route("/change-password").post(verifyJWT,changeCurrentPassword)

router.route("/current-user").get(verifyJWT,getCurrentUser)

router.route("/update-account").patch(verifyJWT,updateAccountDetails)

router.route("/avatar").patch(verifyJWT,upload.single("avatar"),updateAvatar)

router.route("/cover-image").patch(verifyJWT,upload.single("/coverImage"),updateCoverImage)

router.route("/c/:username").get(verifyJWT,getUserChannelprofile)
router.route("/history").get(verifyJWT,getWatchHistory)

export default router