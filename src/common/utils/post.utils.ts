import { Types } from "mongoose"
import { Availability_Enum } from "../enum/post.enum.js"
import { Request } from "express"

export const AvailabilityPost = (req: Request) => {
    const user = req.user as any;
    return {
        $or: [
            { availability: Availability_Enum.public },
            { availability: Availability_Enum.only_me, createdBy: req.user?._id! },
            { availability: Availability_Enum.friends, createdBy: { $in: [req.user?._id!, ...(user?.friends || [])] } },
            { tags: { $in: [req.user?._id] } }
        ]
    }
}