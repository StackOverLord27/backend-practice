import mongoose, {isValidObjectId} from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiErrorHandler.js";
import { Comment } from "../models/comment.model.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/apiResponseHandler.js";




const getVideoComments= asyncHandler(async(req, res)=> {
    const {videoId}= req.params
    const {page= 1, limit=10} = req.query

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }
    const video= await Video.findById(videoId)
    if(!video){
        throw new ApiError(404, "Video not found")
    }

    const comments= Comment.aggregate([
        {
            $match: {
                video: new mongoose.Types.ObjectId(videoId)
            }
        },
        {$sort: {createdAt: -1}},
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $unwind: "$ownerDetails"
        }
    ]) 

    const options= {page: parseInt(page), limit: parseInt(limit)}
    const commentPage= await Comment.aggregatePaginate(comments, options)

    if(!comments){
        throw new ApiError(400, "Error fetching comment")
    }

    return res.status(200).json(new ApiResponse(200, commentPage, "Comments fetched successfully"))
})

const addComment= asyncHandler(async(req, res)=> {
    const {videoId} = req.params
    const {content}= req.body

    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid Video ID")
    }

    if(!content || content.trim()=== "") {
        throw new ApiError(400, "Comment cannot be empty")
    }

    const video= await Video.findById(videoId)

    if(!video){
        throw new ApiError(404, "Video does not exist")
    }

    const comment = await Comment.create({
        content: content.trim(),
        video: videoId,
        owner: req.user._id
    })

    if(!comment){
        throw new ApiError(400, "Error adding comment")
    }

    await comment.populate("owner", "username avatar")
    return res.status(200).json(new ApiResponse(200, comment, "Comment added successfully"))
    
})

const updateComment= asyncHandler(async(req, res)=> {
    const {commentId}= req.params
    const {content}= req.body

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    if(!content){
        throw new ApiError(400, "Content is missing")
    }

    const comment= await Comment.findById(commentId)
    if(!comment){
        throw new ApiError(404, "Comment does not exist")
    }

    if(comment.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403, "Only owner can edit comment")
    }

    const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    { 
        $set: { content: content.trim() } 
    },
    { new: true }  // Returns the updated document
    )

    return res.status(200).json(new ApiResponse(200, updatedComment, "Comment edited successfully"))
    
})

const deleteComment= asyncHandler(async(req, res)=> {
    const {commentId}= req.params

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID")
    }

    const comment= await Comment.findById(commentId).populate("video")
    if(!comment){
        throw new ApiError(404, "Comment does not exist")
    }

    if(comment.owner.toString()!== req.user._id.toString() && comment.video.owner.toString()!== req.user._id.toString()){
        throw new ApiError(403, "Only owner can delete comment")
    }

    await Comment.findByIdAndDelete(commentId)

    return res.status(200).json(new ApiResponse(200, {}, "Comment deleted successfully"))
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
}