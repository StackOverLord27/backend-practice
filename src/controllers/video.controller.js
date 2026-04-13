import mongoose from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import {Video} from "../models/video.model.js"
import { ApiError } from "../utils/apiErrorHandler.js"
import { ApiResponse } from "../utils/apiResponseHandler.js"
import { uploadFiles } from "../utils/cloudinary.js"




const fetchVideos= asyncHandler(async(req, res)=>{
    const {page= 1, limit= 20, search, sortBy, sortType= "asc", userId} = req.query
    
    var pageNum= parseInt(page)
    var limitNum= parseFloat(limit)

    // Pagination validation
    if(isNaN(pageNum) || pageNum < 1) {
        throw new ApiError(400, "Page must be a valid positive number")
    }
    // Limit validation
    if(isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        throw new ApiError(400, "Limit must be between 1 and 100")
    }

    // Sort validation
    if(sortType && !["asc", "desc"].includes(sortType)) {
        throw new ApiError(400, "SortType must be 'asc' or 'desc'")
    }
   
    

    // UserId validation (optional)
    // if(userId && !userId.match(/^[0-9a-fA-F]{24}$/)) {
    //     throw new ApiError(400, "Invalid userId format")
    // }

    const skip= (pageNum-1)*limitNum
    let filter= {}
    let sort={}

    if(search){
        filter= {
       $or: [{title: {
         $regex: search,
         $options: "i"
        }},
        {description: {
         $regex: search,
         $options: "i"
        }},
        ]
        }
    
    if(userId){
        filter.owner= userId 
    }
    }

    if(sortBy){
        sort= {
            [sortBy]: sortType==="asc"?1:-1
        }
    }

    const videos= await Video.find(filter).sort(sort).skip(skip).limit(limitNum)

    if(!videos || videos.length==0){
        throw new ApiError(404, "Video not found!")
    }

    return res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))

})

const publishVideo= asyncHandler(async(req, res)=> {
    const {title, description} = req.body

    const videoLocalPath= req.files?.video[0]?.path;
    if(!videoLocalPath){
        throw new ApiError(400, "Please upload video")
    }

    const thumbnailLocalPath= req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400, "Thumbnail not found")
    }
    const video= await uploadFiles(videoLocalPath)
    if(!video.url){
        throw new ApiError(400, "Error while uploading video")
    }

    const thumbnail= await uploadFiles(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400, "Error while uploading thumbnail")
    }

    const uploadVideo= await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        title,
        description,
        duration: video.duration,
        owner: req.user?._id
    })

    return res.status(200).json(new ApiResponse(200, uploadVideo, "Video uploaded successfully"))
})

const getVideoById= asyncHandler(async(req, res)=> {
    const {videoId}= req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

        const video= await Video.findById(videoId)

        if(!video){
            throw new ApiError(404, "Video not found")
        }

        return res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideoDetails= asyncHandler(async(req, res)=> {
    const {videoId} = req.params

    
    const {title, description}= req.body
    const thumbnailLocalPath= req.file?.path

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only owner can update this video")
    }


    let updateData= {}

    if(title) updateData.title=title
    if(description) updateData.description= description

    if(thumbnailLocalPath){
        const thumbnail= await uploadFiles(thumbnailLocalPath)

        if(!thumbnail.url){
            throw new ApiError(500, "Error while uploading thumbnail")
        }
        updateData.thumbnail= thumbnail.url
    }

    if(Object.keys(updateData).length===0){
        throw new ApiError(400, "Atleast 1 field is required for updation")
    }

    const update= await Video.findByIdAndUpdate(
        videoId,
        {
            $set: updateData
        }, {new: true, runValidators: true}
    )

    if(!update){
        throw new ApiError(404, "Update Unsuccessfull")
    }

    return res.status(200).json(new ApiResponse(200, update, "Video details updated successfully"))

})

const deleteVideo= asyncHandler(async(req, res)=> {
    const{videoId} = req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only owner can delete this video")
    }

    const deleteVideoById= await Video.findByIdAndDelete(videoId)

    if(!deleteVideoById){
        throw new ApiError(400, "Video delete Unsuccessfull!")
    }

    return res.status(200).json(new ApiResponse(200, {}, "Video deleted successfully"))
})

const togglePublishStatus= asyncHandler(async(req,res)=> {
    const {videoId}= req.params

    if(!videoId || !mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid videoId")
    }

    const video = await Video.findById(videoId)
    if(!video) {
        throw new ApiError(404, "Video not found")
    }

    if(video.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "Only owner can unpublish this video")
    }

    const togglePublish= await Video.findByIdAndUpdate(
        videoId,
        {
            $set: {
                isPublished: !video.isPublished
            }
        }, {new: true, runValidators: true}
    )

    if(!togglePublish){
        throw new ApiError(400, "Published status not changed")
    }

    return res.status(200).json(new ApiResponse(200, togglePublish, "Publish status changed successfully"))
})

export {
    fetchVideos, publishVideo, getVideoById, updateVideoDetails, deleteVideo, togglePublishStatus
}