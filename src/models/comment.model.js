import mongoose,{Schema} from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const commetSchema=new Schema(
    {
        content:{
            type:String,
            required:true,
        },
        video:{
            type:Schema.Types.ObjectId,
            ref:"Video",
        },
        owner:{
            type:Schema.Types.ObjectId,
            ref:"User",
        },
},
{
    timestamps:true
});

commetSchema.plugin(mongooseAggregatePaginate);

export const Comment=mongoose.model("Comment",commetSchema);