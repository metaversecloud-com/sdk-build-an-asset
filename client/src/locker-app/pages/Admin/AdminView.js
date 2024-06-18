import React, { useState } from "react";
import backArrow from "../../../assets/icons/backArrow.svg";
import ClearMyAssetModal from "../../components/ClearAsset/ClearMyAssetModal.js";
import ClearMyAssetButton from "../../components/ClearAsset/ClearMyAssetButton.js";
import ClearAllLockersButton from "../../components/ClearAllLockers/ClearAllLockersButton.js";
import ClearAllLockersModal from "../../components/ClearAllLockers/ClearAllLockersModal.js";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const [showClearLockerModal, setShowClearLockerModal] = useState(false);
  const [showClearAllLockersModal, setShowClearAllLockersModal] =
    useState(false);

  function handleToggleShowClearLockerModal() {
    setShowClearLockerModal(!showClearLockerModal);
  }

  function handleToggleShowClearAllLockersModal() {
    setShowClearAllLockersModal(!showClearAllLockersModal);
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
      {showClearLockerModal ? (
        <ClearMyAssetModal
          handleToggleShowClearLockerModal={handleToggleShowClearLockerModal}
          isClearAssetFromUnclaimedLocker={false}
        />
      ) : (
        ""
      )}
      {showClearAllLockersModal ? (
        <ClearAllLockersModal
          handleToggleShowClearAllLockersModal={
            handleToggleShowClearAllLockersModal
          }
          isClearAssetFromUnclaimedLocker={false}
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
              handleToggleShowClearLockerModal={
                handleToggleShowClearLockerModal
              }
              fromAdmin={true}
            />
          </div>
          <ClearAllLockersButton
            handleToggleShowClearAllLockersModal={
              handleToggleShowClearAllLockersModal
            }
          />
        </div>
      </div>
    </>
  );
}

export default AdminView;
