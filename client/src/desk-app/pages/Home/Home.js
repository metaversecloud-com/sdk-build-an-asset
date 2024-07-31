import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { getWorld, claimDesk } from "../../../redux/actions/desk";
import Gear from "../Admin/Gear";
import AdminView from "../Admin/AdminView";
import SplashImage from "../../../assets/desk/splashImage.png";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal";
import MoveToDeskButton from "../../components/MoveToDeskButton/MoveToDeskButton";
import "./Home.scss";

function Home() {
  const dispatch = useDispatch();

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);

  const userHasDesk = world?.dataObject?.desks?.[profileId]?.droppedAssetId;

  const [loading, setLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showClearDeskModal, setShowClearDeskModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getWorld());
      setLoading(false);
    };

    fetchInitialState();
  }, [dispatch]);

  const handleClaimDesk = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(claimDesk(visitor));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
    }
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

  // If user already have a desk
  if (userHasDesk) {
    return (
      <>
        {showClearDeskModal ? (
          <ClearMyAssetModal
            handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
            isClearAssetFromUnclaimedDesk={true}
          />
        ) : (
          ""
        )}
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
          <h2 style={{}}>You already have a desk!</h2>
          <p>To choose this one instead, click "Empty Desk" button below.</p>

          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <div style={{ margin: "10px 0px" }}>
              <MoveToDeskButton closeIframeAfterMove={true} />
            </div>
            <div style={{ margin: "10px 0px" }}>
              <ClearMyAssetButton
                handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
              />
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Decorate your Desk
      </h2>
      <img
        src={SplashImage}
        alt="Desk Preview"
        style={{ marginTop: "30px", marginBottom: "30px" }}
        className="img-preview"
      />

      <p style={{ textAlign: "left" }}>
        Click 'Claim Desk' to claim and decorate your desk. Add items to show
        off your style and make it your own. You can come back to update it
        anytime! 🔒✨
      </p>

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        <button disabled={areButtonsDisabled} onClick={() => handleClaimDesk()}>
          Claim Desk
        </button>
      </div>
    </div>
  );
}

export default Home;
