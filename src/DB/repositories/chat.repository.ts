import { Model } from "mongoose";
import chatModel, { Ichat } from "../models/chat.model";
import BaseRepository from "./base.repository";




class chatRepository extends BaseRepository<Ichat>
{
    constructor(protected readonly model : Model<Ichat>= chatModel)
    {
        super(model)
    }


}

export default chatRepository