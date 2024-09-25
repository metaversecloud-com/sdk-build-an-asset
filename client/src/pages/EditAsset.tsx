import { useContext, useEffect, useState } from "react";
import mergeImages from "merge-images";

import { CategoryType } from "@/constants";

// components
import { PageContainer, ItemVariationSelectorModal } from "@/components/index.js";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR, SET_GAME_STATE } from "@/context/types.js";

// utils
import { backendAPI, getS3URL, getThemeData, getThemeName } from "@/utils";

export const EditAsset = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { visitorIsAdmin } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const themeData = getThemeData();
  const { categories, defaultSelected, dropAssetInRandomLocation, layerOrder, name, saveButtonText, selectionLimits } =
    themeData;

  const S3URL = `${getS3URL()}/${themeName}`;

  const [selected, setSelected] = useState(defaultSelected);

  const [isLoading, setLoading] = useState(false);
  const [isButtonSaveAssetDisabled, setIsButtonSaveAssetDisabled] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItemVariations, setCurrentItemVariations] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<{ type: string; imageName: string; variations?: string[] }>();
  const [validationErrors, setValidationErrors] = useState<{ [type: string]: boolean }>({});

  const [selectedItem, setSelectedItem] = useState<string>("");
  const [preview, setPreview] = useState(`${S3URL}/claimedAsset.png`);

  const [imageInfo, setImageInfo] = useState({});

  const isSelectedItem = (type: string, imageName: string) => {
    return selected[type]?.some((selectedImage: string) => {
      if (!selectedImage) return false;

      return (
        selectedImage === imageName ||
        categories[type].some((item) => {
          if (item.imageName.split(".")[0] === imageName && item.variations) {
            return item.variations?.some((variation) => {
              return selectedImage === variation;
            });
          }
          return false;
        })
      );
    });
  };

  useEffect(() => {
    setLoading(true);
    fetchInitialState()
      .catch((error) => console.error(error))
      .finally(() => setLoading(false));
  }, []);

  const fetchInitialState = async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const initialSelection = layerOrder.reduce((info: { [category: string]: string[] }, category: string) => {
      info[category] = [];

      for (const key of urlParams.keys()) {
        if (key.includes(`${category.replace(/\s/g, "")}`)) {
          info[category].push(`${urlParams.get(key)}`);
        }
      }

      return info;
    }, {});

    getPreview(initialSelection);
  };

  const updateAsset = (type: string, image: string, item: CategoryType) => {
    setIsButtonSaveAssetDisabled(false);
    setValidationErrors({ ...validationErrors, [type]: false });
    const updatedSelection = { ...selected };

    if (!image) {
      // selection is cleared
      if (item.isRequired) {
        setIsButtonSaveAssetDisabled(true);
        setValidationErrors({ [type]: true });
        return;
      }
      updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
        if (item && item.variations) {
          return !item.variations?.some((variation) => variation === selectedItem);
        }
        return item && selectedItem !== item.imageName;
      });
    } else {
      if (selectionLimits[type].max === 1) {
        updatedSelection[type] = [image];
      } else {
        if (item.variations) {
          // remove all other variations from array
          updatedSelection[type] = updatedSelection[type].filter((selectedItem) => {
            return !item.variations?.some((variation) => variation === selectedItem);
          });
        }
        // add item to array
        updatedSelection[type].push(image);
      }
    }

    if (selectionLimits[type].min > 0 && updatedSelection[type].length < selectionLimits[type].min) {
      setIsButtonSaveAssetDisabled(true);
      setValidationErrors({ [type]: true });
    }

    getPreview(updatedSelection);
  };

  const getPreview = (selection: { [key: string]: string[] }) => {
    setSelected(selection);

    const updatedImageInfo = layerOrder.reduce((info: { [category: string]: object }, category: string) => {
      if (selection[category]) {
        info[category] = selection[category]
          .map((item) => {
            if (item) return { imageName: item };
            return null;
          })
          .filter(Boolean);
      } else {
        info[category] = [];
      }
      return info;
    }, {});

    setImageInfo(updatedImageInfo);

    const orderedImages = layerOrder.flatMap((category) => (selection[category] ? selection[category] : []));

    const imagesToMerge = orderedImages.map((image) => ({
      src: `${S3URL}/${image}`,
      x: 0,
      y: 0,
      crossOrigin: "Anonymous",
    }));
    console.log("🚀 ~ file: EditAsset.tsx:152 ~ imagesToMerge:", imagesToMerge);

    mergeImages(imagesToMerge)
      // mergeImages(imagesToMerge)
      .then((result) => {
        return setPreview(result);
      })
      .catch((error) => console.error(error));
  };

  const handleOpenModalWithVariations = (item: CategoryType, type: string) => {
    if (!item.variations) return;
    const currentSelection = selected[type].find((selectedImage) => {
      if (!selectedImage) return false;

      return item.variations?.some((variation) => {
        return selectedImage === variation;
      });
    });

    setCurrentItemVariations(item.variations);
    setCurrentItem({ ...item, type });
    setIsModalOpen(true);
    setSelectedItem(currentSelection || "");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveToBackend = () => {
    setIsButtonSaveAssetDisabled(true);

    const url = dropAssetInRandomLocation ? "/dropped-assets/drop" : "/dropped-assets/edit";

    backendAPI
      .post(url, { imageInfo })
      .then((response) => {
        dispatch!({
          type: SET_GAME_STATE,
          payload: { ...response.data, error: "" },
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while dropping or updating an asset" },
        });
      })
      .finally(() => {
        setIsButtonSaveAssetDisabled(false);
      });
  };

  return (
    <>
      {isModalOpen && currentItem ? (
        <ItemVariationSelectorModal
          isOpen={isModalOpen}
          variations={currentItemVariations}
          onSelect={(selectedItem) => {
            updateAsset(currentItem.type, selectedItem, currentItem);
          }}
          onClose={handleCloseModal}
          selectedItem={selectedItem || ""}
        />
      ) : (
        ""
      )}
      <PageContainer
        isLoading={isLoading}
        headerText={`Build your ${name}!`}
        previewImageURL={preview === "data:," ? `${S3URL}/claimedAsset.png` : preview}
        showClearAssetBtn={visitorIsAdmin}
        footerContent={
          <button onClick={handleSaveToBackend} className="btn" disabled={isButtonSaveAssetDisabled}>
            {saveButtonText}
          </button>
        }
      >
        {Object.keys(categories).map((type) => (
          <div key={type}>
            <section id="accordion" className="accordion m-4">
              <div className="accordion-container">
                <details className="accordion-item">
                  <summary className="accordion-trigger">
                    <span className="accordion-title">Select {type}</span>
                    <img
                      className="accordion-icon"
                      aria-hidden="true"
                      src="https://sdk-style.s3.amazonaws.com/icons/chevronDown.svg"
                    />
                  </summary>
                  <div className="accordion-content mt-4">
                    <div className="items-container">
                      {categories[type].map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (item.variations) {
                              handleOpenModalWithVariations(item, type);
                              return;
                            } else {
                              updateAsset(type, item.imageName, item);
                            }
                          }}
                          className={`card ${item.imageName && isSelectedItem(type, item.imageName) ? "success" : ""}`}
                        >
                          {item.variations && (
                            <div
                              style={{
                                position: "absolute",
                                top: "7px",
                                right: "7px",
                                backgroundColor: "white",
                                borderRadius: "50%",
                              }}
                            >
                              <img
                                src="https://sdk-style.s3.amazonaws.com/icons/copy.svg"
                                alt="Expand"
                                style={{
                                  width: "20px",
                                  height: "20px",
                                  padding: "2px",
                                }}
                              />
                            </div>
                          )}
                          <img src={`${S3URL}/${item.imageName}`} alt={item.imageName} />
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
                {validationErrors[type] && <p className="p3 text-error">A {type} is required.</p>}
              </div>
            </section>
          </div>
        ))}
      </PageContainer>
    </>
  );
};

export default EditAsset;
