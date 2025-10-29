import fs from 'fs';
import { makeExecutableSchema } from 'apollo-server-express';
import { graphqlSync, getIntrospectionQuery } from 'graphql';
import { typeDefs, resolvers } from '../src/server/app.schema';

console.log('Generating schema...');
const executableSchema = makeExecutableSchema({ typeDefs, resolvers });

console.log('Writing schema to ./graphql-schema.json...');
fs.writeFileSync(
  'graphql-schema.json',
  JSON.stringify(graphqlSync(executableSchema, getIntrospectionQuery()), null, ' ')
);
