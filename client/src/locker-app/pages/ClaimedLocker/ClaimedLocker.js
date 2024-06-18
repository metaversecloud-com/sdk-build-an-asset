import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { getWorld } from "../../../redux/actions/locker";
import EditLocker from "../../components/EditLocker/EditLocker";
import AdminView from "../Admin/AdminView";
import Gear from "../Admin/Gear";
import "./ClaimedLocker.scss";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal";
import MoveToLockerButton from "../../components/MoveToLockerButton/MoveToLockerButton";

function ClaimedLocker() {
  const dispatch = useDispatch();

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId");

  const isAssetOwner = profileId === ownerProfileId;

  const [loading, setLoading] = useState(false);
  const [lockerParams, setLockerParams] = useState({});
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);
  const [showClearLockerModal, setShowClearLockerModal] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);
  const [showSettings, setShowSettings] = useState(false);

  const s3Url = world?.dataObject?.lockers?.[ownerProfileId]?.s3Url;

  const visitorName = lockerParams["visitor-name"]?.replace("%20", " ");

  useEffect(() => {
    const fetchInitialState = async () => {
      try {
        setLoading(true);
        await dispatch(getWorld());
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

  const handleEditLocker = async () => {
    setShowCustomizeScreen(true);
  };

  function handleToggleShowClearLockerModal() {
    setShowClearLockerModal(!showClearLockerModal);
  }

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
    <>
      {showClearLockerModal ? (
        <ClearMyAssetModal
          handleToggleShowClearLockerModal={handleToggleShowClearLockerModal}
          isClearAssetFromUnclaimedLocker={false}
        />
      ) : (
        ""
      )}
      <div className="spawned-wrapper">
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", padding: "24px" }}>
          <b>Locker</b>
        </h2>
        <img
          src={s3Url || "/assets/locker/unclaimedLocker.png"}
          alt={`Locker of ${visitorName}`}
          style={{ width: "200px" }}
        />
        <div style={{ marginTop: "20px" }}>
          <p>This locker belongs to</p>
          <p>
            <b>{visitorName}</b>!
          </p>
        </div>
        {isAssetOwner ? (
          <>
            <div className="footer-fixed" style={{ backgroundColor: "white" }}>
              <div style={{ width: "320px" }}>
                <button
                  onClick={() => handleEditLocker()}
                  style={{ marginBottom: "10px" }}
                >
                  Edit Locker
                </button>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <MoveToLockerButton shouldCloseIframe={false} />
              </div>
              <ClearMyAssetButton
                handleToggleShowClearLockerModal={
                  handleToggleShowClearLockerModal
                }
              />
            </div>
          </>
        ) : (
          ""
        )}
      </div>
    </>
  );
}

export default ClaimedLocker;
