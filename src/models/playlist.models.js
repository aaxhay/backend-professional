import mongoose , {Schema} from "mongoose";

const playlistSchema = Schema({});

export const Playlist = mongoose.model("Playlist",playlistSchema);