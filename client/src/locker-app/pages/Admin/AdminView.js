import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearLocker, clearAllLockers } from "../../../redux/actions/locker";
import backArrow from "../../../assets/icons/backArrow.svg";
import "./AdminView.scss";

function AdminView({ setShowSettings }) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [clearButtonClicked, setClearButtonClicked] = useState(false);
  const [clearAllButtonClicked, setClearAllButtonClicked] = useState(false);

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
              handleClearAllLockers();
            }}
            className="start-btn btn-danger"
            disabled={clearAllButtonClicked || clearButtonClicked}
            style={{ marginBottom: "5px" }}
          >
            {clearAllButtonClicked
              ? "Clear all lockers..."
              : "Clear all lockers"}
          </button>
          <button
            onClick={() => {
              handleClearLocker();
            }}
            className="start-btn btn-danger"
            disabled={clearAllButtonClicked || clearButtonClicked}
            style={{ marginBottom: "5px" }}
          >
            {clearButtonClicked ? "Clear this locker..." : "Clear this locker"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminView;
