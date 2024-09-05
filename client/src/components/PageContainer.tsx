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
  const { isAssetAlreadyTaken, visitor } = useContext(GlobalStateContext);
  const [showSettings, setShowSettings] = useState(false);

  const themeName = getThemeName();
  const themeData = getThemeData();
  const S3URL = `${getS3URL()}/${themeName}`;

  if (isLoading) return <Loading />;

  if (isAssetAlreadyTaken) {
    return (
      <>
        <div>
          <h1>This {themeName} is already taken</h1>
          <p>Please select another {themeName}!</p>
        </div>
      </>
    );
  }

  return (
    <div className="container-with-footer">
      {visitor?.isAdmin && (
        <div className="p-6">
          <AdminIconButton setShowSettings={() => setShowSettings(!showSettings)} showSettings={showSettings} />
        </div>
      )}
      <div className="p-6">
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
          {children}
        </>
      )}
      <div className="footer-fixed">
        {showSettings ? <AdminView showClearAssetBtn={showClearAssetBtn} /> : footerContent}
      </div>
    </div>
  );
};

export default PageContainer;