import { useContext, useEffect, useState } from "react";

// components
import { ClearAssetButton, ClearAssetModal, PageContainer } from "@/components";
import EditAsset from "./EditAsset";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR } from "@/context/types";

// utils
import { backendAPI, capitalize, getThemeData, getThemeName } from "@/utils";
import MoveToAssetButton from "@/components/MoveToAssetButton";

export const ClaimedAsset = () => {
  const dispatch = useContext(GlobalDispatchContext);
  const { visitor, world } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const themeData = getThemeData();
  const defaultUnclaimedAsset = `/assets/${themeName}/unclaimedAsset.png`;

  const queryParameters = new URLSearchParams(window.location.search);
  const profileId = queryParameters.get("profileId");
  const ownerProfileId = queryParameters.get("ownerProfileId") || "";
  const isAssetOwner = profileId === ownerProfileId;

  const [isLoading, setLoading] = useState(false);
  const [assetParams, setAssetParams] = useState<{ "edit"?: string; "visitor-name"?: string }>({});
  const [showCustomizeScreen, setShowCustomizeScreen] = useState(false);
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);

  const s3Url = world.dataObject?.[themeName]?.[ownerProfileId]?.s3Url;

  const visitorName = assetParams["visitor-name"]?.replace("%20", " ");

  useEffect(() => {
    setAssetParams(Object.fromEntries(queryParameters.entries()));
  }, []);

  const handleEditAsset = async () => {
    setShowCustomizeScreen(true);
  };

  const handleToggleShowClearAssetModal = () => {
    if (themeData.clearButtonType === "pickup") {
      backendAPI
        .post("/dropped-assets/pickup")
        .catch((error) => {
          console.error(error);
          dispatch!({
            type: SET_ERROR,
            payload: { error: "There was an error while picking up asset" },
          });
        })
        .finally(() => {
          setLoading(false);
        });
    } else if (themeData.clearButtonType === "empty") {
      setShowClearAssetModal(!showClearAssetModal);
    }
  };

  // Show customize screen if Edit button is clicked, or if this screen was reached from Claim Asset button
  if (showCustomizeScreen || assetParams?.edit == "true") {
    return <EditAsset />;
  }

  return (
    <>
      {showClearAssetModal ? (
        <ClearAssetModal
          handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
          isClearAssetFromUnclaimedAsset={false}
        />
      ) : (
        ""
      )}
      <PageContainer
        isLoading={isLoading}
        headerText={capitalize(themeName)}
        previewImageURL={s3Url || defaultUnclaimedAsset}
        showClearAssetBtn={isAssetOwner || visitor.isAdmin}
        footerContent={
          isAssetOwner && (
            <>
              {themeData.showEditAssetButton && (
                <button className="btn mb-2" onClick={() => handleEditAsset()}>
                  Edit {themeName}
                </button>
              )}
              {themeData.showFindAssetButton && (
                <div className="mb-2">
                  <MoveToAssetButton />
                </div>
              )}
              {themeData.showClearAssetButton && (
                <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} />
              )}
            </>
          )
        }
      >
        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p>This {themeName} belongs to</p>
          <h3>{visitorName}!</h3>
        </div>
      </PageContainer>
    </>
  );
};

export default ClaimedAsset;
