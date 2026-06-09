import type { NextFunction , Request , Response } from "express"
import UserRepository from "../../DB/repositories/user.repository"
import { S3Service } from "../../common/service/s3.service"
import redisService from "../../common/service/redis.service"
import tokenService from "../../common/utils/token/token.service"
import notificationService from "../../common/service/notification.service"
import { AppError } from "../../common/utils/global-error/global-error-handler"
import chatRepository from "../../DB/repositories/chat.repository"
import successResponse from "../../common/utils/success_respons/success.respons"
import { Server, Socket } from "socket.io";

class ChatService {

        private readonly _userModel = new UserRepository()
        private readonly _s3Service = new S3Service()
        private readonly _chatModel = new chatRepository()
        private readonly _redisService =  redisService
        private readonly _tokenService =  tokenService
        private readonly _notificationService =  notificationService
    constructor() {}

    getChat = async(req: Request , res : Response , next : NextFunction)=>
    {
        const {userId} = req.params

        const chat = await this._chatModel.findOne(
            {
                filter:
                {
                    participants:{$all:[req.user?._id , userId]},
                    group:{$exists:false}
                },
                options: {
                    populate: [
                    {
                            path: "participants"
                    }
                    ]
}
            }
        )
        
        if(!chat)
        {
            throw new AppError("Chat not found" , 400)
        }

        successResponse({res ,message:"Done", data:{ chat }})


}

    //Socket io

        hi2 = async (data: any) => {

        console.log(data);
    }

        sendMessage = async (data: any , socket:Socket , io: Server) => {

        const { sendTo, content } = data
        const createdBy = socket.data.user._id
        const user = await this._userModel.findOne({ filter: { _id: sendTo } });
        if (!user) throw new AppError("user not exist");

        const chat = await this._chatModel.findOneAndUpdate({
            filter: {
                participants: { $all: [sendTo , createdBy] },
                group: {$exists: false},
            },
            
            update: {
                $push: {
                    messages: {
                        content,
                        createdBy
                    }
                }
            }
        })

        if (!chat) {
            await this._chatModel.create({
                createdBy,
                participants: [sendTo , createdBy],
                messages: [
                    {
                        content,
                        createdBy
                    }
                ]
            })
    }

    io.to(await redisService.getSockets(createdBy)).emit("successMessage", { content })
    io.to(await redisService.getSockets(sendTo)).emit("newMessage", { content , from:socket.data.user })

}
}

export default new ChatService()