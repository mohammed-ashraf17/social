import { GraphQLID, GraphQLInt, GraphQLNonNull, GraphQLString } from "graphql";
import { genderType } from "./usr.typs";


export const getUserAregs = 
{
    id: { type: new GraphQLNonNull(GraphQLInt) },
}


export const mutationUserAregs = 
{
            _id: { type: new GraphQLNonNull(GraphQLInt)},
            name: { type: new GraphQLNonNull(GraphQLString) },
            age: { type: new GraphQLNonNull(GraphQLInt) },
            gender: { type: new GraphQLNonNull(genderType) },
}