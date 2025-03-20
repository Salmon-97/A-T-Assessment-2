"use client"; // This is necessary because we're using client-side code

import { ApolloProvider } from "@apollo/client";
import client from "../lib/apolloClient";

export default function ApolloWrapper({ children }) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}