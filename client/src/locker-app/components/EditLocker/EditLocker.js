import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import {
  spawnAsset,
  getDroppedAssetAndVisitor,
  getIsMyAssetSpawned,
  moveToAsset,
  editLocker,
} from "../../../redux/actions/locker";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";
import Gear from "../../pages/Admin/Gear";
import AdminView from "../../pages/Admin/AdminView";

import "./EditLocker.scss";

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

function EditLocker() {
  const dispatch = useDispatch();

  const visitor = useSelector((state) => state?.session?.visitor);
  // const visitor = useSelector((state) => state?.session?.visitor);
  const isAssetSpawnedInWorld = useSelector(
    (state) => state?.session?.isAssetSpawnedInWorld
  );
  const spawnSuccess = useSelector((state) => state?.session?.spawnSuccess);

  const spawnedAsset = useSelector((state) => state?.session?.spawnedAsset);
  const droppedAsset = useSelector((state) => state?.session?.droppedAsset);

  const [selected, setSelected] = useState({
    "Locker Base": "",
    Wallpaper: "",
    "Top Shelf": "",
    "Bottom Shelf": "",
    Door: "",
  });
  const [loading, setLoading] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(false);
  const [isButtonMoveToLockerDisabled, setIsButtonMoveToLockerDisabled] =
    useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [completeImageName, setCompleteImageName] = useState("");
  const [showDefaultScreen, setShowDefaultScreen] = useState(false);
  const [isButtonSaveLockerDisabled, setIsButtonSaveLockerDisabled] =
    useState(false);
  const [preview, setPreview] = useState("/assets/locker/unclaimedLocker.png");
  const [openCategories, setOpenCategories] = useState({
    Wallpaper: false,
    "Top Shelf": false,
    "Bottom Shelf": false,
    Door: false,
  });

  const validateSelection = () => {
    const errors = {};
    Object.keys(categories).forEach((category) => {
      if (!selected[category]) {
        errors[category] = true;
      }
    });
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const allCategoriesSelected = () => {
    return Object.keys(categories).every((category) => selected[category]);
  };

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const newCategories = {
        Wallpaper: false,
        "Top Shelf": false,
        "Bottom Shelf": false,
        Door: false,
      };
      newCategories[category] = !prev[category];
      return newCategories;
    });
  };

  const isCategorySelected = (category) => {
    return selected[category] !== "";
  };

  const isSelectedItem = (type, image) => {
    return selected[type] === `/assets/locker/${image}`;
  };

  useEffect(() => {
    const fetchInitialState = async () => {
      setLoading(true);
      await dispatch(getDroppedAssetAndVisitor());
      setLoading(false);

      if (spawnedAsset?.dataObject?.completeImageName) {
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

  const updateLocker = (type, image) => {
    try {
      const updatedSelected = { ...selected, [type]: image };
      setSelected(updatedSelected);
      const imageNameParts = Object.keys(updatedSelected)
        .map((key) => updatedSelected[key].split("/").pop().split(".")[0])
        .filter(Boolean);

      if (imageNameParts.length === Object.keys(categories).length) {
        setCompleteImageName(imageNameParts.join("_") + ".png");
      }

      const imagesToMerge = [
        { src: "/assets/locker/lockerBase_0.png", x: 0, y: 0 },
        ...Object.values(updatedSelected).map((item) => ({
          src: item,
          x: 0,
          y: 0,
        })),
      ].filter((img) => img.src);

      mergeImages(imagesToMerge).then(setPreview);
    } catch (error) {
      console.error("error1", error);
    }
  };

  const handleSpawnAsset = async () => {
    const isValid = validateSelection();
    if (!isValid) {
      return;
    }

    setIsButtonDisabled(true);

    try {
      await dispatch(spawnAsset(completeImageName));
    } catch (error) {
      console.error("Error sending asset:", error);
    } finally {
      setIsButtonDisabled(false);
      setShowDefaultScreen(false);
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

  const handleEditLocker = async () => {
    try {
      setIsButtonSaveLockerDisabled(true);
      await dispatch(editLocker(completeImageName));
    } catch (error) {
      console.error("Error editing locker:", error);
    } finally {
      setIsButtonSaveLockerDisabled(false);
    }
  };

  const handleMoveToLocker = async () => {
    try {
      setIsButtonMoveToLockerDisabled(true);
      await dispatch(moveToAsset());
    } catch (error) {
      console.error("Error in handleMoveToLocker:", error);
    } finally {
      setIsButtonMoveToLockerDisabled(false);
    }
  };

  // Locker already in world
  // if (isAssetSpawnedInWorld && !showDefaultScreen) {
  //   return (
  //     <>
  //       <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
  //         {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
  //         <div>
  //           <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
  //             This is Your Locker!
  //           </h2>
  //         </div>
  //         <div style={{ marginBottom: "20px" }}>
  //           <img
  //             src={`/assets/locker/output/${spawnedAsset?.dataObject?.completeImageName}`}
  //           />
  //         </div>
  //         <div style={{ marginBottom: "10px" }}>
  //           <button
  //             onClick={() => handleEditLocker()}
  //             disabled={isButtonMoveToLockerDisabled}
  //           >
  //             Edit my Locker
  //           </button>
  //         </div>
  //         <div>
  //           <button
  //             onClick={() => handleMoveToLocker()}
  //             disabled={isButtonMoveToLockerDisabled}
  //           >
  //             Move to my Locker
  //           </button>
  //         </div>
  //       </div>
  //     </>
  //   );
  // }

  console.log("isButtonSaveLockerDisabled", isButtonSaveLockerDisabled);

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

      {Object.keys(categories).map((type) => (
        <div key={type}>
          <Button
            color=""
            onClick={() => toggleCategory(type)}
            style={{ marginBottom: "0px", textAlign: "left" }}
          >
            {isCategorySelected(type) && (
              <FontAwesomeIcon
                icon={faCheck}
                style={{ marginRight: "10px", color: "green" }}
              />
            )}
            {!isCategorySelected(type) && validationErrors[type] && (
              <span style={{ color: "red" }}> ❗</span>
            )}
            Select {type}
            <FontAwesomeIcon
              icon={openCategories[type] ? faChevronUp : faChevronDown}
              style={{ marginDoor: "10px" }}
            />
          </Button>
          <Collapse isOpen={openCategories[type]}>
            <div style={{ marginBottom: "10px" }}>
              {categories[type].map((image) => (
                <img
                  key={image}
                  src={`/assets/locker/${image}`}
                  alt={image}
                  className="img-accessory"
                  style={{
                    border: "1px solid #ccc",
                    borderRadius: "10px",
                    backgroundColor: isSelectedItem(type, image)
                      ? "#f0f0f0"
                      : "transparent",
                  }}
                  onClick={() => updateLocker(type, `/assets/locker/${image}`)}
                />
              ))}
            </div>
          </Collapse>
        </div>
      ))}

      {Object.keys(validationErrors).length > 0 && (
        <p style={{ color: "red" }}>
          Please select an item from each category to build the locker.
        </p>
      )}

      <div className="footer-fixed" style={{ backgroundColor: "white" }}>
        {spawnSuccess ? (
          <></>
        ) : (
          <p style={{ color: "red" }}>
            Move to the snow area to add your locker!
          </p>
        )}
        <button
          onClick={handleEditLocker}
          disabled={!allCategoriesSelected() || isButtonSaveLockerDisabled}
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default EditLocker;
