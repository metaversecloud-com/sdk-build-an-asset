import React from "react";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { history } from "./redux/store";

import { Route, Routes } from "react-router-dom";

import LockerHome from "./locker-app/pages/Home";
import Home from "./snowman-app/pages/Home";
import SnowmanHome from "./snowman-app/pages/Home";
import Spawned from "./snowman-app/pages/Spawned/Spawned";

const PageRoutes = () => {
  return (
    <Router history={history}>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/spawned/img-name/:imgName/visitor-name/:visitorName" element={<Spawned />} />
        <Route path="/snowman" element={<SnowmanHome />} />
        <Route path="/locker" element={<LockerHome />} />
      </Routes>
    </Router>
  );
};

export default PageRoutes;
