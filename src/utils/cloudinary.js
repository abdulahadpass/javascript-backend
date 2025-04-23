import { v2 as cloudinary } from 'cloudinary'
import fs from 'fs'

const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(!localFilePath) return null
        // upload file on cloudinary
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type : 'auto'
        })
        // file has been uploaded
        console.log('File is uploaded', response.url)
        return response
    } catch (error) {
        fs.unlinkSync(localFilePath) // remove the file path from locally 
        return null
    }
}

export {uploadOnCloudinary}