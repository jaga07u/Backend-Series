import mongoose, {isValidObjectId} from "mongoose"
import {User} from "../models/User.model.js"
import { Subscription } from "../models/Subscription.modle.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
    let togglesub=false;
    const toggleSubscription=await Subscription.findOne({channel:channelId,subscriber:req.user?._id});
    if(toggleSubscription){
        await Subscription.findOneAndDelete({channel:channelId,subscriber:req.user?._id});
         togglesub=false;
    }
    else{
        await Subscription.create({channel:channelId,subscriber:req.user?._id});
        togglesub=true;
    }
    const msg=togglesub?"subscription added":"subscription removed";
    res.status(201)
    .json(new ApiResponse(201,{},msg));
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    const subscriber=await Subscription.find({channel:channelId});
    if(!subscriber){
        throw new ApiError(401,"subscription not found");
    }
    res.status(200)
    .json(new ApiResponse(200,{subscriber:subscriber.length},"subscribers founded"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    const subscribed=await Subscription.find({subscriber:subscriberId});
    if(!subscribed){
        throw new ApiError(401,"no subscriber");
    }
    res.status(200)
    .json(new ApiResponse(200,{subscribed:subscribed.length},"you subscribed"))
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}