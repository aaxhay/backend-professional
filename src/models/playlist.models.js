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
  },
  { timestamps: true },
);

export const Playlist = mongoose.model("Playlist", playlistSchema);
