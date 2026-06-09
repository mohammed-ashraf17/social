import mongoose, { Types } from "mongoose";
import { GenderEnum, providerEnum, RoleEnum } from "../../common/enum/user.enum";
import { hash_password } from "../../common/utils/security/hash_password";
import { AppError } from "../../common/utils/global-error/global-error-handler";
import { genrateOtp, sendEmail } from "../../common/utils/email/send.email";
import { EventEnum } from "../../common/enum/event.enum";
import { eventEmitter } from "../../common/utils/email/email.events";
import { emailTempalet } from "../../common/utils/email/email.template";
import { HydratedDocument } from 'mongoose';




export interface Iuser {
    _id: Types.ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    userName?: string;
    age?: number;
    gender?: GenderEnum;
    phone?: string;
    address?: string;
    role?: RoleEnum;
    confirmEmail?: boolean;
    createdAt: Date;
    updatedAt: Date;
    changeCredential?: Date;
    provider?: providerEnum;
    deletedAt?:string,
    profilePicture?: {
        secure_url?: string;
        public_id?: string;
    },
    friends?: Types.ObjectId[];
    
}
const userSchema = new mongoose.Schema<Iuser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 20
        },

        lastName: {
            type: String,
            required: true,
            trim: true,
            minlength: 3,
            maxlength: 20
        },

        email: {
            type: String,
            unique: true,
            trim: true,
            required: true
        },

        password: {
            type: String,
            required: function () {
                return this.provider !== providerEnum.google;
            },
            trim: true,
            minlength: 7
        },

        age: {
            type: Number,
            min: 18,
            max: 60
        },

        gender: {
            type: String,
            enum: GenderEnum,
            default: GenderEnum.male
        },

        phone: {
            type: String,
            trim: true
        },

        address: {
            type: String,
            trim: true
        },

        role: {
            type: String,
            enum: RoleEnum,
            default: RoleEnum.user
        },

        profilePicture: {
            secure_url: { type: String, default: null },
            public_id: { type: String, default: null }
        },

        confirmEmail: {
            type: Boolean,
            // default: false
        },

        provider: {
            type: String,
            enum: providerEnum,
            default: providerEnum.system
        },
        deletedAt:String,
            friends:[{ type: Types.ObjectId, ref: "user" }]
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
        strictQuery: true
    }
);
userSchema.virtual("userName")
.get(function()
{
    return this.firstName + " " + this.lastName
})
.set(function(v)
{
    this.firstName = v.split(" ")[0]
    this.lastName = v.split(" ")[1]
})

// userSchema.pre("save" , function ()
// {
//     console.log("...............pre hook1.............");
//     console.log(this);
//     this.password = hash_password({myPlaintextPassword:this.password})
    
    
// })

// userSchema.post("save" , function ()
// {
//     console.log("...............post hook2...........");
//     console.log(this);
    
// })

// userSchema.pre("validate" , function ()
// {
//     console.log("...............pre validate hook1.............");
//     console.log(this);

//     if((this.age! <20))
//     {
//         throw new AppError("age is to small")
        
//     }
    
    
// })

// userSchema.post("validate" , function ()
// {
//     console.log("...............post validate hook2...........");
//     console.log(this);
    
// })

// userSchema.pre("save" , function (this:HydratedDocument<Iuser>&{is_new : boolean})
// {
//     console.log("...............pre hook1.............");
//     console.log(this);
//     this.is_new = this.isNew
//     if(this.isModified("password"))
//     {
//         this.password = hash_password({myPlaintextPassword:this.password})
//     }
// })


// userSchema.post("save" , async function ()
// {
//     console.log("...............post hook2...........");
//     const that = this as HydratedDocument<Iuser>&{is_new : boolean}
//     console.log(that.is_new);
//     if(that.is_new)
//     {
//             const otp = await genrateOtp()
    
//         eventEmitter.emit(EventEnum.confirmeEmail , async()=>
//         {
//                 await sendEmail({
//             to:this.email,
//             subject:"welcome to social_Media_App",
//             html:emailTempalet(otp)
//         })
//         })
//     }
        
// })

// userSchema.pre("updateOne" ,{document:true , query:false}, function ()
// {
//     console.log("...............pre updateOne hook1.............");
//     console.log(this);

// })

// userSchema.post("updateOne" ,{document:true , query:false}, function ()
// {
//     console.log("...............post updateOne hook1.............");
//     console.log(this);

// })

// userSchema.pre("insertMany" , function (doc)
// {
//     console.log("...............pre insertMany hook1.............");
//     console.log(this);
//     console.log(doc);
    

// })

// userSchema.post("insertMany" ,function (doc)
// {
//     console.log("...............post insertMany hook1.............");
//     console.log(this);
//     console.log(doc);

// })


// userSchema.pre("findOne" , function ()
// {
//     console.log("...............pre findOne hook1.............");
//     console.log(this.getQuery());
//     const {paranoid,...rest} = this.getQuery()
//     console.log({rest});
//     if(paranoid == false)
//     {
//         this.setQuery({...rest})
//     }
//     else
//     {
//         this.setQuery({...rest , deletedAt:{$exists:false}})
//     }
// })


const userModel = mongoose.models.user || mongoose.model<Iuser>("user" , userSchema)

export default userModel