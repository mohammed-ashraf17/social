import { GraphQLString ,GraphQLObjectType , GraphQLSchema, GraphQLNonNull, GraphQLInt, GraphQLList, GraphQLEnumType, GraphQLID,} from 'graphql';




export const profilePictureType = new GraphQLObjectType({
    name: "ProfilePictureType",
    fields: {
    secure_url: { type: GraphQLString },
    public_id: { type: GraphQLString },
    },
});

export const userTypeObject = new GraphQLObjectType({
    name: "UserType",
    fields: {
    _id: { type: GraphQLID },
    firstName: { type: GraphQLString },
    lastName: { type: GraphQLString },
    email: { type: GraphQLString },
    phone: { type: GraphQLString },
    age: { type: GraphQLInt },

    profilePicture: {
        type: profilePictureType,
    },
    },
});

        export const genderType = new GraphQLEnumType({
        name: "GenderType",
        values: {
            male: { value: "male" },
            female: { value: "female" },
        },
        });


        export let userTypeObjectM = new GraphQLObjectType({
    name: "getUserM",
    fields: {
        id: { type: GraphQLInt },
        name: { type: GraphQLString },
        age: { type: GraphQLInt },
    
        gender: { type: genderType },
    },
    });