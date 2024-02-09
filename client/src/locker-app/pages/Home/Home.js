import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ClipLoader } from "react-spinners";
import { getWorld, claimLocker } from "../../../redux/actions/locker";
import Gear from "../Admin/Gear";
import AdminView from "../Admin/AdminView";
import SplashImage from "../../../assets/locker/splashImage.png";

import "./Home.scss";
import ClearMyLockerButton from "../../components/ClearMyLocker/ClearMyLockerButton";
import ClearMyLockerModal from "../../components/ClearMyLocker/ClearMyLockerModal";
import MoveToLockerButton from "../../components/MoveToLockerButton/MoveToLockerButton";

function Home() {
  const dispatch = useDispatch();

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");

  const visitor = useSelector((state) => state?.session?.visitor);
  const world = useSelector((state) => state?.session?.world);

  const userHasLocker = world?.dataObject?.lockers?.[profileId]?.droppedAssetId;

  const [loading, setLoading] = useState(false);
  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showClearLockerModal, setShowClearLockerModal] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getWorld());
      setLoading(false);
    };

    fetchInitialState();
  }, [dispatch]);

  const handleClaimLocker = async () => {
    try {
      setAreButtonsDisabled(true);
      await dispatch(claimLocker(visitor));
    } catch (error) {
      console.error(error);
    } finally {
      setAreButtonsDisabled(false);
    }
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

  // If user already have a locker
  if (userHasLocker) {
    return (
      <>
        {showClearLockerModal ? (
          <ClearMyLockerModal
            handleToggleShowClearLockerModal={handleToggleShowClearLockerModal}
            isClearMyLockerFromUnclaimedLocker={true}
          />
        ) : (
          ""
        )}
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
          <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
            You already have a locker!
          </h2>

          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <div style={{ margin: "10px 0px" }}>
              <MoveToLockerButton shouldCloseIframe={true} />
            </div>
            <div style={{ margin: "10px 0px" }}>
              <ClearMyLockerButton
                handleToggleShowClearLockerModal={
                  handleToggleShowClearLockerModal
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
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Decorate Your Locker
      </h2>
      <img
        src={SplashImage}
        alt="Locker Preview"
        style={{ marginTop: "30px", marginBottom: "30px" }}
        className="img-preview"
      />

      <p style={{ textAlign: "left" }}>
        Click 'Claim Locker' to claim and decorate your locker. Add items to
        show off your style and make it your own. You can come back to update it
        anytime! 🔒✨
      </p>

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        <button
          disabled={areButtonsDisabled}
          onClick={() => handleClaimLocker()}
        >
          Claim Locker
        </button>
      </div>
    </div>
  );
}

export default Home;