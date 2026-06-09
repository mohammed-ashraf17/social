import { Server, Socket } from "socket.io";
import chatEvent from "./chat.event";

class ChatGateway {
    constructor() {}
    registerChatEvents = async (socket:Socket , io: Server)=>{
        console.log("Registering chat events");
            chatEvent.hi2(socket)
            chatEvent.sendMessage(socket , io)

    }}

    export default new ChatGateway()