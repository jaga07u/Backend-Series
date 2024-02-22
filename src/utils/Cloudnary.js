import {v2 as cloudinary} from 'cloudinary';
import fs from 'fs'     
cloudinary.config({ 
  cloud_name: process.env.CLOUDNARY_CLOUD_NAME, 
  api_key: process.env.CLOUDNARY_API_KEY, 
  api_secret:process.env.CLOUDNARY_API_SECRET 
});
const UploadOnCloudnary=async (localFilePath)=>{
            try {
                if(!localFilePath) return null;
                //upload the file on cloudnary
                const respnse=await cloudinary.uploader.upload(localFilePath, {
                    resource_type:"auto"
                })
                //file has been uploaded successfull
               // console.log("File is uploaded on cloudinary",respnse.url);
               fs.unlinkSync(localFilePath);
                return respnse;
            } catch (error) {
                fs.unlinkSync(localFilePath) //remove the locally 
                //saved temporary file
                // as the uploaded operation got failed
                return null
            }
}

// cloudinary.v2.uploader.upload("https://upload.wikimedia.org/wikipedia/commons/a/ae/Olympic_flag.jpg",
//   { public_id: "olympic_flag" }, 
//   function(error, result) {console.log(result); });


  export {UploadOnCloudnary}