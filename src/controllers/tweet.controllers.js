import { asyncHandler } from "../utils/asyncHandler.js";
import { Tweet } from "../models/tweet.models.js";
import { ApiError } from "../utils/ApiError.js";

const addTweet = asyncHandler(async (req, res) => {
  //   console.log(req.body);

  const { content } = req.body;

  if (!content) throw new ApiError(400, "there is nothing in req.data");

  const tweetCreated = await Tweet.create({
    content,
    owner: req.user?._id,
  });

  if (!tweetCreated) {
    throw new ApiError(500, "Tweet creation caught some problems");
  }

  return res.status(200).json({
    status: 200,
    message: "tweet created successfully",
    data: tweetCreated,
  });
});

const getAllTweets = asyncHandler(async (req, res) => {
  const allTweets = await Tweet.find();
  if (!allTweets) {
    throw new ApiError(500, "unable to find tweets");
  }

  return res.status(200).json({
    message: "All tweets fetched",
    status: 200,
    data: allTweets,
  });
});

const updateTweet = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { contentToBeUpdated } = req.body;

  if (!id) throw new ApiError(400, "id is not there maybe undefined or null");

  if (!contentToBeUpdated || contentToBeUpdated.trim() === "")
    throw new ApiError(
      400,
      "There is nothing to be updated || data is not there",
    );

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: id, owner: req.user?._id },
    {
      $set: {
        content: contentToBeUpdated,
      },
    },
    { returnDocument: "after" },
  ).populate("owner", "username email avatar");

  if (!updatedTweet) {
    throw new ApiError(500, "you are not allowed to update someone elses tweet");
  }

  return res.status(200).json({
    status: 200,
    message: "Tweet Updated Successfully",
    data: updatedTweet,
  });
});

const deleteTweet = asyncHandler(async (req, res) => {
  const {id} = req.params;

  if (!id) {
    throw new ApiError(400, "id is not there to be deleted");
  }

  const deletedTweet = await Tweet.findOneAndDelete(
    { _id: id, owner: req.user?._id },
    { new: true },
  );

  if(!deletedTweet) { 
    throw new ApiError(400,"you cannot deleted someone elses tweet not allowed")
  }

  return res.status(200).json({
    status: 200,
    message: "Tweet Deleted Successfully",
  });
});

export { getAllTweets, addTweet, updateTweet, deleteTweet };
