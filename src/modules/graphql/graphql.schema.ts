import { GraphQLObjectType , GraphQLSchema} from 'graphql';
import userFildes from '../auth/graphql/user.fildes';



    export const gql_schema = new GraphQLSchema({

    query: new GraphQLObjectType({
      name: "Query", // it is  the root query
        description: "query info",
        fields: {
            ...userFildes.query(),
        },
    }),

    // mutation: new GraphQLObjectType({
    //         name: "mutation",
    //             fields: {
    //                 ...userFildes.mutation()
    //         },
    //     }),
    });