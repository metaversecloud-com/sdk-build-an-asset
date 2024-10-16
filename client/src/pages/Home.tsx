import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  const { interactiveParams, worldDataObject } = useContext(GlobalStateContext);
  const navigate = useNavigate();

  const themeName = getThemeName();
  const { splashImage, texts } = getThemeData();

  const userAssetId = worldDataObject?.[themeName]?.[interactiveParams.profileId]?.droppedAssetId;

  const [areButtonsDisabled, setAreButtonsDisabled] = useState(false);
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);

  const handleClaimAsset = async () => {
    setAreButtonsDisabled(true);

    backendAPI
      .post("/dropped-assets/claim")
      .then(() => {
        const modifiedName = interactiveParams.username.replace(/ /g, "%20");
        const redirectPath = `${themeName}/claimed?visitor-name=${modifiedName}`;
        const queryParams = new URLSearchParams(window.location.search);
        const fullPath = `/${redirectPath}&${queryParams}&edit=true`;
        navigate(fullPath);
      })
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
      isLoading={!worldDataObject?.[themeName]}
      headerText={texts.header}
      previewImageURL={splashImage}
      footerContent={
        userAssetId ? (
          <>
            <div className="mb-2">
              <MoveToAssetButton closeIframeAfterMove={true} />
            </div>
            <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} />
          </>
        ) : (
          <button className="btn" disabled={areButtonsDisabled} onClick={handleClaimAsset}>
            {texts.button}
          </button>
        )
      }
    >
      <div className="m-6">
        {userAssetId ? (
          <>
            {showClearAssetModal && (
              <ClearAssetModal
                handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
                isClearAssetFromUnclaimedAsset={true}
              />
            )}
            <h3>{texts.alreadyHave}</h3>
            <p>{texts.chooseNew}</p>
          </>
        ) : (
          <p>{texts.description}</p>
        )}
      </div>
    </PageContainer>
  );
};

export default Home;
