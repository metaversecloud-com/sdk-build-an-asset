import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { editLocker, moveToAsset } from "../../../redux/actions/locker";
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

function EditLocker() {
  const dispatch = useDispatch();
  const BASE_URL = window.location.origin;

  const visitor = useSelector((state) => state?.session?.visitor);

  const [selected, setSelected] = useState({
    "Locker Base": [],
    Wallpaper: [],
    "Top Shelf": [],
    "Bottom Shelf": [],
    Door: [],
  });

  const [loading, setLoading] = useState(false);
  useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonSaveLockerDisabled, setIsButtonSaveLockerDisabled] =
    useState(false);
  const [isButtonMoveToLockerDisabled, setIsButtonMoveToLockerDisabled] =
    useState(false);
  const [preview, setPreview] = useState(
    `https://${
      process.env.S3_BUCKET_BUILD_AN_ASSET || "build-an-asset"
    }.s3.amazonaws.com/unclaimedLocker.png`
  );
  const [imageInfo, setImageInfo] = useState({});
  const isLockerAlreadyTaken = useSelector(
    (state) => state?.session?.isLockerAlreadyTaken
  );
  const [openCategories, setOpenCategories] = useState({
    Wallpaper: false,
    "Top Shelf": false,
    "Bottom Shelf": false,
    Door: false,
  });

  const allCategoriesSelected = () => {
    const lockerBaseSelected = selected["Locker Base"].length > 0;

    const otherCategoriesSelected = Object.keys(categories).every(
      (category) => category === "Locker Base" || selected[category].length > 0
    );

    return lockerBaseSelected && otherCategoriesSelected;
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
    return selected[category].length > 0;
  };

  const isSelectedItem = (type, image) => {
    return selected[type].includes(`${BASE_URL}/locker-assets/${image}`);
  };

  useEffect(() => {
    const fetchInitialState = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const initialSelection = Object.keys(categories).reduce(
        (acc, category) => {
          const categoryKey1 = `${category.replace(/\s/g, "")}1`;
          const categoryKey2 = `${category.replace(/\s/g, "")}2`;
          acc[category] = [
            urlParams.get(categoryKey1) &&
              `${BASE_URL}/locker-assets/${urlParams.get(categoryKey1)}.png`,
            urlParams.get(categoryKey2) &&
              `${BASE_URL}/locker-assets/${urlParams.get(categoryKey2)}.png`,
          ].filter(Boolean);
          return acc;
        },
        {}
      );

      setSelected(initialSelection);

      const imagesToMerge = Object.values(initialSelection)
        .flat()
        .map((item) => ({
          src: item,
          x: 0,
          y: 0,
        }));

      mergeImages(imagesToMerge)
        .then(setPreview)
        .catch((error) => console.error("Erro ao mesclar imagens:", error));
    };

    fetchInitialState();
  }, [dispatch]);

  const updateLocker = (type, image) => {
    try {
      let updatedSelection = { ...selected };

      if (type === "Locker Base") {
        // Allow only one selection for Locker Base
        updatedSelection[type] = [image];
      } else {
        // Allow multiple selections for the other categories
        if (selected[type].includes(image)) {
          updatedSelection[type] = selected[type].filter(
            (item) => item !== image
          );
        } else {
          if (selected[type].length < 2) {
            updatedSelection[type] = [...selected[type], image];
          }
        }
      }

      setSelected(updatedSelection);

      const updatedImageInfo = Object.keys(updatedSelection).reduce(
        (info, key) => {
          info[key] = updatedSelection[key].map((item) => ({
            imageName: item.split("/").pop().split(".")[0],
          }));
          return info;
        },
        {}
      );
      setImageInfo(updatedImageInfo);

      const imagesToMerge = [
        ...Object.values(updatedSelection)
          .flat()
          .map((item) => ({
            src: item,
            x: 0,
            y: 0,
          })),
      ].filter((img) => img.src);

      mergeImages(imagesToMerge).then(setPreview);
    } catch (error) {
      console.error("Erro ao atualizar o locker:", error);
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

  const handleSaveToBackend = async () => {
    try {
      setIsButtonSaveLockerDisabled(true);
      await dispatch(editLocker(imageInfo));
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

  if (isLockerAlreadyTaken) {
    return (
      <>
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          <h1>This locker is already taken</h1>
          <p>Please select another locker!</p>
        </div>
      </>
    );
  }

  return (
    <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
      {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
      <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
        Build your Locker!
      </h2>
      <img
        src={
          preview == "data:,"
            ? `https://${
                process.env.S3_BUCKET_BUILD_AN_ASSET || "build-an-asset"
              }.s3.amazonaws.com/unclaimedLocker.png`
            : preview
        }
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
                  src={`${BASE_URL}/locker-assets/${image}`}
                  alt={image}
                  className="img-accessory"
                  style={{
                    borderRadius: "10px",
                    padding: "5px",
                    backgroundColor: isSelectedItem(type, image)
                      ? "#edeffc"
                      : "transparent",
                    border: isSelectedItem(type, image)
                      ? "1px solid #4355e4"
                      : "1px solid #ccc",
                  }}
                  onClick={() =>
                    updateLocker(type, `${BASE_URL}/locker-assets/${image}`)
                  }
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
        {/* <div style={{ marginBottom: "5px" }}>
          <button
            onClick={handleMoveToLocker}
            disabled={
              !allCategoriesSelected() ||
              isButtonSaveLockerDisabled ||
              isButtonMoveToLockerDisabled
            }
          >
            Move to my locker
          </button>
        </div> */}
        <button
          onClick={handleSaveToBackend}
          disabled={
            !allCategoriesSelected() ||
            isButtonSaveLockerDisabled ||
            isButtonMoveToLockerDisabled
          }
        >
          Save
        </button>
      </div>
    </div>
  );
}

export default EditLocker;
