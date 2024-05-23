import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { editLocker } from "../../../redux/actions/locker";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import Gear from "../../pages/Admin/Gear";
import AdminView from "../../pages/Admin/AdminView";
import ItemVariationSelectorModal from "../ItemVariationSelector/ItemVariationSelectorModal.js";

import "./EditLocker.scss";

const categories = {
  "Locker Base": [
    { name: "lockerBase_0.png", hasVariation: false },
    { name: "lockerBase_1.png", hasVariation: false },
    { name: "lockerBase_2.png", hasVariation: false },
    { name: "lockerBase_3.png", hasVariation: false },
    { name: "lockerBase_4.png", hasVariation: false },
    { name: "lockerBase_5.png", hasVariation: false },
  ],
  Wallpaper: [
    { name: "wallpaper_0.png", hasVariation: false },
    { name: "wallpaper_1.png", hasVariation: false },
    { name: "wallpaper_2.png", hasVariation: false },
    { name: "wallpaper_3.png", hasVariation: false },
    { name: "wallpaper_4.png", hasVariation: false },
  ],
  Border: [
    { name: "border_0.png", hasVariation: false },
    { name: "border_1.png", hasVariation: false },
    { name: "border_2.png", hasVariation: false },
    { name: "border_3.png", hasVariation: false },
  ],
  "Top Shelf": [
    {
      name: "topShelf_0.png",
      hasVariation: true,
      variations: ["topShelf_0.png", "topShelf_1.png"],
    },
    { name: "topShelf_2.png", hasVariation: false },
    { name: "topShelf_3.png", hasVariation: false },
    { name: "topShelf_4.png", hasVariation: false },
    { name: "topShelf_5.png", hasVariation: false },
    { name: "topShelf_6.png", hasVariation: false },
    { name: "topShelf_7.png", hasVariation: false },
    { name: "topShelf_8.png", hasVariation: false },
  ],
  "Bottom Shelf": [
    { name: "bottomShelf_0.png", hasVariation: false },
    { name: "bottomShelf_1.png", hasVariation: false },
    {
      name: "bottomShelf_2.png",
      hasVariation: true,
      variations: [
        "bottomShelf_2.png",
        "bottomShelf_3.png",
        "bottomShelf_4.png",
        "bottomShelf_5.png",
        "bottomShelf_6.png",
      ],
    },
    {
      name: "bottomShelf_7.png",
      hasVariation: true,
      variations: ["bottomShelf_7.png", "bottomShelf_8.png"],
    },
  ],
  Door: [
    {
      name: "door_0.png",
      hasVariation: true,
      variations: ["door_0.png", "door_5.png"],
    },
    { name: "door_1.png", hasVariation: false },
    { name: "door_2.png", hasVariation: false },
    { name: "door_3.png", hasVariation: false },
    { name: "door_4.png", hasVariation: false },
    { name: "door_6.png", hasVariation: false },
    { name: "door_7.png", hasVariation: false },
    { name: "door_8.png", hasVariation: false },
  ],
};

const selectionLimits = {
  "Locker Base": 1,
  Wallpaper: 1,
  Border: 1,
  "Top Shelf": Infinity,
  "Bottom Shelf": Infinity,
  Door: Infinity,
};

