import { Router } from "express";
import { verifyJWT } from "../middleware/auth.middlewares.js";
import {
  countCommentLikes,
  countTweetLikes,
  countVideoLikes,
  toggleCommentLike,
  toggleTweetLike,
  toggleVideoLike,
} from "../controllers/like.controllers.js";

const router = Router();

router.use(verifyJWT);

router.route("/videos/:videoId/like").post(toggleVideoLike);
router.route("/comments/:commentId/like").post(toggleCommentLike);
router.route("/tweets/:tweetId/like").post(toggleTweetLike);
router.route("/tweets/:tweetId/count-likes").get(countTweetLikes);
router.route("/comments/:commentId/count-likes").get(countCommentLikes);
router.route("/videos/:videoId/count-likes").get(countVideoLikes);

export default router;
