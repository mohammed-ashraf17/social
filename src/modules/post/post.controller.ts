import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import  PS from "../post/post.service"
import * as  PV from "../post/post.validation"
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";
import { validation } from "../../common/middleware/validation";
import commentRouter from "../comment/comment.controller";

const postRouter=Router()

postRouter.use("/:postId/comments{/:commentId/replies}" , commentRouter)


postRouter.post("/createPost"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.createPostSchema),
    PS.createPost )

    postRouter.get("/getPost"  ,authentication,
    PS.getPost )

    postRouter.patch("/likePost/:postId"  ,authentication,
    validation(PV.likePostSchema),
    PS.likePost )

    postRouter.put("/updatePost/:postId"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(PV.updatePostchema),
    PS.updatePost )

    postRouter.delete("/delete/:postId", authentication, PS.deletePost);


export default postRouter