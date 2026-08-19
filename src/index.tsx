import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { ApolloClient, HttpLink, InMemoryCache } from "@apollo/client";
import { ApolloProvider } from "@apollo/client/react";
import { Provider } from "react-redux";
import { store } from "./store/store";

const cache = new InMemoryCache();
const link = new HttpLink({ uri: "http://localhost:4000/graphql" });
const client = new ApolloClient({
  // Provide required constructor fields
  cache: cache,
  link: link,
  // Provide some optional constructor fields
  clientAwareness: {
    name: "react-web-client",
    version: "1.3",
  },
  queryDeduplication: false,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
