import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {UploadOnCloudnary} from '../utils/Cloudnary.js'
import {ApiResponse} from '../utils/ApiResponse.js'

const registerUser=asyncHandler(async(req,res)=>{
   //get user details from frontend
   //validation -not empty
   // check if user already exists : username,email
   // check for images, check for avatar
   // upload them to cloudinary ,avatar
   // create user object -create entry in db
   // remove passowrd and refresh token field from responase 
   // check for user creation
   //return response
   const {fullname,email,username,password}=req.body
 console.log("email:",email);
//  if(fullname === ""){
//     throw new ApiError(400,"full name is required")
//  }
   if(
    [fullname,email,username,password].some((field)=> field?.trime() === ""
    )
   ){
      throw new ApiError(400,"All fields are required")
   }
  const existenUser= User.findOne({
    $or:[{username} , {email}]
   } //{email}
   )
   if(existenUser){
    throw new ApiError(409,"User with email or user name already exists")
   }

  const avatarLocalPath= req.files?.avatar[0]?.path;
 const coverImageLocalPath= req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
 }
 const avatar=await UploadOnCloudnary(avatarLocalPath);
 const coverImage= await UploadOnCloudnary(coverImageLocalPath);
  
 if(!avatar){
    throw new ApiError(400,"Avatar file is required");
 }
  const user=await User.create(
    {
        fullname,
        avatar: avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    }
 )

const createdUser= await User.findById(user._id).select(
    "-password -refreshToken"
)
if(!createdUser){
    throw new ApiError(500,"Something went wrong when user register");
}

return res.status(201).json(
    new ApiResponse(200,createdUser,"User registerd Successfully")
)

})

export {registerUser}