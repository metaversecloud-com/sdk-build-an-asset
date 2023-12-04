import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  pickupAsset,
  getDroppedAssetAndVisitor,
  getIsMyAssetSpawned,
  moveToAsset,
} from "../../redux/actions/session";
import EditSnowman from "../../components/EditSnowman/EditSnowman";
import "./Spawned.scss";

function Spawned() {
  const { visitorName, imgName } = useParams();
  const dispatch = useDispatch();
  const imgPath = `/assets/snowman/output/${imgName}`;

  let isAssetOwner = false;

  const [isButtonMoveToSnowmanDisabled, setIsButtonMoveToSnowmanDisabled] =
    useState(false);
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const isAssetSpawnedInWorld = useSelector(
    (state) => state?.session?.isAssetSpawnedInWorld
  );

  if (visitor?.profileId && droppedAsset?.dataObject?.profileId) {
    isAssetOwner = visitor?.profileId == droppedAsset?.dataObject?.profileId;
  }

  useEffect(() => {
    const fetchInitialState = async () => {
      await dispatch(getDroppedAssetAndVisitor());
    };

    fetchInitialState();
  }, [dispatch]);

  const handlePickupAsset = async () => {
    await dispatch(pickupAsset());
  };

  const handleEditSnowman = () => {
    setShowCustomizeScreen(true);
  };

  const handleMoveToSnowman = async () => {
    try {
      setIsButtonMoveToSnowmanDisabled(true);
      await dispatch(moveToAsset());
    } catch (error) {
      console.error("Error in handleMoveToSnowman:", error);
    } finally {
      setIsButtonMoveToSnowmanDisabled(false);
    }
  };

  // if (setShowCustomizeScreen) {
  //   return (
  //     <>
  //       <EditSnowman />
  //     </>
  //   );
  // }

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
      {isAssetOwner ? (
        <div className="footer-fixed" style={{ backgroundColor: "white" }}>
          <button onClick={handlePickupAsset}>Pick up my Snowman</button>
        </div>
      ) : (
        ""
      )}
      {/* <div style={{ marginBottom: "10px", width: "320px" }}>
        <button
          onClick={() => handleEditSnowman()}
          disabled={isButtonMoveToSnowmanDisabled}
        >
          Edit my Snowman
        </button>
      </div> */}
      <div style={{ width: "320px" }}>
        <button
          onClick={() => handleMoveToSnowman()}
          disabled={isButtonMoveToSnowmanDisabled}
        >
          Move to my Snowman
        </button>
      </div>
    </div>
  );
}

export default Spawned;
