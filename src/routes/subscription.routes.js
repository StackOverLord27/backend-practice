import { Router } from 'express';
import {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels,
    getChannelSubscriberCount,
    isUserSubscribed
} from "../controllers/subscription.controller.js"
import {verifyJWT} from "../middlewares/auth.middleware.js"

const router = Router();
router.use(verifyJWT); // Apply verifyJWT middleware to all routes in this file

router.route("/c/:channelId").post(toggleSubscription).get(getUserChannelSubscribers);
router.route("/u").get(getSubscribedChannels);
router.route("/count/:channelId").get(getChannelSubscriberCount);
router.route("/status/:channelId").get(isUserSubscribed);

export default router