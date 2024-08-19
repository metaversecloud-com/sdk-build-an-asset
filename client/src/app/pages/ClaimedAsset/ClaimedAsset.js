// File:

import React, { useEffect, useState } from "react";
import { ClipLoader } from "react-spinners";
import { useDispatch, useSelector } from "react-redux";
import { getWorld } from "../../../redux/actions/getWorld";
import EditAsset from "../../components/EditAsset/EditAsset";
import AdminView from "../Admin/AdminView";
import Gear from "../Admin/Gear";
import "./ClaimedAsset.scss";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal";
import MoveToAssetButton from "../../components/MoveToAssetButton/MoveToAssetButton";
import { capitalize } from "../../../utils/utils";
import { getThemeName } from "../../../themeData2";

function ClaimedAsset() {
  const dispatch = useDispatch();

  const themeName = getThemeName();
  const defaultUnclaimedAsset = `/assets/${themeName}/unclaimedAsset.png`;

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId");

  const isAssetOwner = profileId === ownerProfileId;

  const [loading, setLoading] = useState(false);
  const [assetParams, setAssetParams] = useState({});
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);
  const [showSettings, setShowSettings] = useState(false);

  const s3Url = world?.dataObject?.[themeName]?.[ownerProfileId]?.s3Url;

  console.log("s3Url", s3Url, themeName, world?.dataObject?.[themeName]);

  const visitorName = assetParams["visitor-name"]?.replace("%20", " ");

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
    setAssetParams(Object.fromEntries(urlParams.entries()));

    fetchInitialState();
  }, [dispatch]);

  const handleEditAsset = async () => {
    setShowCustomizeScreen(true);
  };

  function handleToggleShowClearAssetModal() {
    setShowClearAssetModal(!showClearAssetModal);
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

  // Show customize screen if Edit button is clicked, or if this screen was reached from Claim Asset button
  if (showCustomizeScreen || assetParams?.edit == "true") {
    return <EditAsset assetParams={assetParams} />;
  }

  return (
    <>
      {showClearAssetModal ? (
        <ClearMyAssetModal
          handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
          isClearAssetFromUnclaimedAsset={false}
        />
      ) : (
        ""
      )}
      <div className="spawned-wrapper">
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", padding: "24px" }}>
          <b>{capitalize(themeName)}</b>
        </h2>
        <img
          src={s3Url || defaultUnclaimedAsset}
          alt={`Asset of ${visitorName}`}
          style={{ width: "200px" }}
        />
        <div style={{ marginTop: "20px" }}>
          <p>This {themeName} belongs to</p>
          <p>
            <b>{visitorName}</b>!
          </p>
        </div>
        {isAssetOwner ? (
          <>
            <div className="footer-fixed" style={{ backgroundColor: "white" }}>
              <div style={{ width: "320px" }}>
                <button
                  onClick={() => handleEditAsset()}
                  style={{ marginBottom: "10px" }}
                >
                  Edit {themeName}
                </button>
              </div>
              <div style={{ marginBottom: "10px" }}>
                <MoveToAssetButton shouldCloseIframe={false} />
              </div>
              <ClearMyAssetButton
                handleToggleShowClearAssetModal={
                  handleToggleShowClearAssetModal
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

export default ClaimedAsset;
