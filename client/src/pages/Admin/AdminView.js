import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
// import penToSquareSvg from "../../assets/pen-to-square-regular.svg";
import { pickUpAllAssets } from "../../redux/actions/session";
import backArrow from "../../assets/backArrow.svg";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [pickupButtonClicked, setPickupButtonClicked] = useState(false);

  function handlePickup() {
    dispatch(pickUpAllAssets());
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
      <div className="admin-view-wrapper pt-46">
        {showModal ? renderModal() : ""}
        <h2>Settings</h2>

        <div className="footer-fixed" style={{ color: "#00A76F" }}>
          {gameResetFlag ? (
            <p style={{ color: "#00875A" }}>The quiz has reset.</p>
          ) : (
            <></>
          )}
          <button
            onClick={() => {
              handlePickup();
            }}
            className="start-btn btn-danger"
            disabled={resetButtonClicked}
          >
            {resetButtonClicked
              ? "Picking up all assets..."
              : "Pick up all assets"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminView;
