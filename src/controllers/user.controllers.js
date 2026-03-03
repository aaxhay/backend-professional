import { User } from "../models/user.models.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const generateRefreshAndAccessToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save();
  return { accessToken, refreshToken };
};

const registerUser = asyncHandler(async (req, res) => {
  // get data from frontend
  const { username, email, password, fullName } = req.body;
  //   console.log(email);

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

  if (!avatarLocalPath) {
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
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  if (!createdUser) {
    throw new ApiError(500, "User not created because of some server issues");
  }

  // return res
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User Created Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  // get the data from req.body
  const { username, email, password } = req.body;

  // validate the data
  // -- alternative for more industry grade
  // if([username,email,password].some((fields)=>fields?.trim() === "")){
  //   throw new ApiError(400,"all the fields are required for login")
  // }

  if (!username || !email) {
    throw new ApiError(400, "username or email is required for login");
  }

  //find the user and check if user exists or not
  const foundUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (!foundUser) {
    throw new ApiError(400, "User doesn't exist with this email or username");
  }

  // compare password or valid password
  const isPasswordValid = await foundUser.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid User Credential");
  }
  // generate refreshToken and accessToken
  const { accessToken, refreshToken } = await generateRefreshAndAccessToken(
    foundUser._id,
  );

  const loggedInUser = await User.findById(foundUser._id).select(
    "-password -refreshToken",
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  // send Cookie
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User Logged in Sucessfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true },
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, "User logged out Successfully"));
});

export { registerUser, loginUser, logOutUser };
