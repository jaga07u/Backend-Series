import mongoose, {isValidObjectId} from "mongoose"
import {Video} from "../models/video.model.js"
// import {User} from "../models/user.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import {UploadOnCloudnary} from "../utils/Cloudnary.js"
import { v2 as Cloudnary} from "cloudinary"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    //TODO: get all videos based on query, sort, pagination
})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, discription} = req.body
    // TODO: get video, upload to cloudinary, create video
   // console.log(title,de);
    if(!(title && discription)){
          throw new ApiError(401,"title and description  required");
    }
   // console.log(req.files);
    const videopath=req.files?.videoFile[0].path;
    console.log(videopath);
    if(!videopath){
        throw new ApiError(401,"video File is required");
    }
    const video= await UploadOnCloudnary(videopath);
   // console.log(video);
    if(!video){
        throw new ApiError(401,"someting went wrong with cloudnary");
    }
    const thubnailfile=req.files?.thumbnail[0].path;
    console.log(thubnailfile);
    if(!thubnailfile){
        throw new ApiError(401,"video File is required");
    }
    const thumbnail= await UploadOnCloudnary(thubnailfile);
    if(!thumbnail){
        throw new ApiError(401,"someting went wrong with cloudnary");
    }
    const videoDoc=await Video.create(
       {
        videoFile:video.url,
        thumbnail:thumbnail.url,
        owner:req.user?._id,
        title,
        discription:discription,
        duration:video.duration,
        isPublished:true
       }
   )
   res.status(201)
   .json(new ApiResponse(201,videoDoc,"video Published Successfully"))
})
const viewsInc=asyncHandler(async(req,res)=>{
    const {videoid}=req.body
    console.log(videoid);
    if(!videoid){
        throw new ApiError(401,"videoid is required");
    }
    const video=await Video.findById(videoid);
    if (!video) {
         throw new ApiError(401,"video does not exist");        
    }
    if (video.views.includes(req.user?._id)) {
        // User has already viewed the video, don't increment view count
        return res.status(200).json({ message: 'User has already viewed the video' });
    }
    video.views.push(req.user?._id);
    await video.save({validateBeforeSave:false});
    res.status(201)
    .json(new ApiResponse(201,"view increment Successfully"))
})
const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
   // console.log(videoId);
    const video=await Video.findById(videoId)
    if(!video){
        throw new ApiError(401,"Video doesnot exists");
    }
    res.status(201)
    .json(new ApiResponse(201,video,"Viode get Successfully"))
    //TODO: get video by id
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: update video details like title, description, thumbnail
    console.log(videoId);
    const {title,description}=req.body;
    const thubnailfile=req.file.path;
    const videoData=await Video.findById(videoId);
   // console.log(videoData);
    const thubnailfileData=(videoData.thumbnail)?.split('/');
   // console.log(thubnailfileData);
   const  thumbnaillastElm=thubnailfileData[thubnailfileData?.length-1].split(".");
 //  console.log(thumbnaillastElm);
    if(!thubnailfile){
        throw new ApiError(401,"Thubnailfile is required");
    }
    const thumbnail=await UploadOnCloudnary(thubnailfile);
    console.log(thumbnail);
    if(!thumbnail){
        throw new ApiError(401,"Something went wrong at upload ");
    }
    const video=await Video.findByIdAndUpdate(videoId,{
        $set:{
             title,
             discription:description,
             thumbnail:thumbnail.url
        }
    },{
        new:true
    }
    )
    console.log(video);
 await  Cloudnary.uploader.destroy(thumbnaillastElm[0]);
    if(!video){
        throw new ApiError(401,"something went wrong at update time");
    }
    res.status(201)
    .json(new ApiResponse(201,video,"Video Updated successfully"))

})

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if(!videoId){
        throw new ApiError(401,"video Id is required");
    }
    const video=await Video.findById(videoId);
    const videoData=(video.videoFile)?.split('/');
    // console.log(thubnailfileData);
    const  videoDatElm=videoData[videoData?.length-1].split(".");

     await Video.findByIdAndDelete(videoId);
    console.log(videoDatElm[0]);
    await Cloudnary.uploader.destroy(videoDatElm[0],{resource_type:"video"});
    res.status(201)
    .json(new ApiResponse(201,{},"video Deleted Successfully"))
    //TODO: delete video
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const video=await Video.findByIdAndUpdate(videoId);
    video.isPublished=!(video.isPublished);
    video.save({validateBeforeSave:false});

    res.status(201)
    .json(new ApiResponse(201,{},"Toggle Successfully"))

})

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    viewsInc
}