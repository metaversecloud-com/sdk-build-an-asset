import { VisitorInterface } from "@rtsdk/topia";
import { Credentials, WorldDataObject } from "../types/index.js";
import { Visitor } from "./topiaInit.js";

/**
 * Looks up which player owns a dropped asset from the world data object.
 * Never trust an ownerProfileId sent by the client.
 */
export const getDroppedAssetOwnerProfileId = ({
  assetId,
  dataObject,
  themeName,
}: {
  assetId: string;
  dataObject: WorldDataObject;
  themeName: string;
}): string | undefined => {
  if (!assetId) return undefined;
  const entry = Object.entries(dataObject?.[themeName] || {}).find(
    ([, asset]) => asset?.droppedAssetId === assetId,
  );
  return entry?.[0];
};

/**
 * Allows the action when the current player owns the asset, otherwise requires an admin.
 */
export const assertCanManageDroppedAsset = async ({
  credentials,
  ownerProfileId,
}: {
  credentials: Credentials;
  ownerProfileId?: string;
}) => {
  if (ownerProfileId && ownerProfileId === credentials.profileId) return;

  const visitor = await Visitor.get(credentials.visitorId, credentials.urlSlug, { credentials });
  const { isAdmin } = visitor as VisitorInterface;
  if (!isAdmin) throw { status: 403, message: "Only the owner or an admin can modify this asset" };
};
