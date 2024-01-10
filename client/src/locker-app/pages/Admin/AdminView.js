import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import penToSquareSvg from "../../assets/pen-to-square-regular.svg";
import { pickUpAllAssets, spawnLocker } from "../../../redux/actions/locker";
import backArrow from "../../../assets/icons/backArrow.svg";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [pickupButtonClicked, setPickupButtonClicked] = useState(false);
  const [spawnButtonClicked, setSpawnButtonClicked] = useState(false);
  const [resetButtonClicked, setResetButtonClicked] = useState(false);

  async function handlePickup() {
    try {
      setPickupButtonClicked(true);
      await dispatch(pickUpAllAssets());
    } catch (error) {
      console.error(error);
    } finally {
      setPickupButtonClicked(false);
    }
  }

  async function handleSpawnLocker() {
    try {
      setSpawnButtonClicked(true);
      await dispatch(spawnLocker());
    } catch (error) {
      console.error(error);
    } finally {
      setSpawnButtonClicked(false);
    }
  }

  function getBackArrow() {
    return (
      <div
        style={{ position: "absolute", left: "16px" }}
        className="icon-with-rounded-border"
        onClick={() => {
          setShowSettings(false);
        }}
      >
        <img src={backArrow} />
      </div>
    );
  }

  return (
    <>
      {getBackArrow()}
      <div className="admin-view-wrapper pt-46" style={{ textAlign: "center" }}>
        {/* {showModal ? renderModal() : ""} */}
        <h2>Settings</h2>

        <div className="footer-fixed" style={{ color: "#00A76F" }}>
          <button
            onClick={() => {
              handleSpawnLocker();
            }}
            className="start-btn btn-danger"
            disabled={spawnButtonClicked}
            style={{ marginBottom: "5px" }}
          >
            {spawnButtonClicked ? "Spawning locker..." : "Spawn Locker"}
          </button>
          <button
            onClick={() => {
              handlePickup();
            }}
            className="start-btn btn-danger"
            disabled={pickupButtonClicked}
          >
            {pickupButtonClicked
              ? "Picking up all assets..."
              : "Pick up all assets"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminView;
