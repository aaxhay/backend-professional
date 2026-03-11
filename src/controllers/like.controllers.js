import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Like } from "../models/like.models.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "Video id is not there || undefined or null");
  }

  const existingLike = await Like.findOne({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      status: 200,
      message: "unliked Video",
    });
  }

  const likedVideo = await Like.create({
    video: videoId,
    likedBy: req.user?._id,
  });

  if (!likedVideo)
    throw new ApiError(500, "There's some problems liking this video");

  return res.status(200).json({
    status: 200,
    message: "liked Video",
    data: likedVideo,
  });
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "Comment id is not there || undefined or null");
  }

  const existingLike = await Like.findOne({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      status: 200,
      message: "unliked Comment",
    });
  }

  const likedComment = await Like.create({
    comment: commentId,
    likedBy: req.user?._id,
  });

  if (!likedComment)
    throw new ApiError(500, "There's some problems liking this comment");

  return res.status(200).json({
    status: 200,
    message: "liked a comment",
    data: likedComment,
  });
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is not there || undefined or null");
  }

  const existingLike = await Like.findOne({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (existingLike) {
    await Like.findByIdAndDelete(existingLike._id);
    return res.status(200).json({
      status: 200,
      message: "unliked Tweet",
    });
  }

  const likedTweet = await Like.create({
    tweet: tweetId,
    likedBy: req.user?._id,
  });

  if (!likedTweet)
    throw new ApiError(500, "There's some problems liking this tweet");

  return res.status(200).json({
    status: 200,
    message: "liked tweet",
    data: likedTweet,
  });
});

const countTweetLikes = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!tweetId) {
    throw new ApiError(400, "Tweet id is undefined or null");
  }

  const tweetLikesCount = await Like.countDocuments({ tweet: tweetId });

  if (!tweetLikesCount) {
    return res
      .status(200)
      .json({ status: 200, message: "there are no likes on this tweet" });
  }

  return res.status(200).json({
    status: 200,
    message: "like count fetched",
    data: tweetLikesCount,
  });
});

const countCommentLikes = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!commentId) {
    throw new ApiError(400, "comment id is undefined or null");
  }

  const commentLikesCount = await Like.countDocuments({ comment: commentId });

  if (!commentLikesCount) {
    return res
      .status(200)
      .json({ status: 200, message: "there are no likes on this comment" });
  }

  return res.status(200).json({
    status: 200,
    message: "like count fetched",
    data: commentLikesCount,
  });
});

const countVideoLikes = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!videoId) {
    throw new ApiError(400, "video id is undefined or null");
  }

  const videoLikesCount = await Like.countDocuments({ video: videoId });

  if (!videoLikesCount) {
    return res
      .status(200)
      .json({ status: 200, message: "there are no likes on this video" });
  }

  return res.status(200).json({
    status: 200,
    message: "like count fetched",
    data: videoLikesCount,
  });
});

export {
  toggleVideoLike,
  toggleCommentLike,
  toggleTweetLike,
  countTweetLikes,
  countVideoLikes,
  countCommentLikes,
};
