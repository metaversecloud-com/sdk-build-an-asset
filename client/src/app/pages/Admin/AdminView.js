import React, { useState } from "react";
import backArrow from "../../../assets/icons/backArrow.svg";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal.js";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton.js";
import ClearAllAssetsButton from "../../components/ClearAllAssets/ClearAllAssetsButton.js";
import ClearAllAssetsModal from "../../components/ClearAllAssets/ClearAllAssetsModal.js";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);
  const [showClearAllAssetsModal, setShowClearAllAssetsModal] = useState(false);

  function handleToggleShowClearAssetModal() {
    setShowClearAssetModal(!showClearAssetModal);
  }

  function handleToggleShowClearAllAssetsModal() {
    setShowClearAllAssetsModal(!showClearAllAssetsModal);
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
      {showClearAssetModal ? (
        <ClearMyAssetModal
          handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
          isClearAssetFromUnclaimedAsset={false}
        />
      ) : (
        ""
      )}
      {showClearAllAssetsModal ? (
        <ClearAllAssetsModal
          handleToggleShowClearAllAssetsModal={
            handleToggleShowClearAllAssetsModal
          }
          isClearAssetFromUnclaimedAsset={false}
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
              handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
              fromAdmin={true}
            />
          </div>
          <ClearAllAssetsButton
            handleToggleShowClearAllAssetsModal={
              handleToggleShowClearAllAssetsModal
            }
          />
        </div>
      </div>
    </>
  );
}

export default AdminView;
