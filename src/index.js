import ApolloClient from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import gql from "graphql-tag";

const apolloCache = new InMemoryCache();
const httpLink = new HttpLink({
  uri: "https://graphql.example.com"
});

const apolloClient = new ApolloClient({
  connectToDevTools: true,
  cache: apolloCache,
  link: httpLink
});

const Query = gql`
  query Data {
    data {
      id
    }
  }
`;

const readQuery = () => {
  const start = Date.now();
  const result = apolloClient.readQuery({ query: Query });
  const end = Date.now();

  console.log(`result length: ${result.data.length}`);
  console.log(`duration ${end - start}ms`);
};

const addAndReplaceObjects = amount => {
  const data = Array.from(new Array(amount), (_, i) => ({
    __typename: "Data",
    id: `id${i}`
  }));

  apolloClient.writeQuery({ query: Query, data: { data } });
};

addAndReplaceObjects(1000);
readQuery(); // expect 1000 entries, works
addAndReplaceObjects(1);
readQuery(); // expect 1 entry, works

addAndReplaceObjects(100000);
addAndReplaceObjects(1);
readQuery(); // expect 1 entry, works

addAndReplaceObjects(100000);
readQuery(); // expect 100000 entries, works. This readQuery() call seems to break the following writes/reads
addAndReplaceObjects(1);
readQuery(); // expect 1 entry, broken: readQuery returns a list of 100000 entries
