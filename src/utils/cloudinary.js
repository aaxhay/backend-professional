import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { ApiError } from "./ApiError.js";

// cloudinary.config({
//   cloud_name:"dojdsblan", //process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: "441564532749167",//process.env.CLOUDINARY_API_KEY,
//   api_secret:"gylctVKrUeccs4aMR9q6JwFcZfQ",//process.env.CLOUDINARY_API_SECRET,
// });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    // console.log("file uploaded on cloudinary successfully", response.url);
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

const destroyFromCloudinary = async (localFilePath,options = {}) => {
  try {
    if (!localFilePath) return null;
    const response = await cloudinary.uploader.destroy(localFilePath,options);
    return response;
  } catch (error) {
    console.log(error?.message);
    throw new ApiError(400,error?.message);
  }
};

export { uploadOnCloudinary ,destroyFromCloudinary};
