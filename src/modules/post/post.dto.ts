import * as z from "zod"
import { createPostSchema, updatePostchema } from "./post.validation";


export type createPostDto = z.infer<typeof createPostSchema.body>
export type updatePostDto = z.infer<typeof updatePostchema.body>