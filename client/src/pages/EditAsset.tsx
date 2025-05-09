import { useContext, useEffect, useState } from "react";

// constants
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
  const {
    bottomLayerOrder,
    categories,
    shouldDropAsset,
    name,
    saveButtonText,
    splashImage,
    splashImageSize,
    topLayerOrder,
  } = getThemeData();

  const S3URL = `${getS3URL()}/${themeName}`;

  const [selected, setSelected] = useState(
    Object.keys(categories).reduce((acc: { [key: string]: string[] }, key) => {
      acc[key] = [];
      return acc;
    }, {}),
  );

  const [isLoading, setLoading] = useState(false);
  const [isButtonSaveAssetDisabled, setIsButtonSaveAssetDisabled] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{ [category: string]: boolean }>({});

  // imageInfo sent to backend on handleSaveToBackend
  const [imageInfo, setImageInfo] = useState({});
  // images displayed in preview (stacked in order)
  const [images, setImages] = useState<string[]>([]);
  const [requiredTopLayerCategories, setRequiredTopLayerCategories] = useState<string[]>([]);
  const [requiredBottomLayerCategories, setRequiredBottomLayerCategories] = useState<string[]>([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  // selectedItem is the variation selected in the modal
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [currentItemVariations, setCurrentItemVariations] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState<{ category: string; imageName: string; variations?: string[] }>();

  useEffect(() => {
    setLoading(true);
    getInitialSelection();

    const requiredTop = topLayerOrder.filter((category) => categories[category].selectionLimits?.min > 0);
    setRequiredTopLayerCategories(requiredTop);

    const requiredBottom = bottomLayerOrder
      ? bottomLayerOrder.filter((category) => categories[category].selectionLimits?.min > 0)
      : [];
    setRequiredBottomLayerCategories(requiredBottom);
  }, []);

  useEffect(() => {
    const errors: { [category: string]: boolean } = {};
    for (const category in selected) {
      if (
        categories[category].selectionLimits &&
        categories[category].selectionLimits.min > 0 &&
        selected[category].length < categories[category].selectionLimits.min
      ) {
        errors[category] = true;
      }
    }

    setValidationErrors(errors);
  }, [selected]);

  useEffect(() => {
    if (Object.keys(validationErrors).filter((key) => validationErrors[key]).length > 0)
      setIsButtonSaveAssetDisabled(true);
    else setIsButtonSaveAssetDisabled(false);
  }, [validationErrors]);

  const getInitialSelection = async () => {
    const urlParams = new URLSearchParams(window.location.search);

    const getSelection = (layerOrder: string[]) => {
      return layerOrder.reduce((info: { [category: string]: string[] }, category: string) => {
        info[category] = [];
        for (const key of urlParams.keys()) {
          if (key.replace(/[0-9]/g, "") === `${category.replace(" ", "")}`) {
            info[category].push(`${urlParams.get(key)}`);
          }
        }
        return info;
      }, {});
    };

    const topSelection = await getSelection(topLayerOrder);
    const bottomSelection = bottomLayerOrder ? await getSelection(bottomLayerOrder) : {};

    getPreview({ ...topSelection, ...bottomSelection });
    setLoading(false);
  };

  const updateAsset = (category: string, image: string, item: CategoryType) => {
    setValidationErrors({ ...validationErrors, [category]: false });
    const updatedSelection = selected;

    if (!image) {
      // selection is cleared
      updatedSelection[category] = updatedSelection[category].filter((selectedItem) => {
        if (item && item.variations) {
          return !item.variations?.some((variation) => variation === selectedItem);
        }
        return item && selectedItem !== item.imageName;
      });
      if (item.defaultImage) updatedSelection[category].push(item.defaultImage);
    } else if (updatedSelection[category].includes(image)) {
      // selection is toggled, remove item from array
      updatedSelection[category] = updatedSelection[category].filter((selectedItem) => selectedItem !== image);
    } else {
      if (categories[category].selectionLimits?.max === 1) {
        // TODO: solve for max !== 1 && max !== Infinity
        updatedSelection[category] = [image];
      } else {
        if (item.variations) {
          // remove all other variations from array
          updatedSelection[category] = updatedSelection[category].filter((selectedItem) => {
            return !item.variations?.some((variation) => variation === selectedItem);
          });
        }
        // add item to array
        updatedSelection[category].push(image);
      }
    }

    getPreview(updatedSelection);
  };

  const getPreview = async (selection: { [key: string]: string[] }) => {
    setSelected(selection);

    const getImageInfo = (layerOrder: string[]) => {
      return layerOrder.reduce((info: { [category: string]: object }, category: string) => {
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
    };

    const topLayerInfo = await getImageInfo(topLayerOrder);

    const bottomLayerInfo = bottomLayerOrder ? await getImageInfo(bottomLayerOrder) : {};
    setImageInfo({ topLayerInfo, bottomLayerInfo });

    const orderedBottomImage = bottomLayerOrder
      ? bottomLayerOrder.flatMap((category) => (selection[category] ? selection[category] : []))
      : [];
    const orderedTopImage = topLayerOrder.flatMap((category) => (selection[category] ? selection[category] : []));
    setImages([...orderedBottomImage, ...orderedTopImage]);
  };

  const isSelectedItem = (category: string, imageName: string) => {
    return selected[category]?.some((selectedImage: string) => {
      if (!selectedImage) return false;

      return (
        selectedImage === imageName ||
        categories[category].items.some((item) => {
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

  const getItemSrc = (category: string, imageName: string, variations?: string[]) => {
    let imgSrc = `${S3URL}/${imageName}`;
    const selectedSet = new Set(selected[category]);
    const matches = variations?.filter((str: string) => selectedSet.has(str));
    if (matches && matches.length > 0) imgSrc = `${S3URL}/${matches[0]}`;
    return imgSrc;
  };

  const handleOpenModalWithVariations = (item: CategoryType, category: string) => {
    if (!item.variations) return;
    const currentSelection = selected[category].find((selectedImage) => {
      if (!selectedImage) return false;

      return item.variations?.some((variation) => {
        return selectedImage === variation;
      });
    });

    setCurrentItemVariations(item.variations);
    setCurrentItem({ ...item, category });
    setIsModalOpen(true);
    setSelectedItem(currentSelection || "");
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSaveToBackend = () => {
    setIsButtonSaveAssetDisabled(true);

    const url = shouldDropAsset ? "/dropped-assets/drop" : "/dropped-assets/edit";

    backendAPI
      .post(url, { imageInfo, requiredTopLayerCategories, requiredBottomLayerCategories })
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
            updateAsset(currentItem.category, selectedItem, currentItem);
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
        showClearAssetBtn={visitorIsAdmin}
        footerContent={
          <button onClick={handleSaveToBackend} className="btn" disabled={isButtonSaveAssetDisabled}>
            {saveButtonText}
          </button>
        }
      >
        <div style={{ height: splashImageSize, position: "relative" }}>
          {images.length > 0 ? (
            images.map((image, index) => {
              return (
                <img
                  key={index}
                  src={`${S3URL}/${image}`}
                  className="m-auto preview"
                  style={{ height: splashImageSize, zIndex: index }}
                />
              );
            })
          ) : (
            <img
              src={splashImage}
              alt={`${name} Preview`}
              className="m-auto preview"
              style={{ height: splashImageSize }}
            />
          )}
        </div>
        {Object.keys(categories).map((category) => (
          <div key={category}>
            <section id="accordion" className="accordion m-4">
              <div className="accordion-container">
                <details className="accordion-item" open={categories[category].shouldStartExpanded}>
                  <summary className="accordion-trigger">
                    <span className="accordion-title">Select {category}</span>
                    <img
                      className="accordion-icon"
                      aria-hidden="true"
                      src="https://sdk-style.s3.amazonaws.com/icons/chevronDown.svg"
                    />
                  </summary>
                  <div className="accordion-content mt-4">
                    <div className="items-container">
                      {categories[category].items.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            if (item.variations) {
                              handleOpenModalWithVariations(item, category);
                              return;
                            } else {
                              updateAsset(category, item.imageName, item);
                            }
                          }}
                          className={`card ${item.imageName && isSelectedItem(category, item.imageName) ? "success" : ""}`}
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
                          <img src={getItemSrc(category, item.imageName, item.variations)} alt={category} />
                        </button>
                      ))}
                    </div>
                  </div>
                </details>
                {validationErrors[category] && <p className="p3 text-error">A {category} is required.</p>}
              </div>
            </section>
          </div>
        ))}
      </PageContainer>
    </>
  );
};

export default EditAsset;
