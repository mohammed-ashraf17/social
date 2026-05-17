
import type { NextFunction, Request, Response } from "express"
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
import CommentRepository from "../../DB/repositories/comment.repository";





class postServies {

    private readonly _postModel = new postRepository()
    private readonly _userModel = new UserRepository()
    private readonly _commentModel = new CommentRepository()

    private readonly _s3Service = new S3Service()
    private readonly _redisService = RedisService
    private readonly _tokenService = TokenService
    private readonly _notificationService = notificationService


    constructor() { }


    createPost = async (req: Request, res: Response, next: NextFunction) => {

        const { availability, allowComment, tags, content }: createPostDto = req.body

        let mentions: Types.ObjectId[] = []
        let fcmTokens: string[] = []

        if (tags.length) {
            const mentionTags = await this._userModel.find(
                {
                    filter:
                    {
                        _id: { $in: tags }
                    }
                }
            )

            if (tags.length !== mentionTags.length) {
                throw new AppError("inValid tag id")
            }

            for (const tag of mentionTags) {
                if (tag._id.toString() == req.user?._id.toString()) {
                    throw new AppError("you can not mention to your self")
                }
                mentions.push(tag._id);
                (await this._redisService.getFCMs(tag._id)).map((token) => fcmTokens.push(token))
            }
        }

        let urls: string[] = []
        let folderId = randomUUID()
        if (req?.files) {
            urls = await this._s3Service.uploadFiles(
                {
                    files: req.files as Express.Multer.File[],
                    path: `users/${req.user._id}/posts/${folderId}`,
                    store_type: Store_Enum.disk
                }
            )
        }

        const post = await this._postModel.create(
            {
                content: content!,
                createdBy: req?.user?._id!,
                tags: mentions,
                attachments: urls,
                allowComment,
                availability
            }
        )

        if (!post) {
            await this._s3Service.deleteFiles(urls)
            throw new AppError("fail to create post")
        }

        if (fcmTokens?.length) {
            await this._notificationService.sendNonifications(
                {
                    tokens: fcmTokens,
                    data:
                    {
                        title: "you are mention on new post",
                        body: content || ""
                    }
                }
            )
        }

        successResponse({ res, data: post })
    }

    getPost = async (req: Request, res: Response, next: NextFunction) => {

        // const post = await this._postModel.paginate(
        //     {
        //         page:+req?.query?.page!,
        //         limit:+req?.query?.limit!,
        //         search:{...AvailabilityPost(req),...(req.query?.search ? {
        //             $or:[
        //                 {content:{$regex:req.query?.search , $options:"i"}}
        //             ]
        //         }:
        //             {}
        //         )}
        //     }
        // )

        const posts = await this._postModel.find(
            {
                filter:
                {
                    ...AvailabilityPost(req)

                },
                options:
                {
                    populate: [
                        {
                            path: "comments",
                            match: {
                                commentId: { $exists: false }
                            },
                            populate: [{ path: "replies" }]
                        }
                    ]
                }
            }
        )

        // let doc = []

        // for (const post of posts) {

        //     const comments = await this._commentModel.find({
        //         filter: {
        //             postId: post._id
        //         }
        //     })
        //     doc.push({ ...post.toObject(), comments })

        // }
        successResponse({ res, data: posts })
    }


    likePost = async (req: Request, res: Response, next: NextFunction) => {
        const { postId } = req.params
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
                filter: {
                    _id: postId,
                    ...AvailabilityPost(req)
                },
                update: {
                    $addToSet: updateQuery

                }
            }
        )

        if (!post) {
            throw new AppError("post not found")
        }

        successResponse({ res, data: post })
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
        }: updatePostDto = req.body ?? {}

        const post = await this._postModel.findOne({
            filter: {
                _id: postId,
                createdBy: req?.user?._id!
            }
        })

        if (!post) {
            throw new AppError("Post not found or Not authorized", 404)
        }


        if (removeFiles?.length) {
            const invalidFiles = removeFiles.filter(
                (file: string) => {
                    return !post.attachments?.includes(file)
                })

            if (invalidFiles?.length) {
                throw new AppError("Invalid files to remove")
            }

            await this._s3Service.deleteFiles(removeFiles)

            post.attachments = post.attachments?.filter(
                (file: string) => {
                    return !removeFiles.includes(file)
                }
            ) as string[]
        }
        const safeTags = Array.isArray(post?.tags) ? post.tags : []

        const updateTags = new Set(
            safeTags.map(id => id.toString())
        )

        removeTags?.forEach((tag: string) => {
            return updateTags.delete(tag)
        })

        let fcmTokens: string[] = []

        if (tags?.length) {
            const mentionTags = await this._userModel.find(
                {
                    filter:
                    {
                        _id: { $in: tags }
                    }
                }
            )

            if (tags.length !== mentionTags.length) {
                throw new AppError("inValid tag id")
            }

            for (const tag of mentionTags) {
                if (tag._id.toString() == req.user?._id.toString()) {
                    throw new AppError("you can not mention to your self")
                }
                updateTags.add(tag._id.toString());
                ((await this._redisService.getFCMs(tag._id)).map((token) => {
                    fcmTokens.push(token)
                }))
            }
            post.tags = [...updateTags].map((id: string) => new Types.ObjectId(id))
        }

        if (req?.files?.length) {
            let urls = await this._s3Service.uploadFiles(
                {
                    files: req.files as Express.Multer.File[],
                    path: `users/${req.user._id}/posts/${post.folderId}`,
                    store_type: Store_Enum.disk
                })
            post.attachments?.push(...urls)
        }

        if (fcmTokens?.length) {
            await this._notificationService.sendNonifications(
                {
                    tokens: fcmTokens,
                    data:
                    {
                        title: "you are mention on new post",
                        body: content || ""
                    }
                }
            )
        }

        if (content) post.content = content
        if (availability) post.availability = availability
        if (allowComment) post.allowComment = allowComment


        await post.save()

        successResponse({ res, data: post })
    }

  deletePost = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const { postId } = req.params;

        const post = await this._postModel.findOneAndDelete({
            filter: {
                _id: postId,
                createdBy: req.user._id
            }
        });

        if (!post) {
            throw new AppError(
                "post not found or not authorized",
                404
            );
        }

        // delete post attachments from s3
        if (post.attachments?.length) {
            await this._s3Service.deleteFiles(
                post.attachments
            );
        }

        // delete comments related to post
        await this._commentModel.deleteMany({
            filter: {
        postId: post._id
    }
        });

        return successResponse({
            res,
            message: "post deleted successfully"
        });

    } catch (error) {
        next(error);
    }
};
}



export default new postServies()