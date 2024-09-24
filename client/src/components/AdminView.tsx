import { useState } from "react";
import { ClearAllAssetsButton, ClearAllAssetsModal, ClearAssetButton, ClearAssetModal } from "@/components/index.js";

export const AdminView = ({ showClearAssetBtn }: { showClearAssetBtn: boolean }) => {
  const [showClearAssetModal, setShowClearAssetModal] = useState(false);
  const [showClearAllAssetsModal, setShowClearAllAssetsModal] = useState(false);

  function handleToggleShowClearAssetModal() {
    setShowClearAssetModal(!showClearAssetModal);
  }

  function handleToggleShowClearAllAssetsModal() {
    setShowClearAllAssetsModal(!showClearAllAssetsModal);
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
      {showClearAllAssetsModal ? (
        <ClearAllAssetsModal handleToggleShowClearAllAssetsModal={handleToggleShowClearAllAssetsModal} />
      ) : (
        ""
      )}
      {showClearAssetBtn && (
        <div style={{ marginBottom: "10px" }}>
          <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} fromAdmin={true} />
        </div>
      )}
      <ClearAllAssetsButton handleToggleShowClearAllAssetsModal={handleToggleShowClearAllAssetsModal} />
    </>
  );
};

export default AdminView;
