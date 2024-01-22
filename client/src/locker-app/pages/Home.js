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
import SplashImage from "../../assets/locker/splashImage.png";

import "./Home.scss";

const categories = {
  "Locker Base": [
    "lockerBase_0.png",
    "lockerBase_1.png",
    "lockerBase_2.png",
    "lockerBase_3.png",
  ],
  Wallpaper: [
    "wallpaper_0.png",
    "wallpaper_1.png",
    "wallpaper_2.png",
    "wallpaper_3.png",
    "wallpaper_4.png",
    "wallpaper_5.png",
    "wallpaper_6.png",
    "wallpaper_7.png",
    "wallpaper_8.png",
  ],
  "Top Shelf": [
    "topShelf_0.png",
    "topShelf_1.png",
    "topShelf_2.png",
    "topShelf_3.png",
    "topShelf_4.png",
    "topShelf_5.png",
    "topShelf_6.png",
    "topShelf_7.png",
    "topShelf_8.png",
  ],
  "Bottom Shelf": [
    "bottomShelf_0.png",
    "bottomShelf_1.png",
    "bottomShelf_2.png",
    "bottomShelf_3.png",
    "bottomShelf_4.png",
    "bottomShelf_5.png",
    "bottomShelf_6.png",
    "bottomShelf_7.png",
    "bottomShelf_8.png",
  ],
  Door: [
    "door_0.png",
    "door_1.png",
    "door_2.png",
    "door_3.png",
    "door_4.png",
    "door_5.png",
    "door_6.png",
    "door_7.png",
    "door_8.png",
  ],
};

function Home() {
  const dispatch = useDispatch();

  const visitor = useSelector((state) => state?.session?.visitor);
  const spawnedAsset = useSelector((state) => state?.session?.spawnedAsset);
  const [selected, setSelected] = useState({
    "Locker Base": "",
    Wallpaper: "",
    "Top Shelf": "",
    "Bottom Shelf": "",
    Door: "",
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
          "Locker Base": `/assets/locker/lockerBase_${parts[1]}.png`,
          Walkpaper: `/assets/locker/wallpaper${parts[3]}.png`,
          "Top Shelf": `/assets/locker/topShelf_${parts[5]}.png`,
          "Bottom Shelf": `/assets/locker/BottomShelf_${parts[7]}.png`,
          Door: `/assets/locker/Door_${parts[9]}.png`,
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
        src={SplashImage}
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
