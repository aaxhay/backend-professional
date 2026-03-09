import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Playlist } from "../models/playlist.models.js";

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
    ownerOfPlaylist: req.user?._id,
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

const getAllPlaylists = asyncHandler(async (req, res) => {
  // getting all the playlist data from database by using find()
  const allPlaylist = await Playlist.find();

  // checking if we are getting anything from the database or not
  if (!allPlaylist) throw new ApiError(400, "there are no playlists");

  // returning response [all the playlists]
  return res.status(200).json({
    status: 200,
    message: "all playlists are fetched",
    data: allPlaylist,
  });
});

const searchPlaylist = asyncHandler(async (req, res) => {
  // searching for playlists and taking search as a parameter
  const { search } = req.params;

  //checking if we are actually getting search field or not --- (is it null or undefined)
  if (!search) {
    throw new ApiError(
      400,
      "there is nothing to search || search parameter is empty",
    );
  }

  // searching by using the find function and using another feature which we have in mongoose which is regex and for case insenstive = "i"
  const searchedPlaylists = await Playlist.find({
    playlistName: {
      $regex: search.trim(),
      $options: "i",
    },
  });

  // checking if we got the searched playlist or not
  if (!searchPlaylist) {
    throw new ApiError(400, "playlist you are searching is not there!");
  }

  // returning the response
  return res.status(200).json({
    status: 200,
    message: "All the searched playlists are here for you",
    data: searchedPlaylists,
  });
});

const deletePlaylist = asyncHandler(async (req, res) => {
  // taking a playlist id for the deletion of the playlist
  const { playlistId } = req.params;

  // checking if we are getting the playlist id or not
  if (!playlistId)
    throw new ApiError(400, "playlistId is not there || undefined or null");

  // querying the database on the basis of id
  const foundPlaylist = await Playlist.findById(playlistId);

  // checking the we actually found the playlist or not
  if (!foundPlaylist)
    throw new ApiError(400, "Playlist you wanted to delete is not there!");

  // console.log(foundPlaylist);

  // checking that the playlist that user deleting is its own playlist
  if (foundPlaylist.ownerOfPlaylist.toString() !== req.user?._id.toString()) {
    throw new ApiError(400, "you cannot delete this playlist");
  }

  // deleting the playlist from the database
  await Playlist.findByIdAndDelete(playlistId);

  // returning the response
  return res.status(200).json({
    status: 200,
    message: "Playlist deleted successfully",
  });
});

const addToPlaylist = asyncHandler(async (req, res) => {
  // taking videoId and playlistId
  const { videoId, playlistId } = req.params;

  // console.log(videoId,playlistId);

  // checking if both should be there
  if (!(videoId && playlistId)) {
    throw new ApiError(400, "All the fields are required");
  }

  // finding the playlist via playlistId
  const foundPlaylist = await Playlist.findById(playlistId);

  //checking if we actually got the playlist or not
  if (!foundPlaylist) {
    throw new ApiError(400, "There is no such playlist");
  }

  // only playlist creator can add videos to that particular playlist
  if (foundPlaylist.ownerOfPlaylist.toString() !== req.user?._id.toString())
    throw new ApiError(
      400,
      "this is not your playlist you can't add video to other's playlist",
    );

  // pushing the data as its an array
  foundPlaylist.data.push(videoId);

  // manually saving it because we've manually added video in playlist
  await foundPlaylist.save();

  //returning the response
  return res.status(200).json({
    status: 200,
    message: "Added to playlist",
  });
});

export {
  createPlaylist,
  getAllPlaylists,
  searchPlaylist,
  deletePlaylist,
  addToPlaylist,
};
