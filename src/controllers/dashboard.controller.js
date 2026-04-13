import mongoose from "mongoose"
import {Video} from "../models/video.model.js"
import {Subscription} from "../models/subscriptions.model.js"
import {Like} from "../models/like.model.js"
import {ApiError} from "../utils/apiErrorHandler.js"
import {ApiResponse} from "../utils/apiResponseHandler.js"
import {asyncHandler} from "../utils/asyncHandler.js"
import { User } from "../models/users.model.js"

const getChannelStats = asyncHandler(async(req, res) => {
    const { channelId } = req.params

    const channel = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "videos",
                localField: "_id",
                foreignField: "owner",
                as: "videos"
            }
        },
        {
            $lookup: {
                from: "subscriptions",
                localField: "_id",
                foreignField: "channel",
                as: "subscribers"
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoIds: "$videos._id" },
                pipeline: [
                    {
                        $match: {
                        $expr: {
                        $in: ["$video", "$$videoIds"]
                        }
                    }
                }
                ],
                as: "videoLikes"
            }
        },
        {
            $addFields: {
                subscribersCount: {
                    $size: "$subscribers"
                },
                totalViews: {
                    $sum: "$videos.views"
                },
                totalVideos: {
                    $size: "$videos"
                },
                totalLikes: {
                    $size: "$videoLikes"
                }
            }
        },
        {
            $project: {
                fullName: 1,
                username: 1,
                subscribersCount: 1,
                totalViews: 1,
                totalVideos: 1,
                totalLikes: 1,
                avatar: 1,
                coverImage: 1,
                email: 1            
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, channel[0], "Channel stats fetched successfully"))
})

const getChannelVideos = asyncHandler(async(req, res) => {
    const { channelId } = req.params

    const videos = await Video.aggregate([
        {
            $match: {
                owner: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "likes",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$video", "$$videoId"]
                            }
                        }
                    },
                    {
                        $count: "totalLikes"
                    }
                ],
                as: "likesInfo"
            }
        },
        {
            $lookup: {
                from: "comments",
                let: { videoId: "$_id" },
                pipeline: [
                    {
                        $match: {
                            $expr: {
                                $eq: ["$video", "$$videoId"]
                            }
                        }
                    },
                    {
                        $count: "totalComments"
                    }
                ],
                as: "commentsInfo"
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "ownerDetails"
            }
        },
        {
            $addFields: {
                totalLikes: {
                    $cond: [
                        { $gt: [{ $size: "$likesInfo" }, 0] },
                        { $arrayElemAt: ["$likesInfo.totalLikes", 0] },
                        0
                    ]
                },
                totalComments: {
                    $cond: [
                        { $gt: [{ $size: "$commentsInfo" }, 0] },
                        { $arrayElemAt: ["$commentsInfo.totalComments", 0] },
                        0
                    ]
                },
                ownerDetails: {
                    $arrayElemAt: ["$ownerDetails", 0]
                }
            }
        },
        {
            $project: {
                title: 1,
                description: 1,
                videoFile: 1,
                thumbnail: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                totalLikes: 1,
                totalComments: 1,
                createdAt: 1,
                updatedAt: 1,
                ownerDetails: {
                    username: 1,
                    fullName: 1,
                    avatar: 1
                }
            }
        }
    ])

    return res.status(200).json(new ApiResponse(200, videos, "Channel videos fetched successfully"))
})

export { getChannelStats, getChannelVideos }
