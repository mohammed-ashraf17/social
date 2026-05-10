import * as z from "zod"
import { Types } from "mongoose"



export const GeneralRules = {
    id:z.string().refine((value)=>
            {
                return Types.ObjectId.isValid(value)
            },{
                message:"inValid id"
            }).optional(),

            file: z.object({
                fieldname: z.string(),
                originalname: z.string(),
                encoding: z.string(),
                mimetype: z.string(),
                // destination: z.string(),
                // filename: z.string(),
                buffer:z.string().optional(),
                path: z.string().optional(),
                size: z.number(),
                })
                
}