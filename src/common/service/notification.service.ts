import admin from "firebase-admin"
import { readFileSync } from "node:fs";
import { resolve } from "node:path";


class NotificationService{
    private readonly client: admin.app.App
    constructor() {

        const serviceAccount = JSON.parse
        (readFileSync
            (resolve
                (__dirname,"../../config/social-media-app-6ce43-firebase-adminsdk-fbsvc-f201853018.json"))as unknown as string) 

    this.client = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
    });
    }

    async sendNonification({token,data}:{token:string,data:{title:string , body:string}})
    {
        const message =
        {
            token ,
            data
        }
        return await this.client.messaging().send(message)
    }
    
    async sendNonifications({tokens,data}:{tokens:string[],data:{title:string , body:string}})
    {
        await Promise.all(tokens.map((token)=>
        {
            return this.sendNonification({token , data})
        }))
    }
}

export default new NotificationService()