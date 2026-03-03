import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const registerUser = asyncHandler(async (req, res) => {
  // get data from frontend
  const { username, email, password, fullName } = req.body;
//   console.log(req.body);
  
  // validate user fields - not empty
  if (
    [email, password, username, fullName].some(
      (fields) => fields?.trim() === "",
    )
  ) {
    throw new ApiError(400, "all fields are required");
  }

  // check if user already exists or not
  const existedUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with this email or username already exists");
  }


  //check file uploads like avatar and coverImage , avatar
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0].path;

  if(!avatarLocalPath){
    throw new ApiError(400, "avatar is required");
  }

    // upload these on cloudinary , avatar and coverImage
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  // check file uploads like avatar and coverImage , avatar
  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  // create user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || " ",
    fullName,
  });

  // check if user object created successfully or not
  const createdUser = await User.findById(user._id).select("-password -refreshToken");

  if(!createdUser){
    throw new ApiError(500,"User not created because of some server issues")
  }

  // return res
  return res.status(201).json(
    new ApiResponse(200,createdUser,"User Created Successfully")
  )
});

export { registerUser };
