// File: EditAsset.js

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import mergeImages from "merge-images";
import { ClipLoader } from "react-spinners";
import { editAsset } from "../../../redux/actions/asset.js";
import { Collapse, Button } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronUp,
  faCheck,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";
import Gear from "../../pages/Admin/Gear.js";
import AdminView from "../../pages/Admin/AdminView.js";
import ItemVariationSelectorModal from "../ItemVariationSelector/ItemVariationSelectorModal.js";
import { getThemeData, getThemeName } from "../../../themeData2.js";

import "./EditAsset.scss";
import { capitalize } from "../../../utils/utils.js";

function EditAsset() {
  const dispatch = useDispatch();
  const BASE_URL = window.location.origin;

  const visitor = useSelector((state) => state?.session?.visitor);
  const themeName = getThemeName();
  const themeData = getThemeData(themeName);

  const [selected, setSelected] = useState(themeData?.defaultSelected);
  const [loading, setLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isButtonSaveAssetDisabled, setIsButtonSaveAssetDisabled] =
    useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemVariations, setCurrentItemVariations] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [preview, setPreview] = useState(
    `${BASE_URL}/${themeName}-assets/claimedAsset.png`
  );

  const [imageInfo, setImageInfo] = useState({});
  const isAssetAlreadyTaken = useSelector(
    (state) => state?.session?.isAssetAlreadyTaken
  );
  const [openCategories, setOpenCategories] = useState(
    themeData.defaultOpenCategories
  );

  const toggleCategory = (category) => {
    setOpenCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const isCategorySelected = (category) => {
    return selected[category]?.length > 0;
  };

  const isSelectedItem = (type, imageName) => {
    return selected[type]?.some((selectedImage) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage
        .replace(`${BASE_URL}/${themeName}-assets/`, "")
        .split(".")[0];
      const itemBaseName = imageName.split(".")[0];
      return (
        selectedBaseName === itemBaseName ||
        themeData.categories[type].some((item) => {
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
      const initialSelection = themeData.layerOrder.reduce((acc, category) => {
        const categoryKey1 = `${category.replace(/\s/g, "")}1`;
        const categoryKey2 = `${category.replace(/\s/g, "")}2`;
        acc[category] = [
          urlParams.get(categoryKey1) &&
            `${BASE_URL}/${themeName}-assets/${urlParams.get(
              categoryKey1
            )}.png`,
          urlParams.get(categoryKey2) &&
            `${BASE_URL}/${themeName}-assets/${urlParams.get(
              categoryKey2
            )}.png`,
        ].filter(Boolean);
        return acc;
      }, {});

      setSelected(initialSelection);

      const initialImageInfo = themeData.layerOrder.reduce((info, category) => {
        info[category] = initialSelection[category]
          .map((item) => ({
            imageName: item.split("/").pop().split(".")[0],
          }))
          .filter(Boolean);
        return info;
      }, {});

      setImageInfo(initialImageInfo);

      const orderedImages = themeData.layerOrder.flatMap((category) =>
        initialSelection[category] ? initialSelection[category] : []
      );

      const imagesToMerge = orderedImages.map((image) => ({
        src: image,
        x: 0,
        y: 0,
      }));

      mergeImages(imagesToMerge)
        .then(setPreview)
        .catch((error) => console.error("Error merging images:", error));
    };

    try {
      setLoading(true);
      fetchInitialState();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [dispatch, themeName]);

  const mergeImagesInOrder = (selectedImages) => {
    const orderedImages = themeData.layerOrder.flatMap((category) =>
      selectedImages[category] ? selectedImages[category] : []
    );

    const imagesToMerge = orderedImages.map((image) => ({
      src: image,
      x: 0,
      y: 0,
    }));

    return mergeImages(imagesToMerge);
  };

  const updateAsset = (type, image, item) => {
    let updatedSelection = { ...selected };

    if (image === null) {
      if (item.isRequired) {
        return;
      }
      updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
        if (item && item.hasVariation) {
          return !item.variations.some(
            (variation) =>
              `${BASE_URL}/${themeName}-assets/${variation}` === selectedItem
          );
        }
        return (
          item &&
          selectedItem !== `${BASE_URL}/${themeName}-assets/${item.name}`
        );
      });
    } else {
      if (item.hasVariation) {
        const isSelectedVariation = updatedSelection[type]?.includes(image);

        if (isSelectedVariation) {
          if (item.isRequired) {
            return;
          }
          updatedSelection[type] = updatedSelection[type].filter(
            (selectedItem) => selectedItem !== image
          );
        } else {
          updatedSelection[type] = updatedSelection[type].filter(
            (selectedItem) => {
              return !item.variations.some(
                (variation) =>
                  `${BASE_URL}/${themeName}-assets/${variation}` ===
                  selectedItem
              );
            }
          );
          updatedSelection[type].push(image);
        }
      } else {
        console.log("selected[type]", selected[type], selected, type);
        const isSelected = selected[type].includes(image);
        if (themeData.selectionLimits[type] === 1) {
          updatedSelection[type] = isSelected ? [] : [image];
        } else {
          if (isSelected) {
            if (item.isRequired) {
              return;
            }
            updatedSelection[type] = updatedSelection[type].filter(
              (i) => i !== image
            );
          } else {
            updatedSelection[type].push(image);
          }
        }
      }
    }

    const requiredItem = themeData.categories[type].find(
      (item) => item.isRequired
    );
    if (
      requiredItem &&
      !updatedSelection[type].some((selectedItem) =>
        requiredItem.variations.includes(
          selectedItem.replace(`${BASE_URL}/${themeName}-assets/`, "")
        )
      )
    ) {
      updatedSelection[type].unshift(
        `${BASE_URL}/${themeName}-assets/${requiredItem.variations[0]}`
      );
    }

    if (type === Object.keys(themeData.categories)[0]) {
      const requiredItemIndex = updatedSelection[type].findIndex(
        (selectedItem) =>
          requiredItem.variations.includes(
            selectedItem.replace(`${BASE_URL}/${themeName}-assets/`, "")
          )
      );
      if (requiredItemIndex !== -1) {
        const requiredImage = updatedSelection[type].splice(
          requiredItemIndex,
          1
        )[0];
        updatedSelection[type].unshift(requiredImage);
      }
    }

    setSelected(updatedSelection);

    const updatedImageInfo = themeData.layerOrder.reduce((info, category) => {
      if (updatedSelection[category]) {
        info[category] = updatedSelection[category]
          .map((item) => {
            if (item) {
              return {
                imageName: item.split("/").pop().split(".")[0],
              };
            }
            return null;
          })
          .filter(Boolean);
      } else {
        info[category] = [];
      }
      return info;
    }, {});

    setImageInfo(updatedImageInfo);

    // Prepara as imagens para merge na ordem correta
    const orderedImages = themeData.layerOrder.flatMap((category) =>
      updatedSelection[category] ? updatedSelection[category] : []
    );

    const imagesToMerge = orderedImages.map((image) => ({
      src: image,
      x: 0,
      y: 0,
    }));

    // Realiza o merge das imagens e atualiza o preview
    mergeImages(imagesToMerge).then(setPreview);
  };

  const handleOpenModalWithVariations = (item, type) => {
    const variations = item.variations || [];
    const currentSelection = selected[type].find((selectedImage) => {
      if (!selectedImage) return false;

      const selectedBaseName = selectedImage
        .replace(`${BASE_URL}/${themeName}-assets/`, "")
        .split(".")[0];
      return item.variations.some((variation) => {
        const variationBaseName = variation.split(".")[0];
        return selectedBaseName === variationBaseName;
      });
    });
    const currentSelectionVariation = currentSelection
      ? currentSelection.replace(`${BASE_URL}/${themeName}-assets/`, "")
      : null;
    setCurrentItemVariations(variations);
    setCurrentItem({ ...item, type });
    setIsModalOpen(true);
    setSelectedVariation(currentSelectionVariation);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveToBackend = async () => {
    try {
      setIsButtonSaveAssetDisabled(true);
      await dispatch(editAsset(imageInfo));
    } catch (error) {
      console.error(`Error editing ${themeName}:`, error);
    } finally {
      setIsButtonSaveAssetDisabled(false);
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

  if (isAssetAlreadyTaken) {
    return (
      <>
        <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
          <h1>This {themeName} is already taken</h1>
          <p>Please select another {themeName}!</p>
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
            if (selectedVariation) {
              const imageUrl = `${BASE_URL}/${themeName}-assets/${selectedVariation}`;
              updateAsset(currentItem.type, imageUrl, currentItem);
            } else {
              updateAsset(currentItem.type, null, currentItem);
            }
          }}
          onClose={handleCloseModal}
          selectedVariation={selectedVariation}
        />
      ) : (
        ""
      )}
      <div className={`wrapper ${visitor?.isAdmin ? "mt-90" : ""}`}>
        {visitor?.isAdmin ? Gear({ setShowSettings }) : <></>}
        <h2 style={{ marginBottom: "0px", paddingBottom: "0px" }}>
          Build your {themeData.name}!
        </h2>
        <img
          src={
            preview === "data:,"
              ? `${BASE_URL}/${themeName}-assets/claimedAsset.png`
              : preview
          }
          alt={`${themeData.name} Preview`}
          style={{ marginTop: "30px", marginBottom: "30px" }}
          className="img-preview"
        />

        {Object.keys(themeData.categories).map((type) => (
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
            <Collapse
              isOpen={openCategories[type]}
              style={{ textAlign: "center" }}
            >
              <div style={{ marginBottom: "10px", textAlign: "left" }}>
                {themeData.categories[type].map((item) => (
                  <div
                    key={item.name}
                    style={{ position: "relative", display: "inline-block" }}
                  >
                    {item.hasVariation && (
                      <div
                        style={{
                          position: "absolute",
                          top: "7px",
                          right: "7px",
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
                          src="https://sdk-style.s3.amazonaws.com/icons/copy.svg"
                          alt="Expand"
                          style={{
                            width: "15px",
                            height: "15px",
                          }}
                        />
                      </div>
                    )}
                    <img
                      src={`${BASE_URL}/${themeName}-assets/${item.name}`}
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
                          updateAsset(
                            type,
                            `${BASE_URL}/${themeName}-assets/${item.name}`,
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
            Please select an item from each category to build the asset.
          </p>
        )}

        <div className="footer-wrapper">
          <div className="footer-fixed" style={{ backgroundColor: "white" }}>
            <button
              onClick={handleSaveToBackend}
              disabled={
                !selected[themeData.baseCategoryName].length > 0 ||
                isButtonSaveAssetDisabled
              }
            >
              {themeData.saveButtonText}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default EditAsset;
