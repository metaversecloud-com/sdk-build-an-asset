import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearLocker, clearAllLockers } from "../../../redux/actions/locker";
import backArrow from "../../../assets/icons/backArrow.svg";
import ClearMyLockerModal from "../../components/ClearMyLocker/ClearMyLockerModal.js";
import ClearMyLockerButton from "../../components/ClearMyLocker/ClearMyLockerButton.js";
import ClearAllLockersButton from "../../components/ClearAllLockers/ClearAllLockersButton.js";
import ClearAllLockersModal from "../../components/ClearAllLockers/ClearAllLockersModal.js";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [clearButtonClicked, setClearButtonClicked] = useState(false);
  const [clearAllButtonClicked, setClearAllButtonClicked] = useState(false);
  const [showClearLockerModal, setShowClearLockerModal] = useState(false);
  const [showClearAllLockersModal, setShowClearAllLockersModal] =
    useState(false);

  async function handleClearLocker() {
    try {
      setClearButtonClicked(true);
      await dispatch(clearLocker());
    } catch (error) {
      console.error(error);
    } finally {
      setClearButtonClicked(false);
    }
  }

  async function handleClearAllLockers() {
    try {
      setClearAllButtonClicked(true);
      await dispatch(clearAllLockers());
    } catch (error) {
      console.error(error);
    } finally {
      setClearAllButtonClicked(false);
    }
  }

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
        <ClearMyLockerModal
          handleToggleShowClearLockerModal={handleToggleShowClearLockerModal}
          isClearMyLockerFromUnclaimedLocker={false}
        />
      ) : (
        ""
      )}
      {showClearAllLockersModal ? (
        <ClearAllLockersModal
          handleToggleShowClearAllLockersModal={
            handleToggleShowClearAllLockersModal
          }
          isClearMyLockerFromUnclaimedLocker={false}
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
            <ClearMyLockerButton
              handleToggleShowClearLockerModal={
                handleToggleShowClearLockerModal
              }
              fromAdmin={true}
            />
          </div>
          {/* <button
            onClick={() => {
              handleClearAllLockers();
            }}
            className="start-btn btn-danger"
            disabled={clearAllButtonClicked || clearButtonClicked}
            style={{ marginBottom: "5px" }}
          >
            {clearAllButtonClicked
              ? "Clear all lockers..."
              : "Clear all lockers"}
          </button> */}
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
