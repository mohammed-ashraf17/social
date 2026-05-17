import * as z from "zod"
import { commentReplySchema, createCommentSchema } from "./comment.validation"



export type createCommentDto = z.infer<typeof createCommentSchema.body>
export type commentReplyDto = z.infer<typeof commentReplySchema.body>

