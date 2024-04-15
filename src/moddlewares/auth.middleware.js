import { ApiError } from "../utils/apiError.js";
import { asyncHanlder } from "../utils/asynchandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHanlder(async (req, res, next) => {
    try {

        console.log(req.cookies?.accessToken)
        const token = req.cookies?.accessToken || (req.headers.authorization || "").replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "unathorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        console.log(decodedToken)
        const user = await User.findById(decodedToken?._id).select(
            "-password -refreshToken"
        )

        if (!user) {
            throw new ApiError(401, "nvalid access token")
        }
        req.user = user;
        next()
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token")
    }

})