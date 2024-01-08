import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  pickupAsset,
  getDroppedAssetAndVisitor,
  getIsMyAssetSpawned,
  moveToAsset,
} from "../../../redux/actions/locker";
import EditLocker from "../../components/EditLocker/EditLocker";
import AdminView from "../Admin/AdminView";
import Gear from "../../pages/Admin/Gear";
import "./Spawned.scss";

function Spawned() {
  const { visitorName, imgName } = useParams();
  const dispatch = useDispatch();
  const imgPath = `/assets/locker/output/${imgName}`;

  let isAssetOwner = false;

  const [isButtonMoveToSnowmanDisabled, setIsButtonMoveToSnowmanDisabled] =
    useState(false);
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const [showSettings, setShowSettings] = useState(false);
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

  const handleEditLocker = async () => {
    setShowCustomizeScreen(true);
  };

  if (showSettings) {
    return <AdminView setShowSettings={setShowSettings} />;
  }

  if (showCustomizeScreen) {
    return <EditLocker />;
  }

  return (
    <div className="spawned-wrapper">
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        <b>Locker</b>
      </h2>
      <img src={imgPath} alt={`Locker of ${visitorName}`} />
      <div style={{ marginTop: "20px" }}>
        <p>
          This locker belongs to <b>{visitorName}</b>!
        </p>
      </div>
      {/* {isAssetOwner ? (
        <div className="footer-fixed" style={{ backgroundColor: "white" }}>
          <button onClick={handlePickupAsset}>Clear my Locker</button>
        </div>
      ) : (
        ""
      )} */}
      {isAssetOwner ? (
        <div style={{ width: "320px" }}>
          <button
            onClick={() => handleEditLocker()}
            disabled={isButtonMoveToSnowmanDisabled}
          >
            Edit Locker
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Spawned;
