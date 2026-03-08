import mongoose, { Schema } from "mongoose";

const playlistSchema = Schema(
  {
    playlistName: {
      type: String,
      required: true,
    },
    data: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    ownerOfPlaylist: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    isPublicOrNot: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
