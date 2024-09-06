import { World, errorHandler } from "./index.js";
import { Credentials } from "../types/Credentials";
import { DroppedAsset } from "@rtsdk/topia";

export const pickupAllDroppedAssets = async ({
  credentials,
  droppedAssets,
}: {
  credentials: Credentials;
  droppedAssets: DroppedAsset[];
}) => {
  try {
    if (Object.keys(droppedAssets).length > 0) {
      const droppedAssetIds: string[] = [];
      for (const index in droppedAssets) {
        if (droppedAssets[index].id) droppedAssetIds.push(droppedAssets[index].id);
      }
      await World.deleteDroppedAssets(
        credentials.urlSlug,
        droppedAssetIds,
        process.env.INTERACTIVE_SECRET!,
        credentials,
      );
    }
  } catch (error) {
    errorHandler({
      error,
      functionName: "pickupAllDroppedAssets",
      message: "Error picking up all dropped assets",
    });
  }
};
