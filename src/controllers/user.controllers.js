import { log } from "console";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  destroyFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import jwt from "jsonwebtoken";
import { getPublicIdFromUrl } from "../utils/getPublicIdFromUrl.js";

const generateRefreshAndAccessToken = async (userId) => {
  const user = await User.findById(userId);
  const accessToken = user.generateAccessToken();
  const refreshToken = user.generateRefreshToken();

  user.refreshToken = refreshToken;

  await user.save({ validateBeforeSave: false });
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

  // console.log(avatarLocalPath)

  //handled a situaton where user haven't uploaded the cover image which is also required : false in userSchema
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "avatar is required");
  }

  // upload these on cloudinary , avatar and coverImage
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "avatar is required");
  }

  // create user object
  const user = await User.create({
    username: username.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url,
    fullName,
  });

  // check if user object created successfully or not
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  console.log(createdUser);

  if (!createdUser) {
    throw new ApiError(500, "User not created because of some server issues");
  }

  // return res
  return res.json({
    message: "user created sucessfully",
    status: 200,
  });
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

  // console.log(foundUser);

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

  // console.log(accessToken);

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
    .json({
      message: "user Logged in successfully",
      status: 201,
      data: { accessToken: accessToken, refreshToken, loggedInUser },
    });

  // return res.json({
  //   message : "user logged in successfully",
  //   status : 201
  // })
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
    .json({
      message: "user logged out successfully",
      status: 201,
    });
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  try {
    const incomingRefreshToken =
      req.cookies?.refreshToken || req.body.refreshToken;

    //checking if we got the token or not
    if (!incomingRefreshToken) {
      throw new ApiError(400, "unauthorized access");
    }

    // extract the token information from the token
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    //queried the user
    const user = await User.findById(decodedToken?._id);

    // checking if user exists or not
    if (!user) {
      throw new ApiError(404, "User Not Found");
    }

    //equating the tokens
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "refresh token is expired or used");
    }

    // generating both the tokens
    const { accessToken, newRefreshToken } =
      await generateRefreshAndAccessToken(user._id);

    const options = {
      httpOnly: true,
      secure: true,
    };

    // ending response
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json({
        status: 200,
        data: { accessToken, refreshToken: newRefreshToken },
        message: "Access Token Refreshed",
      });
  } catch (error) {
    throw new ApiError(400, error?.message);
  }
});

const updateAvatarImage = asyncHandler(async (req, res) => {
  const avatarLocalFilePath = req.file?.path;

  if (!avatarLocalFilePath) {
    throw new ApiError(400, "Unable to get the avatar path");
  }

  const avatar = await uploadOnCloudinary(avatarLocalFilePath);

  if (!avatar) {
    throw new ApiError(400, "not able to get avatar url");
  }

  //extracted public id from the response url via a util function
  const publicID = getPublicIdFromUrl(req.user.avatar);

  //deleted the existing cover image which was saved in our database before this operation
  await destroyFromCloudinary(publicID);

  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: avatar.url,
      },
    },
    { new: true },
  ).select("-password");

  return res.status(200).json({
    status: 200,
    message: "Avatar Updated Successfully",
  });
});

const updateCoverImage = asyncHandler(async (req, res) => {
  // got cover image from middleware upload via req.file
  const coverImageLocalFilePath = req.file?.path;

  // checking for some errors about undefined
  if (!coverImageLocalFilePath) {
    throw new ApiError(400, "Unable to get the Cover Image path");
  }

  // uploaded on cloudinary
  const coverImage = await uploadOnCloudinary(coverImageLocalFilePath);

  // Again checking for some usual error for safe side if we actually got the cloudinary url or not
  if (!coverImage) {
    throw new ApiError(400, "not able to get cover Image url");
  }

  //extracted public id from the response url via a util function
  const publicID = getPublicIdFromUrl(req.user.coverImage);

  //deleted the existing cover image which was saved in our database before this operation
  await destroyFromCloudinary(publicID);

  // querying user and updating at the same while excluding the password field
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        coverImage: coverImage?.url,
      },
    },
    { new: true },
  ).select("-password");

  // sending response
  return res.status(200).json({
    status: 200,
    message: "Cover Image Updated Successfully",
  });
});

const updateUserDetails = asyncHandler(async (req, res) => {
  // got the data from req.body
  const { fullName, email } = req.body;

  console.log(fullName,email);
  

  // usual checks for handling the undefined or null situations
  if (!(fullName || email)) {
    throw new ApiError(400, "All fields are required");
  }

  // querying the user and updating at the same time while excluding the password
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName,
        email,
      },
    },
    { new: true },
  ).select("-password");

  // again checking for user exists or not for betterment
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // sending response
  return res.status(200).json({
    message: "Fields Updated Successfully",
    status: 200,
  });
});

const changePassword = asyncHandler(async (req, res) => {
  // taking the neccessary from req.body or from user
  const { oldPassword, newPassword, confirmPassword } = req.body;

  // checking if user entered new both fields the same or not
  if (!(newPassword === confirmPassword)) {
    throw new ApiError(400, "incorrect password");
  }

  // querying the user
  const user = await User.findById(req.user?._id);

  // checking for the old password is correct or not
  const isPassword = await user.isPasswordCorrect(oldPassword);

  //handling the error or undefined situation
  if (!isPassword) {
    throw new ApiError(400, "incorrect password");
  }

  // updating the password field
  user.password = newPassword;

  // saving the user with updated password
  await user.save();

  // returning the response
  return res.status(200).json({
    message: "password changed successfully",
    status: 200,
  });
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // directly returning the response as we have user in our request via middleware injection
  return res.status(200).json({
    message: "Got Current User",
    data: req.user,
    status: 200,
  });
});

const getUserChannelProfile = asyncHandler(async (req, res) => {
  // got username from params
  const { username } = req.params;

  // checking if username is undefined or not and removing spaces if exists
  if (!username.trim()) {
    throw new ApiError(400, "username is not fetched properly");
  }

  // finding user channel profile by using some professionl aggregation pipelining
  const channel = await User.aggregate([
    {
      $match: { username: username?.toLowerCase() },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "channel",
        as: "subscribers",
      },
    },
    {
      $lookup: {
        from: "subscriptions",
        localField: "_id",
        foreignField: "subscriber",
        as: "subscribedTo",
      },
    },
    {
      $addFields: {
        subscribersCount: {
          $size: "$subscribers",
        },
        channelsSubscribedToCount: {
          $size: "$subscribedTo",
        },
        isSubscribed: {
          $cond: {
            $if: { $in: [req.user?._id, "$subscribers.subscribe"] },
            $then: true,
            $else: false,
          },
        },
      },
    },
    {
      $project: {
        fullName: 1,
        username: 1,
        email: 1,
        subscribersCount: 1,
        channelsSubscribedToCount: 1,
        isSubscribed: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);

  if (!channel?.length) {
    throw new ApiError(
      400,
      "some problem raised during getting the user channel profile",
    );
  }

  return res.status(200).json({
    message: "User Channel Profile Fetched Successfully",
    data: channel[0],
    status: 200,
  });
});

export {
  registerUser,
  loginUser,
  logOutUser,
  refreshAccessToken,
  updateAvatarImage,
  updateCoverImage,
  updateUserDetails,
  changePassword,
  getCurrentUser,
  getUserChannelProfile,
};
