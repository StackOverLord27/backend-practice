import mongoose, {isValidObjectId} from "mongoose"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiErrorHandler.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponseHandler.js"

const toggleVideoLike = asyncHandler(async(req, res) => {
    const { videoId } = req.params
    const userId = req.user._id // From auth middleware
    
    if(!videoId) {
        throw new ApiError(400, "No Video ID found")
    }
    if(!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Video ID")
    }

    const like = await Like.findOne({ 
        video: videoId, 
        likedBy: userId 
    })

    if(!like) {
        await Like.create({
            video: videoId,
            likedBy: userId
        })
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Video liked")
        )
    } else {
        await Like.findByIdAndDelete(like._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Video disliked")
        )
    }
})

const toggleCommentLike= asyncHandler(async(req, res)=> {
    const { commentId } = req.params
    const userId = req.user._id // From auth middleware
    
    if(!commentId) {
        throw new ApiError(400, "No comment ID found")
    }
    if(!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid Comment ID")
    }

    const like = await Like.findOne({ 
        comment: commentId, 
        likedBy: userId 
    })

    if(!like) {
        await Like.create({
            comment: commentId,
            likedBy: userId
        })
        return res.status(200).json(
            new ApiResponse(200, { liked: true }, "Comment liked")
        )
    } else {
        await Like.findByIdAndDelete(like._id)
        return res.status(200).json(
            new ApiResponse(200, { liked: false }, "Comment disliked")
        )
    }
})

const getLikedVideos= asyncHandler(async(req, res)=> {
    const userId= req.user._id

    const likedVideos= await Like.aggregate([
        {
            $match: {likedBy: userId, video: {$exists: true}}
        }, 
        {
            $lookup: {
                from: "videos",
                localField: "video",
                foreignField: "_id",
                as: "videoDetails"
            },
        }, 
        {$unwind: "videoDetails"},
        {$sort: {createdAt: -1}}
    ])

    return res.status(200).json(new ApiResponse(200, likedVideos, "Liked Videos fetched successfully"))
})

export {toggleVideoLike, toggleCommentLike, getLikedVideos}