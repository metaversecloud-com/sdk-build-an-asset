import React from "react";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { history } from "../redux/store";

import { Route, Routes } from "react-router-dom";

import Home from "./Home";
import Spawned from "./Spawned/Spawned";

const PageRoutes = () => {
  return (
    <Router history={history}>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/spawned/img-name/:imgName/visitor-name/:visitorName" element={<Spawned />} />
      </Routes>
    </Router>
  );
};

export default PageRoutes;
