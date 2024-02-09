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
import ItemVariationSelectorModal from "../ItemVariationSelector/ItemVariationSelectorModal.js";

import "./EditLocker.scss";

const categories = {
  "Locker Base": [
    { name: "lockerBase_0.png", hasVariation: false },
    { name: "lockerBase_1.png", hasVariation: false },
    { name: "lockerBase_2.png", hasVariation: false },
    { name: "lockerBase_3.png", hasVariation: false },
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
    { name: "bottomShelf_2.png", hasVariation: false },
    { name: "bottomShelf_3.png", hasVariation: false },
    { name: "bottomShelf_4.png", hasVariation: false },
    { name: "bottomShelf_5.png", hasVariation: false },
    { name: "bottomShelf_6.png", hasVariation: false },
    { name: "bottomShelf_7.png", hasVariation: false },
    { name: "bottomShelf_8.png", hasVariation: false },
  ],
  Door: [
    { name: "door_0.png", hasVariation: false },
    { name: "door_1.png", hasVariation: false },
    { name: "door_2.png", hasVariation: false },
    { name: "door_3.png", hasVariation: false },
    { name: "door_4.png", hasVariation: false },
    { name: "door_5.png", hasVariation: false },
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
    "Locker Base": [],
    Wallpaper: [],
    Border: [],
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
    Wallpaper: false,
    Border: false,
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

  const updateLocker = (type, image, item) => {
    try {
      let updatedSelection = { ...selected };
      const limit = selectionLimits[type] || Infinity;
      const isSelected = selected[type].includes(image);

      if (limit === 1) {
        updatedSelection[type] = isSelected ? [] : [image];
      } else {
        if (isSelected) {
          updatedSelection[type] = updatedSelection[type].filter(
            (item) => item !== image
          );
        } else {
          if (updatedSelection[type].length < limit) {
            updatedSelection[type] = [...updatedSelection[type], image];
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
        .map((item) => ({
          src: item,
          x: 0,
          y: 0,
        }))
        .filter((img) => img.src);

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

  const handleVariationSelect = (selectedVariation) => {
    const updatedSelection = { ...selected };

    const newItemUrl = `${BASE_URL}/locker-assets/${selectedVariation}.png`;

    updatedSelection[currentItem.category] = [newItemUrl];

    setSelected(updatedSelection);
    setIsModalOpen(false);
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
            console.log(
              "updateLocker1 params",
              currentItem.type,
              imageUrl,
              currentItem
            );
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
                  <img
                    key={item.name}
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
                        console.log("item", item);
                        handleOpenModalWithVariations(item, type);
                        return;
                      } else {
                        console.log(
                          "updateLocker2 params",
                          type,
                          `${BASE_URL}/locker-assets/${item.name}`,
                          item
                        );
                        updateLocker(
                          type,
                          `${BASE_URL}/locker-assets/${item.name}`,
                          item
                        );
                      }
                    }}
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
    </>
  );
}

export default EditLocker;
