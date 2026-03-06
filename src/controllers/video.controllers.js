import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Video } from "../models/video.models.js";


const uploadVideo = asyncHandler(async (req, res) => {
  // get all the infomation via req.body
  const { title, description } = req.body;

//   console.log(req.body);
  console.log(Object.keys(req.body));
  

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
//   const owner = await Video.aggregate([
//   {
//     $match: {
//       owner: new mongoose.Types.ObjectId(req.user?._id),
//     },
//   },
//   {
//     $lookup: {
//       from: "users",
//       localField: "owner",
//       foreignField: "_id",
//       as: "owner",
//       pipeline: [
//         {
//           $project: {
//             username: 1,
//             email: 1,
//             fullName: 1,
//           },
//         },
//       ],
//     },
//   },
//   {
//     $addFields: {
//       owner: {
//         $first: "$owner",
//       },
//     },
//   },
// ]);

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

export {uploadVideo}