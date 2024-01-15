import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import {
  getDroppedAssetAndVisitor,
  claimLocker,
} from "../../redux/actions/locker";
import Gear from "./Admin/Gear";
import AdminView from "./Admin/AdminView";

import "./Home.scss";

const categories = {
  LockerBase: ["lockerBase_0.png", "lockerBase_1.png", "lockerBase_2.png"],
  topRight: ["topRight_0.png", "topRight_1.png", "topRight_2.png"],
  BottomRight: ["bottomRight_0.png", "bottomRight_1.png", "bottomRight_2.png"],
  Left: ["left_0.png", "left_1.png", "left_2.png"],
};

function Home() {
  const dispatch = useDispatch();

  const visitor = useSelector((state) => state?.session?.visitor);
  const spawnedAsset = useSelector((state) => state?.session?.spawnedAsset);
  const [selected, setSelected] = useState({
    LockerBase: "",
    topRight: "",
    BottomRight: "",
    Left: "",
  });

  const [loading, setLoading] = useState(false);
  const [isButtonClaimDisabled, setIsButtonClaimDisabled] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [preview, setPreview] = useState("/assets/locker/lockerBase_0.png");

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getDroppedAssetAndVisitor());
      setLoading(false);

      if (spawnedAsset?.dataObject?.owner) {
        const imageName = spawnedAsset.dataObject.completeImageName;
        const parts = imageName.replace(".png", "").split("_");

        const initialSelection = {
          LockerBase: `/assets/locker/lockerBase_${parts[1]}.png`,
          topRight: `/assets/locker/topRight_${parts[3]}.png`,
          BottomRight: `/assets/locker/bottomRight_${parts[5]}.png`,
          Left: `/assets/locker/left_${parts[7]}.png`,
        };

        setSelected(initialSelection);
        setPreview(
          `/assets/locker/output/${spawnedAsset?.dataObject?.completeImageName}`
        );
      }
    };

    fetchInitialState();
  }, [dispatch, spawnedAsset?.dataObject?.completeImageName]);

  const handleClaimLocker = async () => {
    try {
      setIsButtonClaimDisabled(true);
      await dispatch(claimLocker());
    } catch (error) {
      console.error(error);
    } finally {
      setIsButtonClaimDisabled(false);
    }
  };

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

  return (
    <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Build your Locker!
      </h2>
      <img
        src={preview}
        alt="Locker Preview"
        style={{ marginTop: "30px", marginBottom: "30px" }}
        className="img-preview"
      />

      <p style={{ textAlign: "left" }}>
        Welcome to your new virtual locker! Here, you can decorate your own
        locker any way you like. Make it bright, make it cool, make it fun! Show
        off your style and let everyone see how creative you can be. Get ready
        to make the coolest locker ever! 🔒✨
      </p>

      {Object.keys(validationErrors).length > 0 && (
        <p style={{ color: "red" }}>
          Please select an item from each category to build the locker.
        </p>
      )}

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        <button
          disabled={isButtonClaimDisabled}
          onClick={() => handleClaimLocker()}
        >
          Claim Locker
        </button>
      </div>
    </div>
  );
}

export default Home;
