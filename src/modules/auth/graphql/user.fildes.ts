
import { GraphQLString , GraphQLNonNull, GraphQLInt, GraphQLList} from 'graphql';
import { AppError } from '../../../common/utils/global-error/global-error-handler';
import { genderType, userTypeObject, userTypeObjectM } from './usr.typs';
import { getUserAregs, mutationUserAregs } from './user.args';

import UserServies from '../auth.service';
import { authenticationGraphql } from '../../../common/middleware/authentication';
import { authorizationn } from '../../../common/middleware/authorization';
import { Validation_GQL } from '../../../common/middleware/validation';
import { getUserSchema } from '../auth.validation';





class UserFildes{

    constructor(){}

    query = ()=>{
        return {
        // this are the queries
        getUser: {
            type: userTypeObject,
            args: {token: { type: new GraphQLNonNull(GraphQLString) }},
            
            resolve: async (parent: any, args: any , context: any) => {

                await Validation_GQL(getUserSchema,args)
                const { user  , decoded} = await authenticationGraphql(args.token)

                await authorizationn(["user" , "admin"] , user.role!)
                
            return UserServies.getUser(user._id)
            },
        },
        listUsers: {
            type: new GraphQLList(userTypeObject),
            resolve: () => {
                return UserServies.getUsers()
            },
        },
    }
}

    // mutation =()=>
    // {
    //     return{
    //         createUser: {
    //         type: userTypeObjectM,
    //         args: mutationUserAregs,
    //         resolve: (parent: any, args: any) => {
    //         const user = usersM.find((user) => user.id == args.id);
    //         if (user) {
    //             throw new AppError("user already exists");
    //         }
    //         usersM.push(args);
    //         return args;
    //         },
    //     },
    //     }
    // }
}

export default new UserFildes()