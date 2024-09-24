import { Credentials, ImageInfo } from "../../types/index.js";
import {
  Asset,
  DroppedAsset,
  addNewRowToGoogleSheets,
  errorHandler,
  generateImageInfoParam,
  getBaseUrl,
} from "../index.js";

export const dropImageAsset = async ({
  credentials,
  host,
  imageInfo,
  s3Url,
  position,
}: {
  credentials: Credentials;
  host: string;
  imageInfo: ImageInfo;
  s3Url: string;
  position: { x: number; y: number };
}) => {
  try {
    const { assetId, displayName, interactivePublicKey, identityId, profileId, themeName, urlSlug, username } =
      credentials;

    const asset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", {
      credentials: { interactivePublicKey, profileId, urlSlug },
    });

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      throw "Missing imageInfoParam, modifiedName or profileId";
    }

    const baseUrl = getBaseUrl(host);

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    const droppedAsset = await DroppedAsset.drop(asset, {
      clickType: "link",
      clickableLink,
      clickableLinkTitle: themeName,
      clickableDisplayTextDescription: themeName,
      clickableDisplayTextHeadline: themeName,
      isOpenLinkInDrawer: true,
      isInteractive: true,
      interactivePublicKey,
      layer1: s3Url,
      position,
      uniqueName: `${themeName}System-${profileId}`,
      urlSlug,
    });

    await droppedAsset?.updateDataObject(
      {
        profileId,
        parentAssetId: assetId,
      },
      {
        analytics: [
          {
            analyticName: `${themeName}-builds`,
            uniqueKey: profileId,
            profileId,
          },
        ],
      },
    );

    addNewRowToGoogleSheets([
      {
        appName: "Build an Asset",
        displayName,
        event: `${themeName}-starts`,
        identityId,
        urlSlug,
      },
    ])
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    return droppedAsset;
  } catch (error) {
    return errorHandler({
      error,
      functionName: "dropImageAsset",
      message: "Error dropping asset",
    });
  }
};
