import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from '../utils/ApiError.js'
import {User} from '../models/User.model.js'
import {UploadOnCloudnary} from '../utils/Cloudnary.js'
import {ApiResponse} from '../utils/ApiResponse.js'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import {v2 as cloudinary} from 'cloudinary';




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
    // console.log(req.files);
const avatarLocalPath= req.files?.avatar[0]?.path;
const coverImageLocalPath= req.files?.coverImage[0]?.path;

 if(!avatarLocalPath){
    throw new ApiError(400,"Avatar file is required")
 }
 const avatar=await UploadOnCloudnary(avatarLocalPath);
 const coverImage= await UploadOnCloudnary(coverImageLocalPath);
 //console.log(avatar);
  
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
         $unset:{
            refreshToken:1
         }
         },
         {
            new:true
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
   console.log(req.body);
   const {oldpassword,newPassword}=req.body
   const user=await User.findById(req.user?._id);
   console.log(oldpassword);
   //console.log(newPassword);
  const isPasswordCorrect=await user.isPasswordCorrect(oldpassword);
  console.log(isPasswordCorrect);
  if(!isPasswordCorrect){
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
   .json(new ApiResponse(200,req.user,"current user fetched successfully"));
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
   //TODO Delete Old Avatar
   const userdetail=await User.findById(req.user?._id);
   const avatardata=(userdetail.avatar)?.split('/');
   const avatarlastelem=avatardata[avatardata?.length-1].split(".");
   // console.log(avatardata);
   // console.log(avatarlastelem);
  const avatar= await UploadOnCloudnary(avatarLocalPath);
  if(!avatar.url){
   throw new ApiError(400,"Error while uploading on avatar");
  }

 const user=await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      avatar:avatar.url
   }
 },{new:true}).select("-password");
  
 await cloudinary.uploader.destroy(avatarlastelem[0]);
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
  const userdetail=await User.findById(req.user?._id);
   const coverImgdata=(userdetail.coverImage)?.split('/');
   console.log(coverImgdata);
   const coverImgID=coverImgdata[coverImgdata?.length-1].split(".");
   console.log(coverImgID);
  if(!CoverImg.url){
   throw new ApiError(400,"Error while uploading on avatar");
  }

 const user=await User.findByIdAndUpdate(req.user?._id,{
   $set:{
      coverImage:CoverImg.url
   }
 },{new:true}).select("-password");
 await cloudinary.uploader.destroy(coverImgID[0]);
 return res
 .status(200)
 .json(new ApiResponse(200,user,"CoverImg Updated Successfully"));

})

const getUserChannelProfile=asyncHandler(async(req,res)=>{
      const {username} = req.params

      if(!username?.trim()){
         throw new ApiError(400,"username is missing");
      }
   const channel= await User.aggregate([
      {
         $match:{
            username:username?.toLowerCase()
         }
      },
      {
            $lookup:{
               from:"subscriptions",
               localField:"_id",
               foreignField:"channel",
               as:"subscriber"
            }
         
      },
      {
         $lookup:{
            from:"Subscription",
            localField:"_id",
            foreignField:"subscriber",
            as:"subscribeTo"
         }
      },
      {
         $addFields:{
             subscriberCount:{
               $size:"$subscribers"
             },
             channelsSubscribedToCount:{
                  $size:"$subscribeTo"
             },
               isSubsctibed:{
                  $cond:{
                     if:{$in:[req.user?._id,"$subscribers.susbcriber"]},
                     then:true,
                     else:false
                  }
               }
            }
      },
      {
         $project:{
            fullname:1,
            username:1,
            subscriberCount:1,
            channelsSubscribedToCount:1,
            isSubsctibed:1,
            avatar:1,
            coverImage:1,
            email:1
         }
      }
    ])

    if(!channel?.length){
      throw new ApiError(404,"channel does not exists");
    }

    return res.status(0)
    .json(new ApiResponse(200,channel[0],"User channel fetched successfully"));
})

const getWatchHistory = asyncHandler(async(req, res) => {
   const user = await User.aggregate([
       {
           $match: {
               _id: new mongoose.Types.ObjectId(req.user._id)
           }
       },
       {
           $lookup: {
               from: "videos",
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
                       $addFields:{
                           owner:{
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
           "Watch history fetched successfully"
       )
   )
})

export {registerUser
   ,loginUser
   ,logoutUser
   ,refreshAccessToken,
   changeCurrentPassword,
   getCurrentUser
   ,updateAccountDetails
   ,updateUserAvatar,
   updateUserCoverImg,
   getUserChannelProfile,
   getWatchHistory
}