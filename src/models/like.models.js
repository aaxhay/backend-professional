import mongoose ,{Schema} from "mongoose";
import { Tweet } from "./tweet.models";

const likeSchema = Schema({
    video : {
        type : Schema.Types.ObjectId,
        ref : "Video"
    },
    tweet : {
        type : Schema.Types.ObjectId,
        ref : "Tweet"
    },
    comment : {
        type : Schema.Types.ObjectId,
        ref : "Comment"
    },
    likedBy : {
        type : Schema.Types.ObjectId,
        ref : "User"
    },

    
},{timestamps : true})

export const Like = mongoose.model("Like",likeSchema)