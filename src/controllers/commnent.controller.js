import mongoose from "mongoose"
import {Comment} from "../models/comment.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const {videoId} = req.params
    const {page = 1, limit = 10} = req.query

})

const addComment = asyncHandler(async (req, res) => {
    // TODO: add a comment to a video
    const {videoId}=req.params;
    const {content}=req.body;
    console.log(req.body);
    console.log(content);
    if(!content){
        throw new ApiError(403,"content required");
    }
    const comment=await Comment.create(
        {
            content,
            owner:req.user?._id,
            video:videoId
        }
    )
    if(!comment){
        throw new ApiError(500,"Internal server error");
    }
    res.status(201)
    .json(new ApiResponse(201,comment,"Comment created Successfully"));
})

const updateComment = asyncHandler(async (req, res) => {
    // TODO: update a comment
    const {commentId}=req.params;
    const {content}=req.body;

    if(!commentId){
        throw new ApiError(403,"comment id required");
    }
    if(!content){
        throw new ApiError(403,"content required");
    }
    const comment=await Comment.findByIdAndUpdate(commentId,
        {
            $set:{
                content:content
            }
        },{
            new:true
        }
        )

    if(!comment){
        throw new ApiError(500,"somting happend at finding");
    }
    res.status(200)
    .json(new ApiResponse(200,comment,"comment UpdatedSuccessfully"))
})

const deleteComment = asyncHandler(async (req, res) => {
    // TODO: delete a comment
    const {commentId}=req.params;
    
    if(!commentId){
        throw new ApiError(401,"commentId is required");
    }
    await Comment.findByIdAndDelete(commentId);
    res.status(200)
    .json(new ApiResponse(200,{},"comment Deleted Successfully"))
})

export {
    getVideoComments, 
    addComment, 
    updateComment,
     deleteComment
    }