import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/Subscription.modle.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"

const getChannelStats = asyncHandler(async (req, res) => {
    // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
    const videoData = await Video.aggregate([
        {
          $match: {
            owner: new mongoose.Types.ObjectId(req.user?._id),
          },
        },
        {
          $lookup: {
            from: "likes",
            localField: "_id",
            foreignField: "video",
            as: "Likes",
          },
        },
        {
          $addFields: {
            likes: {
              $size: { $ifNull: ["$likes", []] },
            },
          },
        },
        {
          $lookup: {
            from: "subscriptions",
            localField: "owner",
            foreignField: "channel",
            as: "subscriber",
          },
        },
        {
          $addFields: {
            subscriber: {
              $size: { $ifNull: ["$subscriber", []] },
            },
          },
        },
        {
          $group: {
            _id: null,
            totalViews: {
              $sum: "$views",
            },
            totalVideos: {
              $sum: 1,
            },
            totalLikes: {
              $sum: "$likes",
            },
            totalSubscriber:{
                $sum:"$subscriber"
            }
          },
        },
        {
          $project: {
            _id: 0,
            owner: 0,
          },
        },
      ]);
      return res.status(200).json(new ApiResponse(200, { videoData }, "Success"));
})

const getChannelVideos = asyncHandler(async (req, res) => {
    // TODO: Get all the videos uploaded by the channel
    const { userId } = req.params;
    try {
      const allVideos = await Video.find({
        owner: new mongoose.Types.ObjectId(req.user?._id),
      }).count();
      if (!allVideos) throw new ApiError(404, "No videos available");
      return res.status(200).json(new ApiResponse(200, { allVideos }, "Success"));
    } catch (e) {
      throw new ApiError(400, e.message || "Some error occurred");
    }
})

export {
    getChannelStats, 
    getChannelVideos
    }

