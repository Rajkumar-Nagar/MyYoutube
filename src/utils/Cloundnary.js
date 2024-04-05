import { v2 as cloudinary } from "cloudinary"
import exp from "constants"

import fs from "fs"


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_NAME,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

const uploadOnCloadinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        //file has been uploaded 
        console.log("file has uploaded on cloudnary", response.url)
        return response
    } catch (error) {
        //remove the tempory saved file 
        fs.unlinkSync(localFilePath)
    }
}

export { uploadOnCloadinary }