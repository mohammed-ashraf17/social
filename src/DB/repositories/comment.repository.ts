
import BaseRepository from "./base.repository";
import { Model } from "mongoose";
import CommentModel, { IComment } from "../models/comment.model";




class CommentRepository extends BaseRepository<IComment>
{
    constructor(protected readonly model : Model<IComment>= CommentModel)
    {
        super(model)
    }


}

export default CommentRepository