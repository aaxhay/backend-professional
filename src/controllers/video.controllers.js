import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import {
  destroyFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";
import mongoose from "mongoose";
import { getPublicIdFromUrl } from "../utils/getPublicIdFromUrl.js";

const uploadVideo = asyncHandler(async (req, res) => {
  // get all the infomation via req.body
  const { title, description } = req.body;

  //   console.log(req.body);
  // console.log(Object.keys(req.body));

  // checking for fields in case of null or undefined
  if ([title, description].some((fields) => fields === "")) {
    throw new ApiError(400, "all fields are required");
  }

  // getting the video file via rea.file.path
  const videoFile = req.file?.path;

  // again checking if we got the path or not
  if (!videoFile) {
    throw new ApiError(400, "file not found");
  }

  // uploaded on cloudinary
  const uploadedVideoResponse = await uploadOnCloudinary(videoFile);

  // checking if upload operation worked properly or not
  if (!uploadedVideoResponse) {
    throw new ApiError(400, "error after uploading to cloudinary");
  }

  // aggregation pipeline just trying
  const owner = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              username: 1,
              email: 1,
              fullName: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        owner: {
          $first: "$owner",
        },
      },
    },
  ]);

  // saving the video data in the database
  const videoFileData = await Video.create({
    videoFile: uploadedVideoResponse.url,
    title,
    description,
    owner: req.user,
    duration: uploadedVideoResponse.duration,
  });

  // checking if this data uploaded or not
  if (!videoFileData) {
    throw new ApiError(500, "Video File data is not saved");
  }

  // returning response lastly
  return res.status(200).json({
    message: "video file is uploaded successfully",
    status: 200,
  });
});

const deleteVideo = asyncHandler(async (req, res) => {
  //getting the id from params 
  const { id } = req.params;

  // checking if id is undefined or is there any problem 
  if (!id) {
    throw new ApiError(400, "Video id is needed to delete the video");
  }
  
  // finding the video by using the id which we've got 
  const foundVideo = await Video.findById(id);
  
  // checking if we actually found the video or not
  if (!foundVideo) {
    throw new ApiError(404, "Video not found");
  }
  
  // extracting the public id from the url which we've stored in our database
  const videoFilePublicId = getPublicIdFromUrl(foundVideo.videoFile);
  
  // checking if this public id is null or not 
  if (!videoFilePublicId) {
    throw new ApiError(400, "Cannot find the publicId");
  }
  
  // deleting the cloudinary uploaded mp4 too
  await destroyFromCloudinary(videoFilePublicId, {
    resource_type: "video",
  });
  
  // finally deleting this url from our database 
  await Video.findByIdAndDelete(id);
  
  // returning the response 
  return res.status(200).json({
    message: "Video file deleted successfully",
    status: 200,
  });
});

export { uploadVideo, deleteVideo };
