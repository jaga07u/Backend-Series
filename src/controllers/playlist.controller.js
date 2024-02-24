import mongoose, {isValidObjectId} from "mongoose"
import {Playlist} from "../models/playlist.model.js"
import {ApiError} from "../utils/ApiError.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import {asyncHandler} from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const {name, description} = req.body
    if(!(name && description)){
        throw new ApiError(402,"name and description required");
    }
    const playlist=await Playlist.create({
        name,
        description,
        owner:req.user?._id
    })
    if(!playlist){
        throw new ApiError(401,"something went wrong");
    }
    res.status(201)
    .json(new ApiResponse(200,playlist,"playlist created Successfully"));
    //TODO: create playlist
})

const getUserPlaylists = asyncHandler(async (req, res) => {
    const {userId} = req.params
    //TODO: get user playlists
    const playlist=await Playlist.find({owner:userId});
    if(!playlist){
        throw new ApiError(404,"playlist not found");
    }
    res.status(200)
    .json(new ApiResponse(200,playlist,"playlist found"))
})

const getPlaylistById = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    //TODO: get playlist by id
    const playlist=await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(402,"playlist not found");
    }
    res.status(200)
    .json(new ApiResponse(200,playlist,"playlist founded"))
})

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    const playlist=await Playlist.findByIdAndUpdate(playlistId);
    if(!playlist){
        throw new ApiError(404,"playlist not found");
    }
    playlist.videos.push(videoId);
    await playlist.save({validateBeforeSave:false});
    res.status(200)
    .json(new ApiResponse(200,playlist,"video add successfully"))
})

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const {playlistId, videoId} = req.params
    // TODO: remove video from playlist
    const playlist=await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404,"playlist not found");
    }
    if(!playlist.videos.includes(videoId)){
        throw new ApiError(404,"video not found");
    }
    playlist.videos.pop(videoId);
    await playlist.save({validateBeforeSave:false})
    res.status(200)
    .json(new ApiResponse(200,{},"video deleted from playlist"))

})

const deletePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    // TODO: delete playlist
    await Playlist.findByIdAndDelete(playlistId);

    res.status(200)
    .json(new ApiResponse(200,{},"playlist deleted successfully"));
})

const updatePlaylist = asyncHandler(async (req, res) => {
    const {playlistId} = req.params
    const {name, description} = req.body
    //TODO: update playlist
    if(!(name && description)){
        throw new ApiError(401,"name and description required");
    }
    const playlist=await Playlist.findByIdAndUpdate(playlistId,
        {
            $set:{
                name,
                description
            }

    },{
        new:true
    })
   // console.log(playlist);
    if(!playlist){
        throw new ApiError(404,"playlist not found");
    }
    res.status(200)
    .json(new ApiResponse(200,playlist,"playlist update Succesfully"));
})

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}