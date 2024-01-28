import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import {
  pickupAsset,
  getDroppedAssetAndVisitor,
  clearLocker,
} from "../../../redux/actions/locker";
import EditLocker from "../../components/EditLocker/EditLocker";
import AdminView from "../Admin/AdminView";
import Gear from "../../pages/Admin/Gear";
import "./Spawned.scss";

function Spawned() {
  const dispatch = useDispatch();

  const queryParameters = new URLSearchParams(window.location.search);
  const assetId = queryParameters.get("assetId");
  const profileId = queryParameters.get("profileId");

  let isAssetOwner = false;

  const [loading, setLoading] = useState(false);
  const [lockerParams, setLockerParams] = useState({});
  const [isButtonClearDisabled, setIsButtonClearDisabled] = useState(false);
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);
  const world = useSelector((state) => state?.session?.world);
  const [showSettings, setShowSettings] = useState(false);
  const s3Url = world?.dataObject?.lockers?.[profileId]?.s3Url;

  const visitorName = lockerParams["visitor-name"]?.replace("%20", " ");

  if (world?.dataObject?.lockers?.[profileId]) {
    isAssetOwner =
      world?.dataObject?.lockers?.[profileId]?.droppedAssetId == assetId;
  }

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        setLoading(true);
        await dispatch(getDroppedAssetAndVisitor());
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
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

  // Show customize screen if Edit button is clicked, or if this screen was reached from Claim Locker button
  if (showCustomizeScreen || lockerParams?.edit == "true") {
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
        <>
          <div style={{ width: "320px" }}>
            <button
              onClick={() => handleEditLocker()}
              style={{ marginBottom: "10px" }}
            >
              Edit my locker
            </button>
          </div>
          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <button
              className="btn-danger"
              onClick={() => handleClearLocker()}
              disabled={isButtonClearDisabled}
            >
              Delete my locker
            </button>
          </div>
        </>
      ) : (
        ""
      )}
    </div>
  );
}

export default Spawned;
