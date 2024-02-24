import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const {videoId} = req.params
    //TODO: toggle like on video
    if(!videoId){
        throw new ApiError(401,"videoId is required");
    }
    //  const videoLike=await Like.create({
    //     video:videoId,
    //     LikedBy:req.user?._id
    //  })
    //  if(!videoLike){
    //     throw new ApiError(403,"someting went wrong");
    //  }
     let isLiking;
     const isLikedAlready = await Like.findOne({video: videoId, LikedBy: req.user?._id});
   //  console.log(isLikedAlready);
     if(isLikedAlready){
         await Like.deleteOne({video: isLikedAlready.video, LikedBy: isLikedAlready.LikedBy});
         isLiking = false;
     }else{
         await Like.create({video: videoId, LikedBy: req.user?._id});
         isLiking = true;
     }
 
     const message = isLiking ? "Add like to video success" : "Remove like from video success";
     res.status(200).json(new ApiResponse(
         200,
         {},
         message
     ));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const {commentId} = req.params
  //  console.log(req.params);
    //TODO: toggle like on comment
    if(!commentId){
        throw new ApiError(401,"videoId is required");
    }
     let iscommentLiking;
     const iscommentLikedAlready = await Like.findOne({comment: commentId, LikedBy: req.user?._id});

     if(iscommentLikedAlready){
         await Like.deleteOne({comment: iscommentLikedAlready.comment, LikedBy: iscommentLikedAlready.LikedBy});
         iscommentLiking = false;
     }else{
         await Like.create({comment:commentId, LikedBy: req.user?._id});
         iscommentLiking = true;
     }
 
     const message = iscommentLiking ? "Add like to comment success" : "Remove like from commnet success";
     res.status(200).json(new ApiResponse(
         200,
         {},
         message
     ));

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const {tweetId} = req.params
    //TODO: toggle like on tweet
    if(!tweetId){
        throw new ApiError(401,"tweetId is required");
    }
     let istweetLiking;
     const istweetLikedAlready = await Like.findOne({video: tweetId, LikedBy: req.user?._id});

     if(istweetLikedAlready){
         await Like.deleteOne({tweet:istweetLikedAlready.tweet, LikedBy: istweetLikedAlready.LikedBy});
         istweetLiking = false;
     }else{
         await Like.create({tweet:tweetId, LikedBy: req.user?._id});
         istweetLiking = true;
     }
 
     const message = istweetLiking ? "Add like to tweet success" : "Remove like from tweet success";
     res.status(200).json(new ApiResponse(
         200,
         {},
         message
     ));
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}