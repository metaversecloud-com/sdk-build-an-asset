import { useState } from "react";
import {
  ClearAllAssetsButton,
  ClearAllAssetsModal,
  ClearAssetButton,
  ClearAssetModal,
  MaxDroppedAssetsSetting,
} from "@/components/index.js";
import { getThemeData } from "@/utils/themes.js";

export const AdminView = ({ showClearAssetBtn }: { showClearAssetBtn: boolean }) => {
  const { shouldDropAsset } = getThemeData();
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
      {shouldDropAsset && <MaxDroppedAssetsSetting />}

      {showClearAssetBtn && (
        <div className="mb-4">
          <ClearAssetButton handleToggleShowClearAssetModal={handleToggleShowClearAssetModal} fromAdmin={true} />
        </div>
      )}

      <ClearAllAssetsButton handleToggleShowClearAllAssetsModal={handleToggleShowClearAllAssetsModal} />

      {showClearAssetModal && (
        <ClearAssetModal
          handleToggleShowClearAssetModal={handleToggleShowClearAssetModal}
          isClearAssetFromUnclaimedAsset={false}
        />
      )}

      {showClearAllAssetsModal && (
        <ClearAllAssetsModal handleToggleShowClearAllAssetsModal={handleToggleShowClearAllAssetsModal} />
      )}
    </>
  );
};

export default AdminView;
