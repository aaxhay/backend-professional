import mongoose , {Schema} from "mongoose"
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = Schema({});


commentSchema.plugins(mongooseAggregatePaginate);

export const Comment = mongoose.model("Comment",commentSchema)