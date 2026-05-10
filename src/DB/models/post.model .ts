import mongoose, { Types } from "mongoose";
import { Allow_Comment_Enum, Availability_Enum } from "../../common/enum/post.enum";






export interface IPost {
    content?: string,
    attachments?: string[],

    createdBy: Types.ObjectId,

    tags?: Types.ObjectId[],
    likes?: Types.ObjectId[]

    allowComment?: Allow_Comment_Enum,
    availability?: Availability_Enum,

    folderId: string,

    friends:Types.ObjectId[]
}


const postSchema = new mongoose.Schema<IPost>(
    {
        content:{type:String ,min:1 , required:function(this)
            {
                return ! this.attachments?.length
            }
        },

        attachments:[String],

        createdBy:{type:Types.ObjectId , ref:"user" , required:true},

        tags:{type:Types.ObjectId , ref:"user" },
        likes:{type:Types.ObjectId , ref:"user"},

        allowComment:{type:String , enum:Allow_Comment_Enum , default:Allow_Comment_Enum.allow},
        availability:{type:String , enum:Availability_Enum , default:Availability_Enum.public},

        folderId: String,

        friends:[{type:Types.ObjectId , ref:"user"}]


        
        
    
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strict:true,
        strictQuery: true
    }
);



// postSchema.pre("findOne" , function ()
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


const postModel = mongoose.models.Post || mongoose.model<IPost>("Post" , postSchema)

export default postModel