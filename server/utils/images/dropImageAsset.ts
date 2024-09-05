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

    const spawnedAssetUniqueName = `snowmanSystem-${profileId}`;

    const asset = await Asset.create(process.env.IMG_ASSET_ID || "webImageAsset", { credentials });

    const droppedAsset = await DroppedAsset.drop(asset, {
      position: spawnPosition,
      uniqueName: spawnedAssetUniqueName,
      urlSlug,
      isInteractive: true,
      interactivePublicKey,
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
            analyticName: `snowman-builds`,
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
        event: "snowman-starts",
        identityId,
        urlSlug,
      },
    ])
      .then()
      .catch((error) => console.error(JSON.stringify(error)));

    const modifiedName = username.replace(/ /g, "%20");
    const imageInfoParam = generateImageInfoParam(imageInfo);

    if (!imageInfoParam || !modifiedName || !profileId) {
      throw "Missing imageInfoParam, modifiedName or profileId";
    }

    const { baseUrl } = getBaseUrl(host);

    const clickableLink = `${baseUrl}/${themeName}/claimed?${imageInfoParam}&visitor-name=${modifiedName}&ownerProfileId=${profileId}`;

    await droppedAsset?.updateClickType({
      // @ts-ignore
      clickType: "link",
      clickableLink,
      clickableLinkTitle: "Snowman",
      clickableDisplayTextDescription: "Snowman",
      clickableDisplayTextHeadline: "Snowman",
      isOpenLinkInDrawer: true,
    });

    await droppedAsset?.setInteractiveSettings({
      isInteractive: true,
      interactivePublicKey: process.env.INTERACTIVE_KEY || "",
    });

    await droppedAsset?.updateWebImageLayers("", s3Url);

    return droppedAsset;
  } catch (error) {
    return error;
  }
};
