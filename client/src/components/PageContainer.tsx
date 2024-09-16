import { ReactNode, useContext, useState } from "react";

// components
import { AdminView, AdminIconButton, Loading } from "@/components/index.js";

// context{}
import { GlobalStateContext } from "@context/GlobalContext";

// utils
import { getS3URL, getThemeData, getThemeName } from "@/utils";

export const PageContainer = ({
  children,
  isLoading,
  headerText,
  previewImageURL,
  showClearAssetBtn = true,
  footerContent,
}: {
  children: ReactNode;
  isLoading: boolean;
  headerText: string;
  previewImageURL?: string;
  showClearAssetBtn?: boolean;
  footerContent: ReactNode;
}) => {
  const { error, isAssetAlreadyTaken, visitorIsAdmin } = useContext(GlobalStateContext);
  const [showSettings, setShowSettings] = useState(false);

  const themeName = getThemeName();
  const themeData = getThemeData();
  const S3URL = `${getS3URL()}/${themeName}`;

  if (isLoading) return <Loading />;

  return (
    <div className="container-with-footer pt-6">
      {visitorIsAdmin && (
        <div className="px-6">
          <AdminIconButton setShowSettings={() => setShowSettings(!showSettings)} showSettings={showSettings} />
        </div>
      )}
      <div className="pb-6">
        <h2 style={{ textAlign: "center" }}>{showSettings ? "Settings" : headerText}</h2>
      </div>
      {!showSettings && (
        <>
          {previewImageURL && (
            <img
              src={previewImageURL === "data:," ? `${S3URL}/claimedAsset.png` : previewImageURL}
              alt={`${themeData.name} Preview`}
              className="img-previewImageURL m-auto"
            />
          )}
          {isAssetAlreadyTaken ? (
            <div className="p-6 text-center">
              <h1>This {themeName} is already taken</h1>
              <p>Please select another {themeName}!</p>
            </div>
          ) : (
            children
          )}
          {error && <p className="p3 pt-10 text-center text-error">{error}</p>}
        </>
      )}
      <div className="footer-fixed">
        {showSettings ? <AdminView showClearAssetBtn={showClearAssetBtn} /> : footerContent}
      </div>
    </div>
  );
};

export default PageContainer;
