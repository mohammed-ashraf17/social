import {  onModel_enum } from './../../common/enum/post.enum';

import type { NextFunction , Request , Response } from "express"
import successResponse from "../../common/utils/success_respons/success.respons"
import postRepository from "../../DB/repositories/post.repository"
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token/token.service";
import { S3Service } from "../../common/service/s3.service";
import notificationService from "../../common/service/notification.service";
import { AppError } from "../../common/utils/global-error/global-error-handler";
import { HydratedDocument, Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { Store_Enum } from "../../common/enum/multer.enum";
import UserRepository from "../../DB/repositories/user.repository";
import CommentRepository from "../../DB/repositories/comment.repository";
import { createCommentDto } from "./comment.dto";
import { AvailabilityPost } from "../../common/utils/post.utils";
import { Allow_Comment_Enum } from "../../common/enum/post.enum";
import { IPost } from '../../DB/models/post.model ';
import { IComment } from '../../DB/models/comment.model';




class commentServies {

    private readonly _postModel = new postRepository()
    private readonly _userModel = new UserRepository()
    private readonly _commentModel= new CommentRepository()
    private readonly _s3Service = new S3Service()
    private readonly _redisService =  RedisService
    private readonly _tokenService =  TokenService
    private readonly _notificationService =  notificationService


    constructor() {}


    createComment = async (req: Request , res : Response , next : NextFunction)=>
{
        const {postId , commentId} = req.params
        const{ tags = [],  content , onModel}:createCommentDto= req.body
        let doc : HydratedDocument<IPost|IComment> |null = null

        if(onModel === onModel_enum.Post && !commentId)
        {
            doc = await this._postModel.findOne(
            {
                filter:
                {
                    _id:postId,
                    ...AvailabilityPost(req),
                    allowComment: Allow_Comment_Enum.allow

                }
            }
        )

        if(!doc)
        {
            throw new AppError("post not found or you are not allowed to comment on this post")
        }
        }else if(onModel === onModel_enum.Comment && commentId)
        {
            let comment = await this._commentModel.findOne(
            {
                filter:
                {
                    _id:commentId,
                    refId:postId!,

                },
                options:
                {
                    populate:[{path:"refId",
                        match:{
                            $or:[{
                                ...AvailabilityPost(req)
                            }],
                            allowComment:Allow_Comment_Enum.allow
                        }
                    },
                    ],
                    
                }
            }
        )

        if(!comment?.refId)
        {
            throw new AppError("comment not found or you are not allowed to comment on this post")
        }
        doc = comment
        
    }

    if(!doc)
    {
        throw new AppError("inValid omModel value")
    }

        let mentions:Types.ObjectId[] = []
        let fcmTokens : string[] = []
        
        if(tags.length)
        {
            const mentionTags = await this._userModel.find(
            {
                filter:
                {
                    _id:{$in:tags}
                }
            }
        )

        if(tags.length !== mentionTags.length)
        {
            throw new AppError("inValid tag id")
        }

        for (const tag of mentionTags) {
            if(tag._id.toString() == req.user?._id.toString())
            {
                throw new AppError("you can not mention to your self")
            }
                mentions.push(tag._id);
                (await this._redisService.getFCMs(tag._id)).map((token)=> fcmTokens.push(token))
            }
        }

            let urls: string[] = []
            let folderId = randomUUID()
            if(req?.files)
            {
            urls = await this._s3Service.uploadFiles(
        {
            files:req.files as Express.Multer.File[],
            path:`users/${req.user._id}/posts/${doc?.folderId}/comments/${folderId}`,
            store_type:Store_Enum.disk
        }
    )
            }

            const comment = await this._commentModel.create(
                {
                    content:content!,
                    createdBy:req?.user?._id!,
                    tags:mentions,
                    attachments:urls,
                    refId: doc?._id!,
                    onModel
                }
            )

            if(!comment)
                {
                    await this._s3Service.deleteFiles(urls)
                    throw new AppError("fail to create post")
                }

                if(fcmTokens?.length)
                {
                    await this._notificationService.sendNonifications(
                        {
                            tokens:fcmTokens,
                            data:
                            {
                                title:"you are mention on new post",
                                body:content || ""
                            }
                        }
                    )
                }

    successResponse({res , data:comment})
}


deleteComment = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {

        const { commentId } = req.params;

        const comment = await this._commentModel.findOneAndDelete({
            filter: {
                _id: commentId,
                createdBy: req.user._id
            }
        });

        if (!comment) {
            throw new AppError(
                "comment not found or not authorized",
                404
            );
        }

        // delete attachments from s3
        if (comment.attachments?.length) {
            await this._s3Service.deleteFiles(
                comment.attachments
            );
        }

        // delete replies of comment
        await this._commentModel.deleteMany({
            filter: {
                refId: comment._id,
                onModel: onModel_enum.Comment
            }
        });

        return successResponse({
            res,
            message: "comment deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};




}




export default new commentServies()