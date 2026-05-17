import { Router } from "express";
import { authentication } from "../../common/middleware/authentication";
import  CS from "../comment/comment.service"
import * as  CV from "../comment/comment.validation"
import multerCloud from "../../common/middleware/multer.cloud";
import { Store_Enum } from "../../common/enum/multer.enum";
import { validation } from "../../common/middleware/validation";

const commentRouter=Router({mergeParams:true})


commentRouter.post("/"  ,authentication,
    multerCloud({store_type:Store_Enum.disk}).array("attachments"),
    validation(CV.createCommentSchema),
    CS.createComment )


    commentRouter.delete(
    "/:commentId",
    authentication,
    CS.deleteComment
);

    


export default commentRouter