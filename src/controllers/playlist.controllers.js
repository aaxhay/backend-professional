import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";
import mongoose from "mongoose";

const createPlaylist = asyncHandler(async (req, res) => {
  // getting the name of the playlist from req.body
  const { playlistName } = req.body;
   
  // checking if its undefined or null
  if (!playlistName) {
    throw new ApiError(400, "playlist Name is not found");
  }

  // creating a playlist 
  const playlist = await Playlist.create({
    playlistName,
    ownerOfPlaylist : req.user?._id
  });

  // checking if playlist is succesfully created or not
  if (!playlist) {
    throw new ApiError(400, "Playlist is not created");
  }
  
  // returning response
  return res.status(200).json({
    message:
      "Playlist created successfully now you can add video to this Playlist",
    // data: playlist,
    status: 200,
  });
});



export {createPlaylist}