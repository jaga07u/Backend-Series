import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {UploadOnCloudnary} from '../utils/Cloudnary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'



const generateAccessAndRefreshTokens=async(userId)=>{
   try {
      const user=await User.findById(userId);
     const accessToken= user.generateAccessToken()
     const refreshToken= user.generateRefreshToken()

     user.refreshToken=refreshToken
     await user.save({validateBeforeSave:false});

     return {accessToken,refreshToken};
      
   } catch (error) {
      throw new ApiError(500,"Something went wrong while generating refresh and access token")
   }
}
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
    [fullname,email,username,password].some((field)=> field?.trim() === ""
    )
   ){
      throw new ApiError(400,"All fields are required")
   }
  const existenUser= await User.findOne({
    $or:[{username} , {email}]
   } //{email}
   )
   
   if(existenUser){
    throw new ApiError(409,"User with email or user name already exists")
   }
     console.log(req.files);
const avatarLocalPath= req.files?.avatar[0]?.path;
const coverImageLocalPath= req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
 }
 const avatar=await UploadOnCloudnary(avatarLocalPath);
 const coverImage= await UploadOnCloudnary(coverImageLocalPath);
  
 if(!avatar){
    throw new ApiError(400,"avatar file is required");
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

const loginUser=asyncHandler(async(req,res)=>{
    //1.req body->data
    //2.username or email
    //3.find the user
    //4.password check
    //5. access and refresh token
   //6.send cookie
   //7.res

   const {email,username,password}=req.body;

   //console.log(email);

   if(!(username || email)){
      throw new ApiError(400,"Username or email is required");
   }
    const user= await User.findOne({
      $or:[{username},{email}]
     });

   if(!user){
      throw new ApiError(400,"User does not exist");
   }

   const isPasswordValid=await user.isPasswordCorrect(password);

   if(!isPasswordValid){
      throw new ApiError(401,"password incorrect");
   }

  const {accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);
      
  const LoggedInUser=await User.findById(user._id).select("-password -refreshToken")

const options={
   httpOnly:true,
   secure:true,
}
      return res
      .status(200)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",refreshToken,options)
      .json(
         new ApiResponse(200,{
            user:LoggedInUser,accessToken,refreshToken
         },"User logged in Successfullu")
      )

})

const logoutUser=asyncHandler(async(req,res)=>{
   await User.findByIdAndUpdate(
      req.user._id,
      {
         $set:{
            refreshToken:undefined
         }
      }
   ) 
   const options={
      httpOnly:true,
      secure:true,
   }
   return res.status(200)
   .clearCookie("accessToken",options)
   .clearCookie("refreshToken",options)
   .json(new ApiResponse(200,{},"user logged out successfully"));    
})

const refreshAccessToken=asyncHandler(async(req,res)=>{
  const incomingRefresToken= req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefresToken) {
        throw new ApiError(401,"unauthorized request");
  }

 try {
   const decodedToken= jwt.verify(
     incomingRefresToken,process.env.REFRESH_TOKEN_SECRET
    );
  
   const user= await User.findById(decodedToken?._id);
  
  if (!user) {
          throw new ApiError(401,"Invalid refresh token");
    }
  
  
    if(incomingRefresToken !== user?.refreshToken){
     throw new ApiError(401,"Refresh token is expired or used");
    }
  
    const options={
     httpOnly:true,
     secure:true,
    }
   const {accessToken,newrefreshToken}= await generateAccessAndRefreshTokens(user._id);
  
    return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",newrefreshToken,options)
    .json(
     new ApiResponse(200,
        {accessToken, refreshToken:newrefreshToken},"Access token refreshed"
        )
    )
    //seting
  
 } catch (error) {
   throw new ApiError(401,error?.message || "Invalid refresh token");
 }
  
})

const changeCurrentPassword=asyncHandler(async(req,res)=>{
   const {oldpassword,newPassword}=req.body
   const user=User.findById(req.user?._id);
  const isPasswordCorrect=await user.isPasswordCorrect(oldpassword);
  if(isPasswordCorrect){
   throw new ApiError(400,"Invalid old password");
  }

  user.password=newPassword;
  await user.save({validateBeforeSave:false})

  return res
  .status(200)
  .json(new ApiResponse(200,{},"Password changed successfully"))
})
const getCurrentUser=asyncHandler(async(req,res)=>{
   return res
   .status(200)
   .json(200,req.user,"current user fetched successfully");
})
const updateAccountDetails=asyncHandler(async(req,res)=>{

   const {fullname,email}=req.body;
   if(!fullname || !email){
      throw new ApiError(400,"All fields are required");
   }

  const user=User.findByIdAndUpdate(
   req.user?._id,
   {
      $set:{
         fullname,
         email
      }
   }
   ,{new :true})
   .select("-password");

   return res.status(200)
   .json(new ApiResponse(200,user,"details updated Successfully"));
})
const updateUserAvatar=asyncHandler(async(req,res)=>{
   const avatarLocalPath=req.file?.path;
   if (!avatarLocalPath) {
      throw new ApiError(400,"Avatar file is misssing");
   }
  const avatar= await UploadOnCloudnary(avatarLocalPath);
  if(!avatar.url){
   throw new ApiError(400,"Error while uploading on avatar");
  }

 const user=await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      avatar:avatar.url
   }
 },{new:true}).select("-password")
 return res
 .status(200)
 .json(new ApiResponse(200,user,"Avatar image updated successfully"))
})
const updateUserCoverImg=asyncHandler(async(req,res)=>{
   const CoverLocalPath=req.file?.path;
   if (!CoverLocalPath) {
      throw new ApiError(400,"Avatar file is misssing");
   }
  const CoverImg= await UploadOnCloudnary(CoverLocalPath);
  if(!CoverImg.url){
   throw new ApiError(400,"Error while uploading on avatar");
  }

 const user=await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      coverImage:CoverImg.url
   }
 },{new:true}).select("-password");

 return res
 .status(200)
 .json(new ApiResponse(200,user,"CoverImg Updated Successfully"));

})
export {registerUser
   ,loginUser
   ,logoutUser
   ,refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser
   ,updateAccountDetails
   ,updateUserAvatar,
   updateUserCoverImg
}