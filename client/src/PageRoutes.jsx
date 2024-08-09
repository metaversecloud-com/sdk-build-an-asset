import React from "react";
import { HistoryRouter as Router } from "redux-first-history/rr6";
import { history } from "./redux/store";

import { Route, Routes } from "react-router-dom";

import AssetHome from "./app/pages/Home/Home.js";
import Home from "./snowman-app/pages/Home";
import SnowmanHome from "./snowman-app/pages/Home";
import Spawned from "./snowman-app/pages/Spawned/Spawned";
import ClaimedAsset from "./app/pages/ClaimedAsset/ClaimedAsset";
import EditAsset from "./app/components/EditAsset/EditAsset.js";

const PageRoutes = () => {
  return (
    <Router history={history}>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route
          path="/spawned/img-name/:imgName/visitor-name/:visitorName"
          element={<Spawned />}
        />
        <Route path="/locker/claimed" element={<ClaimedAsset />} />
        <Route path="/locker" element={<AssetHome />} />

        <Route path="/desk" element={<AssetHome />} />
        <Route path="/desk/claimed" element={<ClaimedAsset />} />

        <Route path="/snowman" element={<SnowmanHome />} />
        <Route path="/snowman/edit" element={<EditAsset />} />
      </Routes>
    </Router>
  );
};

export default PageRoutes;
