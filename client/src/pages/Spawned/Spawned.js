import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  moveToAsset,
  getDroppedAssetAndVisitor,
} from "../../redux/actions/session";
import "./Spawned.scss";

function Spawned() {
  const { visitorName, imgName } = useParams();
  const dispatch = useDispatch();
  const imgPath = `/assets/snowman/output/${imgName}`;

  // const [isAssetOwner, setIsAssetOwner] = useState(false);
  let isAssetOwner = false;

  const visitor = useSelector((state) => state?.session?.visitor);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);

  if (visitor?.profileId && droppedAsset?.dataObject?.profileId) {
    isAssetOwner = visitor?.profileId == droppedAsset?.dataObject?.profileId;
  }

  useEffect(() => {
    const fetchInitialState = async () => {
      await dispatch(getDroppedAssetAndVisitor());
    };

    fetchInitialState();
  }, [dispatch]);

  const handleMoveToAsset = async () => {
    await dispatch(moveToAsset());
  };

  return (
    <div className="spawned-wrapper">
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        <b>Snowman</b>
      </h2>
      <img src={imgPath} alt={`Snowman of ${visitorName}`} />
      <div style={{ marginTop: "20px" }}>
        <p>
          This snowman belongs to <b>{visitorName}</b>!
        </p>
      </div>
      {console.log("isAssetOwner", isAssetOwner)}
      {isAssetOwner ? (
        <div className="footer-fixed" style={{ backgroundColor: "white" }}>
          <button onClick={handleMoveToAsset}>Move to my Snowman</button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Spawned;
