import mongoose, { Schema, SchemaType } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
const tweetSchema = Schema(
  {
    content: {
      type: String,
      required: true,
    },
    likes : {
      type : Schema.Types.ObjectId,
      ref : "Like"
    }
  },
  { timestamps: true },
);

tweetSchema.plugins(mongooseAggregatePaginate)

export const Tweet = mongoose.model("Tweet", tweetSchema);
