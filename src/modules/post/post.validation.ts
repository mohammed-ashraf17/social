import * as z from "zod"
import { Allow_Comment_Enum, Availability_Enum } from "../../common/enum/post.enum"
import { GeneralRules } from "../../common/utils/generalRuels"

export const createPostSchema:any = {
    body:z.strictObject({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        tags: z.array(GeneralRules.id).optional(),

        allowComment: z.enum(Allow_Comment_Enum).default(Allow_Comment_Enum.allow),
        availability: z.enum(Availability_Enum).default(Availability_Enum.friends)
    
}).superRefine((args , ctx)=>
{
    if(!args.content && !args.attachments?.length)
    {
        ctx.addIssue(
            {
                code:"custom",
                path:["content"],
                message:"content is requierd"
            }
        )
    }

    if(args?.tags)
    {
        const uniqeTags = new Set(args.tags)
        if(args.tags.length !== uniqeTags.size)
        {
            ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"Duplicate tags"
            })
        }
    }
})
}

export const likePostSchema:any = {
    params:z.strictObject({
    postId: GeneralRules.id
    
})
}


export const updatePostchema:any = {
    body:z.strictObject({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        removeFiles:z.array(z.string()).optional(),
        tags: z.array(GeneralRules.id).optional(),
        removeTags: z.array(GeneralRules.id).optional(),
        allowComment: z.enum(Allow_Comment_Enum).default(Allow_Comment_Enum.allow),
        availability: z.enum(Availability_Enum).default(Availability_Enum.friends)
    
}).superRefine((args , ctx)=>
{
    if(args?.tags)
    {
        const uniqeTags = new Set(args.tags)
        if(args.tags.length !== uniqeTags.size)
        {
            ctx.addIssue({
                code:"custom",
                path:["tags"],
                message:"Duplicate tags"
            })
        }
    }
}),


}