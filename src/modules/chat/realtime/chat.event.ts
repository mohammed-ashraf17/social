import { Server, Socket } from "socket.io";
import chatService from "../chat.service";

class ChatEvent {
    constructor() {}

        hi2 = async (socket:Socket) => {
        console.log("hi2 listener registered");

        socket.on("hi2" , (data)=>{
            console.log("event received");
                
                chatService.hi2(data)
            })
    }

        sendMessage = async (socket:Socket , io: Server) => {

            socket.on("sendMessage" , (data)=>{
            console.log("event received***********");
                
                chatService.sendMessage(data , socket , io)
            })
            }
}

export default new ChatEvent()