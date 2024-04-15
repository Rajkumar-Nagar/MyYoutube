import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

          
cloudinary.config({ 
  cloud_name: 'de12ytbyw', 
  api_key: '871873583987298', 
  api_secret: '5SQ5GCJbWCO0QlLvvuJn0RxKNz8' 
});

const uploadOnCloadinary = async (localFilePath) => {

    try {
        if (!localFilePath) throw new Error("No file provided");

        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto" // Adjust resource type if needed
        });

        console.log("File uploaded successfully:", response.url);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file

        return response;
    } catch (error) {
        console.error("Error uploading file to Cloudinary:", error);
        fs.unlinkSync(localFilePath); // Remove the locally saved temporary file on error
        return null;
    }
};

export { uploadOnCloadinary };
