import { Router } from "express";
import  CS from "./chat.service"
import * as  CV from "./chat.validation"
import { authentication } from "../../common/middleware/authentication";



const chatRouter = Router({mergeParams:true})


chatRouter.get("/" , authentication,CS.getChat)





export default chatRouter