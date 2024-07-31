import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { getWorld } from "../../../redux/actions/desk";
import EditDesk from "../../components/EditDesk/EditDesk";
import AdminView from "../Admin/AdminView";
import Gear from "../Admin/Gear";
import "./ClaimedDesk.scss";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal";
import MoveToDeskButton from "../../components/MoveToDeskButton/MoveToDeskButton";

function ClaimedDesk() {
  const dispatch = useDispatch();

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId");

  const isAssetOwner = profileId === ownerProfileId;

  const [loading, setLoading] = useState(false);
  const [deskParams, setDeskParams] = useState({});
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);
  const [showClearDeskModal, setShowClearDeskModal] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);
  const [showSettings, setShowSettings] = useState(false);

  const s3Url = world?.dataObject?.desks?.[ownerProfileId]?.s3Url;

  const visitorName = deskParams["visitor-name"]?.replace("%20", " ");

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
    setDeskParams(Object.fromEntries(urlParams.entries()));

    fetchInitialState();
  }, [dispatch]);

  const handleEditDesk = async () => {
    setShowCustomizeScreen(true);
  };

  function handleToggleShowClearDeskModal() {
    setShowClearDeskModal(!showClearDeskModal);
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

  // Show customize screen if Edit button is clicked, or if this screen was reached from Claim Desk button
  if (showCustomizeScreen || deskParams?.edit == "true") {
    return <EditDesk deskParams={deskParams} />;
  }

  return (
    <>
      {showClearDeskModal ? (
        <ClearMyAssetModal
          handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
          isClearAssetFromUnclaimedDesk={false}
        />
      ) : (
        ""
      )}
      <div className="spawned-wrapper">
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", padding: "24px" }}>
          <b>Desk</b>
        </h2>
        <img
          src={s3Url || "/assets/desk/unclaimedDesk.png"}
          alt={`Desk of ${visitorName}`}
          style={{ width: "200px" }}
        />
        <div style={{ marginTop: "20px" }}>
          <p>This desk belongs to</p>
          <p>
            <b>{visitorName}</b>!
          </p>
        </div>
        {isAssetOwner ? (
          <>
            <div className="footer-fixed" style={{ backgroundColor: "white" }}>
              <div style={{ width: "320px" }}>
                <button
                  onClick={() => handleEditDesk()}
                  style={{ marginBottom: "10px" }}
                >
                  Edit Desk
                </button>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <MoveToDeskButton shouldCloseIframe={false} />
              </div>
              <ClearMyAssetButton
                handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
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

export default ClaimedDesk;
