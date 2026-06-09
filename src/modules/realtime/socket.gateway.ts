import { Server } from "socket.io"
import { Server as HttpServer } from "node:http"

import { decodeToken_and_fetchUser } from "../../common/middleware/authentication"
import redisService from "../../common/service/redis.service"
import { log } from "node:console"
import chatGateway from "../chat/realtime/chat.gateway"


class socketGateway {
    constructor() {}

    initIo= async (httpServer : HttpServer)=>
    {
        const io = new Server(httpServer , {
        cors:
        {
            origin:"*"
        }
    })
    
    io.use(async (socket , next)=>{
        try {
            const { user } = await decodeToken_and_fetchUser(socket.handshake.auth.auth || socket.handshake.headers.auth)
            socket.data.user = user
            next()
        } catch (error: any) {
            console.log("SOCKET AUTH ERROR:", error)
            next(error)
        }
            
        })

        io.on("connection",async(socket)=>{
            redisService.addSocket({userId: socket.data.user._id , socketToken : socket.id})

            console.log({userSocketId:await redisService.getSockets(socket.data.user._id)});

          await chatGateway.registerChatEvents(socket , io)

            socket.on("disconnect" ,async ()=>
            {
                redisService.removeSocket({userId: socket.data.user._id , socketToken : socket.id})
                console.log({userSocketIdAfterDisconnect:await redisService.getSockets(socket.data.user._id)});
            })
            
        })
        
    // io.on("connection",(socket)=>{
    //     console.log(socket.id);


    //     // const connections :string[] = []
    //     // connections.push(socket.id)

    //     socket.on("hi" , (data)=>
    //     {
    //         console.log(data, "default namespace");
    //         console.log(socket.data.user);

    //         // socket.emit("sayHiBackend", {message:"HI POSTMAN1"})//بيبعت للشخص اللي بعت الرسالة فقط
    //         // io.emit("sayHiBackend", {message:"HI POSTMAN2"}) //بيبعت لكل الناس حتى الشخص اللي بعت الرسالة
    //         // socket.broadcast.emit("sayHiBackend", {message:"HI POSTMAN3"}) //بيبعت لكل الناس ماعدا الشخص اللي بعت الرسالة
    //         // socket.to([connections.at(-1)! , connections.at(-2)! ]).emit("sayHiBackend", {message:"HI POSTMAN4"}) //بيبعت لناس معينة مش كل الناس زي ال broadcast
    //         // socket.except(data.id).emit("sayHiBackend", {message:"HI POSTMAN5"}) //بيبعت لكل الناس ماعدا الشخص اللي بعت الرسالة زي ال broadcast بس بطريقة اسهل
    //         // io.except(data.id).emit("sayHiBackend", {message:"HI POSTMAN6"}) //بيبعت لكل الناس ماعدا الشخص اللي بعت الرسالة زي ال broadcast بس بطريقة اسهل وبتشتغل حتى لو الشخص اللي بعت الرسالة مش متصل دلوقتي



    //         // cb("HELLO POSTMAN")
            
    //     })
        
    // })

    // io.of("/admin").on("connection",(socket)=>{
    //     console.log(socket.id , "admin namespace");

    //     socket.on("hi" , (data , cb)=>
    //     {
    //         console.log(data);

    //         // socket.emit("sayHiBackend", {message:"HI POSTMAN"})

    //         cb("HELLO POSTMAN")
            
    //     })
        
    // })
    }
}

export default new socketGateway()