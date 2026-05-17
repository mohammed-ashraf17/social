import * as z from "zod"
import { GeneralRules } from "../../common/utils/generalRuels"
import { onModel_enum } from "../../common/enum/post.enum"

export const createCommentSchema:any = {
    body:z.strictObject({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        tags: z.array(GeneralRules.id).optional(),
        onModel : z.enum(onModel_enum)
    
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
}),

    params : z.strictObject(
        {
            postId: GeneralRules.id,
            commentId:GeneralRules.id.optional()
        }
    )
}

export const commentReplySchema:any = {
    body:z.object({
        content: z.string().optional(),
        attachments : z.array(GeneralRules.file).optional(),
        tags: z.array(GeneralRules.id).optional(),
    
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
}),

    params : z.object(
        {
            postId: GeneralRules.id,
            commentId:GeneralRules.id
        }
    )
}




