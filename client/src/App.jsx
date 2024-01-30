import React from "react";
import PageRoutes from './PageRoutes';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Auth0Provider } from "@auth0/auth0-react";
import "./snowman-app/pages/App.scss";
import 'bootstrap/dist/css/bootstrap.min.css';

import store from './redux/store';

function App() {
  return (
    <Auth0Provider>
      <Provider store={store}
        redirectUri={window.location.origin}>
        <Toaster />
        <PageRoutes />
      </Provider>
    </Auth0Provider >
  );
}

export default App;