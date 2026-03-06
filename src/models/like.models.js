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
    
})

export const Like = mongoose.model("Like",likeSchema)