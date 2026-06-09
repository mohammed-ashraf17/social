import mongoose, { Types } from "mongoose";

interface IMessage {
    createdBy: Types.ObjectId,
    content: string
}


export interface Ichat {
    // ovo
    createdBy: Types.ObjectId,
    participants: Types.ObjectId[],
    messages: IMessage[]
    // ovm
    group: string,
    groupImage: string,
    roomId: string
    
    };


    const messageSchema = new mongoose.Schema<IMessage>({

    content: { type: String, required: true },
    createdBy: { type: Types.ObjectId, ref: "user", required: true },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    strictQuery: true
})


const chatSchema = new mongoose.Schema<Ichat>(
    {
        participants: [{ type: Types.ObjectId, ref: "user", required: true }],
        createdBy: { type: Types.ObjectId, ref: "user", required: true },
        messages: [messageSchema],

        group: String,
        groupImage: String,
        roomId: String,
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
);


const chatModel = mongoose.models.chat || mongoose.model<Ichat>("chat" , chatSchema)

export default chatModel