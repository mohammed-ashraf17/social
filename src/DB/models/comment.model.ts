import mongoose, { Types } from "mongoose";
import { onModel_enum } from "../../common/enum/post.enum";





export interface IComment {
    content?: string,
    attachments?: string[],

    createdBy: Types.ObjectId,

    tags?: Types.ObjectId[],
    likes?: Types.ObjectId[]

    folderId: string,
    refId:Types.ObjectId,
    onModel:onModel_enum,

}


const commentSchema = new mongoose.Schema<IComment>(
    {
        content:{type:String ,min:1 , required:function(this)
            {
                return ! this.attachments?.length
            }
        },

        attachments:[String],

        createdBy:{type:Types.ObjectId , ref:"user" , required:true},
        refId:{type:Types.ObjectId , refPath:"onModel" , required:true},
        onModel:{type:String , enum: onModel_enum , required:true},

        // commentId:{type:Types.ObjectId , ref:"Comment" },


        tags:[{type:Types.ObjectId , ref:"user" }],
        likes:[{type:Types.ObjectId , ref:"user"}],

        folderId: String,        
    
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strict:true,
        strictQuery: true
    }
);

commentSchema.virtual("replies", {
    ref: "Comment",
    localField: "_id",
    foreignField: "refId",
  // justOne: false
})


// CommentSchema.pre("findOne" , function ()
// {
//     console.log("...............pre findOne hook1.............");
//     console.log(this.getQuery());
//     const {paranoid,...rest} = this.getQuery()
//     console.log({rest});
//     if(paranoid == false)
//     {
//         this.setQuery({...rest})
//     }
//     else
//     {
//         this.setQuery({...rest , deletedAt:{$exists:false}})
//     }
// })


const CommentModel = mongoose.models.Comment || mongoose.model<IComment>("Comment" , commentSchema)

export default CommentModel