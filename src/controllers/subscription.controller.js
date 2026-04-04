import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiResponse } from "../utils/apiResponseHandler.js"
import { ApiError } from "../utils/apiErrorHandler.js"
import { Subscription } from "../models/subscriptions.model.js"
import mongoose from "mongoose"


const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user?._id

    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!subscriberId) {
        throw new ApiError(401, "User not authenticated")
    }


    if (channelId === subscriberId.toString()) {
        throw new ApiError(400, "Cannot subscribe to your own channel")
    }


    const subscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    let isSubscribed = false

    if (subscription) {

        await Subscription.findByIdAndDelete(subscription._id)
        isSubscribed = false
    } else {

        await Subscription.create({
            subscriber: subscriberId,
            channel: channelId
        })
        isSubscribed = true
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            { isSubscribed },
            isSubscribed ? "Subscribed successfully" : "Unsubscribed successfully"
        )
    )
})


const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params


    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscribers = await Subscription.aggregate([
        {
            $match: {
                channel: new mongoose.Types.ObjectId(channelId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "subscriber",
                foreignField: "_id",
                as: "subscriberDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$subscriberDetails"
        },
        {
            $project: {
                subscriber: 1,
                subscriberDetails: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribers,
            `Total ${subscribers.length} subscriber(s) found`
        )
    )
})


const getSubscribedChannels = asyncHandler(async (req, res) => {
    const userId = req.user?._id

    if (!userId) {
        throw new ApiError(401, "User not authenticated")
    }

    const subscribedChannels = await Subscription.aggregate([
        {
            $match: {
                subscriber: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "channel",
                foreignField: "_id",
                as: "channelDetails",
                pipeline: [
                    {
                        $project: {
                            _id: 1,
                            username: 1,
                            fullName: 1,
                            avatar: 1
                        }
                    }
                ]
            }
        },
        {
            $unwind: "$channelDetails"
        },
        {
            $project: {
                channel: 1,
                channelDetails: 1,
                createdAt: 1
            }
        }
    ])

    return res.status(200).json(
        new ApiResponse(
            200,
            subscribedChannels,
            `User is subscribed to ${subscribedChannels.length} channel(s)`
        )
    )
})


const getChannelSubscriberCount = asyncHandler(async (req, res) => {
    const { channelId } = req.params


    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscriberCount = await Subscription.countDocuments({
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            { subscriberCount },
            "Subscriber count fetched successfully"
        )
    )
})

const isUserSubscribed = asyncHandler(async (req, res) => {
    const { channelId } = req.params
    const subscriberId = req.user?._id


    if (!channelId?.trim()) {
        throw new ApiError(400, "Channel ID is required")
    }

    if (!subscriberId) {
        throw new ApiError(401, "User not authenticated")
    }

    if (!mongoose.Types.ObjectId.isValid(channelId)) {
        throw new ApiError(400, "Invalid channel ID")
    }

    const subscription = await Subscription.findOne({
        subscriber: subscriberId,
        channel: channelId
    })

    return res.status(200).json(
        new ApiResponse(
            200,
            { isSubscribed: !!subscription },
            "Subscription status fetched"
        )
    )
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getChannelSubscriberCount,
    isUserSubscribed
}