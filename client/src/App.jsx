import React from "react";
import PageRoutes from "./PageRoutes";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { Auth0Provider } from "@auth0/auth0-react";
import "./App.scss";
import "./TempFixes.scss";
import "bootstrap/dist/css/bootstrap.min.css";
import store from "./redux/store";
import axios from "axios";

if (process.env.LOCALHOST) {
  axios.defaults.baseURL = "http://localhost:3000";
}

function App() {
  return (
    <Auth0Provider>
      <Provider store={store} redirectUri={window.location.origin}>
        <Toaster />
        <PageRoutes />
      </Provider>
    </Auth0Provider>
  );
}

export default App;
