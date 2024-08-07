import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { getWorld, claimAsset } from "../../../redux/actions/asset";
import Gear from "../Admin/Gear";
import AdminView from "../Admin/AdminView";
import { getThemeData, getThemeName } from "../../../themeData2";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal";
import MoveToAssetButton from "../../components/MoveToAssetButton/MoveToAssetButton";
import "./Home.scss";

function Home() {
  const dispatch = useDispatch();

  const themeName = getThemeName();
  const themeData = getThemeData(themeName);

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);

  const profileId = new URLSearchParams(window.location.search).get(
    "profileId"
  );
  const userHasAsset =
    world?.dataObject?.[`${themeName}s`]?.[profileId]?.droppedAssetId;

  const [loading, setLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getWorld());
      setLoading(false);
    };

    fetchInitialState();
  }, [dispatch]);

  const handleClaimAsset = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(claimAsset(visitor));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
    }
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

  if (userHasAsset) {
    return (
      <>
        {showClearAssetModal ? (
          <ClearMyAssetModal
            handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
            isClearAssetFromUnclaimedAsset={true}
          />
        ) : null}
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          {visitor?.isAdmin ? Gear({ setShowSettings }) : null}
          <h2>{themeData.texts.alreadyHave}</h2>
          <p>{themeData.texts.chooseNew}</p>

          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <div style={{ margin: "10px 0px" }}>
              <MoveToAssetButton closeIframeAfterMove={true} />
            </div>
            <div style={{ margin: "10px 0px" }}>
              <ClearMyAssetButton
                handleToggleShowClearAssetModal={
                  handleToggleShowClearAssetModal
                }
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
      {visitor?.isAdmin ? Gear({ setShowSettings }) : null}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        {themeData.texts.header}
      </h2>
      <img
        src={themeData.splashImage}
        alt={`${themeData.name} Preview`}
        style={{ marginTop: "30px", marginBottom: "30px" }}
        className="img-preview"
      />

      <p style={{ textAlign: "left" }}>{themeData.texts.description}</p>

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        <button
          disabled={areButtonsDisabled}
          onClick={() => handleClaimAsset()}
        >
          {themeData.texts.button}
        </button>
      </div>
    </div>
  );
}

export default Home;
