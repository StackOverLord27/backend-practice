import {v2 as cloudinary} from "cloudinary";
import { log } from "console";
import fs from "fs";

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET
});


const uploadFiles= async(localFilePath) => {
    try{
        if(!localFilePath) return "File path not found";

        const response= await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        })
        console.log("File has been uploaded succesfully", response.url);
        return response;
    } catch(error){
        fs.unlinkSync(localFilePath) //remove the locally saved temp file as the upload got failed.
        return null;
    }
}

export {uploadFiles}