function EditLocker() {
  const dispatch = useDispatch();
  const BASE_URL = window.location.origin;

  const visitor = useSelector((state) => state?.session?.visitor);

  const [selected, setSelected] = useState({
    "Locker Base": [`${BASE_URL}/locker-assets/lockerBase_0.png`],
    Wallpaper: [],
    Border: [],
    "Top Shelf": [],
    "Bottom Shelf": [],
    Door: [],
  });

  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonSaveLockerDisabled, setIsButtonSaveLockerDisabled] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemVariations, setCurrentItemVariations] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);

  const [preview, setPreview] = useState(
    `${BASE_URL}/locker-assets/defaultClaimedLocker.png`
  );
  const [imageInfo, setImageInfo] = useState({});
  const isLockerAlreadyTaken = useSelector(
    (state) => state?.session?.isLockerAlreadyTaken
  );
  const [openCategories, setOpenCategories] = useState({
    "Locker Base": true,
    Wallpaper: false,
    Border: false,
    "Top Shelf": false,
    "Bottom Shelf": false,
    Door: false,
  });

  const toggleCategory = (category) => {
    setOpenCategories((prev) => {
      const newCategories = {
        Wallpaper: false,
        Border: false,
        "Top Shelf": false,
        "Bottom Shelf": false,
        Door: false,
      };
      newCategories[category] = !prev[category];
      return newCategories;
    });
  };

  const handleOpenModalWithVariations = (item, type) => {
    const variations = item.variations || [];
    setCurrentItemVariations(variations);
    setCurrentItem({ ...item, type });
    setIsModalOpen(true);
  };

  const isCategorySelected = (category) => {
    return selected[category].length > 0;
  };

  const isSelectedItem = (type, imageName) => {
    return selected[type].some((selectedImage) => {
      const selectedBaseName = selectedImage
        .replace(`${BASE_URL}/locker-assets/`, "")
        .split(".")[0];
      const itemBaseName = imageName.split(".")[0];
      return (
        selectedBaseName === itemBaseName ||
        categories[type].some((item) => {
          if (item.name.split(".")[0] === itemBaseName && item.hasVariation) {
            return item.variations.some((variation) => {
              const variationBaseName = variation.split(".")[0];
              return selectedBaseName === variationBaseName;
            });
          }
          return false;
        })
      );
    });
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

    try {
      setLoading(true);
      fetchInitialState();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch]);

  const updateLocker = (type, image, item) => {
    let updatedSelection = { ...selected };

    if (item.hasVariation) {
      const isSelectedVariation = updatedSelection[type].includes(image);

      if (isSelectedVariation) {
        updatedSelection[type] = updatedSelection[type].filter(
          (selectedItem) => selectedItem !== image
        );
      } else {
        updatedSelection[type] = updatedSelection[type].filter(
          (selectedItem) => {
            return !item.variations.some(
              (variation) =>
                `${BASE_URL}/locker-assets/${variation}` === selectedItem
            );
          }
        );
        updatedSelection[type].push(image);
      }
    } else {
      const isSelected = selected[type].includes(image);
      if (selectionLimits[type] === 1) {
        updatedSelection[type] = isSelected ? [] : [image];
      } else {
        if (isSelected) {
          updatedSelection[type] = updatedSelection[type].filter(
            (i) => i !== image
          );
        } else {
          updatedSelection[type].push(image);
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

    const imagesToMerge = Object.values(updatedSelection)
      .flat()
      .map((i) => ({
        src: i,
        x: 0,
        y: 0,
      }))
      .filter((img) => img.src);

    mergeImages(imagesToMerge).then(setPreview);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

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
    <>
      {isModalOpen ? (
        <ItemVariationSelectorModal
          isOpen={isModalOpen}
          variations={currentItemVariations}
          onSelect={(selectedVariation) => {
            const imageUrl = `${BASE_URL}/locker-assets/${selectedVariation}`;
            updateLocker(currentItem.type, imageUrl, currentItem);
          }}
          onClose={handleCloseModal}
        />
      ) : (
        ""
      )}
      <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
          Build your Locker!
        </h2>
        <img
          src={
            preview == "data:,"
              ? `${BASE_URL}/locker-assets/defaultClaimedLocker.png`
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
                style={{ marginLeft: "10px" }}
              />
            </Button>
            <Collapse isOpen={openCategories[type]}>
              <div style={{ marginBottom: "10px" }}>
                {categories[type].map((item) => (
                  <div
                    key={item.name}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    {item.hasVariation && (
                      <div
                        style={{
                          position: "absolute",
                          top: "12px",
                          right: "12px",
                          backgroundColor: "white",
                          borderRadius: "50%",
                          width: "16px",
                          height: "16px",
                          display: "flex",
                          justifyContent: "end",
                          alignItems: "center",
                          zIndex: 1,
                        }}
                      >
                        <img
                          src="https://sdk-style.s3.amazonaws.com/icons/expand.svg"
                          alt="Expand"
                          style={{
                            width: "12px",
                            height: "12px",
                          }}
                        />
                      </div>
                    )}
                    <img
                      src={`${BASE_URL}/locker-assets/${item.name}`}
                      alt={item.name}
                      className="img-accessory"
                      style={{
                        borderRadius: "10px",
                        padding: "5px",
                        backgroundColor: isSelectedItem(type, item.name)
                          ? "#edeffc"
                          : "transparent",
                        border: isSelectedItem(type, item.name)
                          ? "1px solid #4355e4"
                          : "1px solid #ccc",
                        cursor: "pointer",
                        margin: "5px",
                      }}
                      onClick={() => {
                        if (item.hasVariation) {
                          handleOpenModalWithVariations(item, type);
                          return;
                        } else {
                          updateLocker(
                            type,
                            `${BASE_URL}/locker-assets/${item.name}`,
                            item
                          );
                        }
                      }}
                    />
                  </div>
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

        <div className="footer-wrapper">
          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <button
              onClick={handleSaveToBackend}
              disabled={
                !selected["Locker Base"].length > 0 ||
                isButtonSaveLockerDisabled
              }
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditLocker;
