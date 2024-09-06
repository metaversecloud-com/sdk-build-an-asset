import { useContext, useState } from "react";

// components
import { ClearAssetButton, ClearAssetModal, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR } from "@/context/types";

// utils
import { backendAPI, getThemeData, getThemeName } from "@/utils";
import MoveToAssetButton from "@/components/MoveToAssetButton";

export const Home = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { world } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const themeData = getThemeData();

  const profileId = new URLSearchParams(window.location.search).get("profileId") || "";
  console.log("🚀 ~ file: Home.tsx:23 ~ world.dataObject:", world.dataObject);
  const userHasAsset = world.dataObject?.[themeName]?.[profileId]?.droppedAssetId;

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);

  const handleClaimAsset = async () => {
    setAreButtonsDisabled(true);

    backendAPI
      .post("/dropped-assets/claim")
      .catch((error) => {
        console.error(error);
        dispatch!({
          type: SET_ERROR,
          payload: { error: "There was an error while claiming an assets" },
        });
      })
      .finally(() => {
        setAreButtonsDisabled(false);
      });
  };

  const handleToggleShowClearAssetModal = () => {
    setShowClearAssetModal(!showClearAssetModal);
  };

  return (
    <PageContainer
      isLoading={false}
      headerText={themeData.texts.header}
      previewImageURL={themeData.splashImage}
      footerContent={
        userHasAsset ? (
          <>
            <div className="mb-2">
              <MoveToAssetButton closeIframeAfterMove={true} />
            </div>
            <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} />
          </>
        ) : (
          <button className="btn" disabled={areButtonsDisabled} onClick={() => handleClaimAsset()}>
            {themeData.texts.button}
          </button>
        )
      }
    >
      <div className="m-6">
        {userHasAsset ? (
          <>
            {showClearAssetModal && (
              <ClearAssetModal
                handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
                isClearAssetFromUnclaimedAsset={true}
              />
            )}
            <h3>{themeData.texts.alreadyHave}</h3>
            <p>{themeData.texts.chooseNew}</p>
          </>
        ) : (
          <p>{themeData.texts.description}</p>
        )}
      </div>
    </PageContainer>
  );
};

export default Home;
