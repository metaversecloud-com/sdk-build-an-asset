import { Credentials, ImageInfo } from "../../types/index.js";
import { Asset, DroppedAsset, addNewRowToGoogleSheets, generateImageInfoParam, getBaseUrl } from "../index.js";

export const dropImageAsset = async ({
  completeImageName,
  credentials,
  host,
  imageInfo,
  s3Url,
  spawnPosition,
}: {
  completeImageName: string;
  credentials: Credentials;
  host: string;
  imageInfo: ImageInfo;
  s3Url: string;
  spawnPosition: { x: number; y: number };
}) => {
  try {
    const { assetId, displayName, interactivePublicKey, identityId, profileId, themeName, urlSlug, username } =
      credentials;

    const spawnedAssetUniqueName = `${themeName}System-${profileId}`;

    const asset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", { credentials });

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      throw "Missing imageInfoParam, modifiedName or profileId";
    }

    const { baseUrl } = getBaseUrl(host);

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
      position: spawnPosition,
      uniqueName: spawnedAssetUniqueName,
      urlSlug,
    });

    await droppedAsset?.updateDataObject(
      {
        profileId,
        completeImageName,
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
    return error;
  }
};
