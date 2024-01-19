import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import {
  pickupAsset,
  getDroppedAssetAndVisitor,
  getIsMyAssetSpawned,
  moveToAsset,
  clearLocker,
} from "../../../redux/actions/locker";
import EditLocker from "../../components/EditLocker/EditLocker";
import AdminView from "../Admin/AdminView";
import Gear from "../../pages/Admin/Gear";
import "./Spawned.scss";

function Spawned() {
  const dispatch = useDispatch();

  let isAssetOwner = false;

  const [loading, setLoading] = useState(false);
  const [isButtonMoveToSnowmanDisabled, setIsButtonMoveToSnowmanDisabled] =
    useState(false);
  const [lockerParams, setLockerParams] = useState({});
  const [isButtonClearDisabled, setIsButtonClearDisabled] = useState(false);
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const [showSettings, setShowSettings] = useState(false);
  const isAssetSpawnedInWorld = useSelector(
    (state) => state?.session?.isAssetSpawnedInWorld
  );
  const s3Url = droppedAsset?.dataObject?.s3Url;
  console.log("s3Url", s3Url);

  const visitorName = lockerParams["visitor-name"]?.replace("%20", " ");

  if (visitor?.profileId && droppedAsset?.dataObject?.profileId) {
    isAssetOwner = visitor?.profileId == droppedAsset?.dataObject?.profileId;
  }

  useEffect(() => {
    const fetchInitialState = async () => {
      await dispatch(getDroppedAssetAndVisitor());
    };

    const urlParams = new URLSearchParams(window.location.search);
    setLockerParams(Object.fromEntries(urlParams.entries()));

    fetchInitialState();
  }, [dispatch]);

  const handlePickupAsset = async () => {
    await dispatch(pickupAsset());
  };

  const handleEditLocker = async () => {
    setShowCustomizeScreen(true);
  };

  const handleClearLocker = async () => {
    try {
      setIsButtonClearDisabled(true);
      await dispatch(clearLocker());
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonClearDisabled(false);
    }
  };

  if (loading) {
    return (
      <div className="loader">
        <ClipLoader color={"#123abc"} loading={loading} size={150} />
      </div>
    );
  }

  if (showSettings) {
    return <AdminView setShowSettings={setShowSettings} />;
  }

  if (showCustomizeScreen) {
    return <EditLocker lockerParams={lockerParams} />;
  }

  return (
    <div className="spawned-wrapper">
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        <b>Locker</b>
      </h2>
      <img
        src={s3Url || "/assets/locker/unclaimedLocker.png"}
        alt={`Locker of ${visitorName}`}
      />
      <div style={{ marginTop: "20px" }}>
        <p>
          This locker belongs to <b>{visitorName}</b>!
        </p>
      </div>
      {isAssetOwner ? (
        <div style={{ width: "320px" }}>
          <button onClick={() => handleEditLocker()}>Edit Locker</button>
          <button
            onClick={() => handleClearLocker()}
            disabled={isButtonClearDisabled}
            style={{ marginBottom: "10px" }}
          >
            Clear Locker
          </button>
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

export default Spawned;
