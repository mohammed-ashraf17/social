
import type { NextFunction , Request , Response } from "express"
import successResponse from "../../common/utils/success_respons/success.respons"
import postRepository from "../../DB/repositories/post.repository"
import RedisService from "../../common/service/redis.service";
import TokenService from "../../common/utils/token/token.service";
import { S3Service } from "../../common/service/s3.service";
import notificationService from "../../common/service/notification.service";
import { createPostDto, updatePostDto } from "./post.dto";
import { AppError } from "../../common/utils/global-error/global-error-handler";
import { Types } from "mongoose";
import { randomUUID } from "node:crypto";
import { Store_Enum } from "../../common/enum/multer.enum";
import UserRepository from "../../DB/repositories/user.repository";
import { Availability_Enum } from "../../common/enum/post.enum";
import { AvailabilityPost } from "../../common/utils/post.utils";





class postServies {

    private readonly _postModel = new postRepository()
    private readonly _userModel = new UserRepository()
    private readonly _s3Service = new S3Service()
    private readonly _redisService =  RedisService
    private readonly _tokenService =  TokenService
    private readonly _notificationService =  notificationService


    constructor() {}


    createPost = async (req: Request , res : Response , next : NextFunction)=>
{

        const{availability , allowComment , tags ,  content}:createPostDto= req.body

        let mentions:Types.ObjectId[] = []
        let fcmTokens : string[] = []
        

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

        for (const mention of mentionTags) {
                mentions.push(mention._id);
                (await this._redisService.getFCMs(mention._id)).map((token)=> fcmTokens.push(token))
            }


            let urls: string[] = []
            let folderId = randomUUID()
            if(req?.files)
            {
            urls = await this._s3Service.uploadFiles(
        {
            files:req.files as Express.Multer.File[],
            path:`users/${req.user._id}/posts/${folderId}`,
            store_type:Store_Enum.disk
        }
    )
            }

            const post = await this._postModel.create(
                {
                    content:content!,
                    createdBy:req?.user?._id!,
                    tags:mentions,
                    attachments:urls,
                    allowComment,
                    availability
                }
            )

            if(!post)
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

    successResponse({res , data:post})
}

    getPost = async (req: Request , res : Response , next : NextFunction)=>
{
    
    const post = await this._postModel.paginate(
        {
            page:+req?.query?.page!,
            limit:+req?.query?.limit!,
            search:{...AvailabilityPost(req),...(req.query?.search ? {
                $or:[
                    {content:{$regex:req.query?.search , $options:"i"}}
                ]
            }:
                {}
            )}
        }
    )
    successResponse({res , data:post })
}


    likePost = async (req: Request , res : Response , next : NextFunction)=>
{
    const {postId} = req.params
    const { flag } = req.query

let updateQuery: any = {
    $addToSet: { likes: req.user?._id }
}

if (flag && flag === "disLike") {
    updateQuery = {
        $pull: { likes: req.user?._id }
    }
}

    const post = await this._postModel.findOneAndUpdate(
        {
            filter:{
                _id:postId,
                ...AvailabilityPost(req)
            },
            update:{
                $addToSet:updateQuery

            }
        }
    )

    if(!post)
    {
        throw new AppError("post not found")
    }

    successResponse({res ,data:post })
}


    updatePost = async (req: Request, res: Response, next: NextFunction) => {
    const { postId } = req.params
    const {
    availability,
    allowComment,
    tags,
    content,
    removeTags,
    removeFiles
    }: updatePostDto = req.body

    const post = await this._postModel.findOne({
    filter: {
        _id: postId,
        createdBy: req?.user._id
    }
    })

    if (!post) {
    throw new AppError("Post not found or Not authorized", 404)
    }


    if (removeFiles?.length) {
    const invalidFiles = removeFiles.filter(
        (file: string) => !post.attachments?.includes(file)
    )

    if (invalidFiles.length) {
        throw new AppError("Invalid files to remove")
    }

    await this._s3Service.deleteFiles(removeFiles)

    post.attachments = post.attachments?.filter(
        (file: string) => !removeFiles.includes(file)
    ) as string[]
    }

    const updateTags = new Set(post?.tags?.map(id => id.toString()))

    removeTags?.forEach((tag: string) => updateTags.delete(tag))

    let fcmTokens: string[] = []

    if (tags?.length) {

    const mentionTags = await this._userModel.find({
        filter: {
        _id: { $in: tags }
        }
    })

    if (tags.length !== mentionTags.length) {
        throw new AppError("inValid tag id")
    }

    
    const fcmSet = new Set<string>()

    for (const tag of mentionTags) {
        if (tag._id.toString() === req.user._id.toString()) {
        throw new AppError("You can't tag yourself")
        }

        updateTags.add(tag._id.toString())


        const tokens = await this._redisService.getFCMs(tag._id)

        tokens?.forEach((t: string) => fcmSet.add(t))
    }

    fcmTokens = Array.from(fcmSet)
    }

    post.tags = [...updateTags].map((id: string) => new Types.ObjectId(id))


    if (req?.files?.length) {
    const urls = await this._s3Service.uploadFiles({
        files: req.files as Express.Multer.File[],
        path: `users/${req.user._id}/posts/${post.folderId}`,
        store_type: Store_Enum.memory
    })

    post.attachments?.push(...urls)
    }


    if (content) post.content = content
    if (allowComment !== undefined) post.allowComment = allowComment
    if (availability) post.availability = availability

    await post.save()


    if (fcmTokens.length) {
    await this._notificationService.sendNonifications({
        tokens: fcmTokens,
        data: {
        title: "New Post Update",
        body: `${req.user.userName} has updated a post and mentioned you.`
        }
    })
    }

    successResponse({ res, data: post })
}
}



export default new postServies()