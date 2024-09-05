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
        <button className="btn" disabled={areButtonsDisabled} onClick={() => handleClaimAsset()}>
          {themeData.texts.button}
        </button>
      }
    >
      {userHasAsset ? (
        <>
          {showClearAssetModal && (
            <ClearAssetModal
              handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
              isClearAssetFromUnclaimedAsset={true}
            />
          )}
          <>
            <h2>{themeData.texts.alreadyHave}</h2>
            <p>{themeData.texts.chooseNew}</p>

            <div className="footer-fixed" style={{ backgroundColor: "white" }}>
              <div style={{ margin: "10px 0px" }}>
                <MoveToAssetButton closeIframeAfterMove={true} />
              </div>
              <div style={{ margin: "10px 0px" }}>
                <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} />
              </div>
            </div>
          </>
        </>
      ) : (
        <div style={{ margin: "20px" }}>
          <p>{themeData.texts.description}</p>
        </div>
      )}
    </PageContainer>
  );
};

export default Home;
