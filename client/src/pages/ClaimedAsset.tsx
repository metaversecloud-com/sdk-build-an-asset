import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// components
import { ClearAssetButton, ClearAssetModal, PageContainer } from "@/components";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_ERROR } from "@/context/types";

// utils
import { backendAPI, capitalize, getThemeData, getThemeName } from "@/utils";
import MoveToAssetButton from "@/components/MoveToAssetButton";

export const ClaimedAsset = () => {
  const navigate = useNavigate();
  const dispatch = useContext(GlobalDispatchContext);
  const { visitorIsAdmin, worldDataObject } = useContext(GlobalStateContext);

  const themeName = getThemeName();
  const { clearButtonType, showClearAssetButton, showEditAssetButton, showFindAssetButton } = getThemeData();
  const defaultUnclaimedAsset = `/assets/${themeName}/unclaimedAsset.png`;

  const queryParams = new URLSearchParams(window.location.search);
  const profileId = queryParams.get("profileId");
  const ownerProfileId = queryParams.get("ownerProfileId") || "";
  const isAssetOwner = profileId === ownerProfileId;

  const [isLoading, setLoading] = useState(false);
  const [assetParams, setAssetParams] = useState<{ "edit"?: string; "visitor-name"?: string }>({});
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);

  const s3Url = worldDataObject?.[themeName]?.[ownerProfileId]?.s3Url;

  const visitorName = assetParams["visitor-name"]?.replace("%20", " ");

  useEffect(() => {
    setAssetParams(Object.fromEntries(queryParams.entries()));
  }, []);

  const handleEditAsset = async () => {
    navigate(`/${themeName}/edit?${queryParams}`);
  };

  const handleToggleShowClearAssetModal = () => {
    if (clearButtonType === "pickup") {
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
    } else if (clearButtonType === "empty") {
      setShowClearAssetModal(!showClearAssetModal);
    }
  };

  // Navigate to Edit screen if this screen was reached from Claim Asset button
  if (assetParams?.edit == "true") handleEditAsset();

  return (
    <>
      {showClearAssetModal && (
        <ClearAssetModal
          handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
          isClearAssetFromUnclaimedAsset={false}
        />
      )}
      <PageContainer
        isLoading={isLoading}
        headerText={capitalize(themeName)}
        previewImageURL={s3Url || defaultUnclaimedAsset}
        showClearAssetBtn={isAssetOwner || visitorIsAdmin}
        footerContent={
          isAssetOwner && (
            <>
              {showEditAssetButton && (
                <button className="btn mb-2" onClick={() => handleEditAsset()}>
                  Edit {themeName}
                </button>
              )}
              {showFindAssetButton && (
                <div className="mb-2">
                  <MoveToAssetButton />
                </div>
              )}
              {showClearAssetButton && (
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
