import multer from "multer"
import { Store_Enum, Multer_Enum } from '../enum/multer.enum';
import { tmpdir } from "node:os"
import { Request } from "express"
import { AppError } from "../utils/global-error/global-error-handler"


const multerCloud = (
    {store_type=Store_Enum.memory ,custom_typs=Multer_Enum.image , maxFileSize=5 * 1024 * 1024 }:
    {store_type?:Store_Enum ,custom_typs?:string[] , maxFileSize?:number}
    ={})=>
{

    const storage =store_type === Store_Enum.memory? multer.memoryStorage():multer.diskStorage({
    destination:tmpdir(),

    filename: function (req:Request, file:Express.Multer.File, cb:Function) {
    const uniqueName = Math.random().toString(36).substring(2, 10);
    cb(null, uniqueName + "_" +  file.originalname )
    }
})

    function fileFilter (req:Request, file:Express.Multer.File, cb:Function) {

    if(!custom_typs.includes(file.mimetype))
    {
    cb(new AppError('I don\'t have a clue!'))
    }
    cb(null , true)

}
    const upload=multer({storage , fileFilter , limits:{fieldSize:maxFileSize}})
    return upload
}

export default multerCloud