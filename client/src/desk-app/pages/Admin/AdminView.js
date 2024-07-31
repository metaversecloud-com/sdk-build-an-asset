import React, { useState } from "react";
import backArrow from "../../../assets/icons/backArrow.svg";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal.js";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton.js";
import ClearAllDesksButton from "../../components/ClearAllDesks/ClearAllDesksButton.js";
import ClearAllDesksModal from "../../components/ClearAllDesks/ClearAllDesksModal.js";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const [showClearDeskModal, setShowClearDeskModal] = useState(false);
  const [showClearAllDesksModal, setShowClearAllDesksModal] = useState(false);

  function handleToggleShowClearDeskModal() {
    setShowClearDeskModal(!showClearDeskModal);
  }

  function handleToggleShowClearAllDesksModal() {
    setShowClearAllDesksModal(!showClearAllDesksModal);
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
      {showClearDeskModal ? (
        <ClearMyAssetModal
          handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
          isClearAssetFromUnclaimedDesk={false}
        />
      ) : (
        ""
      )}
      {showClearAllDesksModal ? (
        <ClearAllDesksModal
          handleToggleShowClearAllDesksModal={
            handleToggleShowClearAllDesksModal
          }
          isClearAssetFromUnclaimedDesk={false}
        />
      ) : (
        ""
      )}
      {getBackArrow()}
      <div className="admin-view-wrapper pt-46" style={{ textAlign: "center" }}>
        {/* {showModal ? renderModal() : ""} */}
        <h2>Settings</h2>

        <div className="footer-fixed" style={{ color: "#00A76F" }}>
          <div style={{ marginBottom: "10px" }}>
            <ClearMyAssetButton
              handleToggleShowClearDeskModal={handleToggleShowClearDeskModal}
              fromAdmin={true}
            />
          </div>
          <ClearAllDesksButton
            handleToggleShowClearAllDesksModal={
              handleToggleShowClearAllDesksModal
            }
          />
        </div>
      </div>
    </>
  );
}

export default AdminView;
