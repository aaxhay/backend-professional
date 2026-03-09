import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Comment } from "../models/comment.models.js";
import mongoose from "mongoose";

const addComment = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { content } = req.body;

  if (!videoId) throw new ApiError(400, "there is no video id");

  if (!content) throw new ApiError(400, "there is no comment to add!");

  const commentOnVideo = await Comment.create({
    content,
    videoOfComment: videoId,
    owner: req.user?._id,
  });

  if (!commentOnVideo) {
    throw new ApiError(500, "No comment added due to some server problems");
  }

  return res.status(200).json({
    message: "Comment is added on Video",
    status: 200,
    data: addComment,
  });
});

const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  if (!content) {
    throw new ApiError(400, "Content is required");
  }

  const updatedComment = await Comment.findOneAndUpdate(
    {
      _id: id,
      owner: req.user._id, // ensures only owner can update
    },
    {
      $set: { content },
    },
    {
      new: true,
    },
  );

  if (!updatedComment) {
    throw new ApiError(403, "You are not allowed to update this comment");
  }

  return res.status(200).json({
    status: 200,
    message: "Comment updated successfully",
    data: updatedComment,
  });
});

const getAllComments = asyncHandler(async (req, res) => {
  const allComments = await Comment.find();
  if (!allComments) throw new ApiError(400, "There are no comments");

  return res.status(200).json({
    message: "All comments fetched",
    status: 200,
    data: allComments,
  });
});

export { getAllComments, addComment, updateComment };
