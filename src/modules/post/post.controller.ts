import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import  PS from "../post/post.service"
import * as  PV from "../post/post.validation"
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";
import { validation } from "../../common/middleware/validation";

const postRouter=Router()


postRouter.post("/createPost"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.createPostSchema),
    PS.createPost )

    postRouter.get("/getPost"  ,authentication,
    PS.getPost )

    postRouter.patch("/likePost/:postId"  ,authentication,
    validation(PV.likePostSchema),
    PS.likePost )

    postRouter.patch("/updatePost/:postId"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.updatePostchema),
    PS.updatePost )


export default postRouter