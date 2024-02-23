import mongoose, { isValidObjectId } from "mongoose"
import {Tweet} from "../models/tweet.model.js"
import {User} from "../models/User.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const {content}=req.body
    if(!content){
        throw new ApiError(401,"Content is required");
    }
    const tweet=await Tweet.create(
      {
        owner:req.user?._id,
        content
      }
    )
    if(!tweet){
        throw new ApiError(402,"tweet not published");
    }
    res.status(201)
    .json(new ApiResponse(201,tweet,"Tweet Created Successfully"));
})

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const {userId}=req.params;
    console.log(req.params);
    const tweet = await Tweet.find({ owner: userId });
    if(!tweet){
        throw new ApiError(401,"There is not tweet of this user");
    }
    res.status(201)
    .json(new ApiResponse(201,tweet,"get Tweet successfully"));
})

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const {tweetId}=req.params
    const {content}=req.body;
    if(!content){
        throw new ApiResponse(401,"content required");
    }
    const tweet=await Tweet.findByIdAndUpdate(tweetId,{
        $set:{
            content:content
        }
    },
    {
        new:true
    }
    );
    if(!tweet){
        throw new ApiError(401,"There is no tweet");
        }
    
    res.status(201)
    .json(new ApiResponse(201,tweet,"tweet upadated Successfully"))
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const {tweetId}=req.params;
    await Tweet.findByIdAndDelete(tweetId);

    res.status(201)
    .json(new ApiResponse(201,{},"Tweet Deleted Successfully"));
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}