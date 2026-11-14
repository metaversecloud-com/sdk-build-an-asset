// Permission checks and server-side validation. A player can open any build's drawer just by clicking
// it, so the session credentials (assetId included) are valid for other players' builds too: the
// server has to check ownership itself.
import { INTERACTIVE_SECRET } from "../../constants";
import { KEY_ASSET_ID, buildAsset, expect, pickVariation, placeholderUrl, test } from "../../fixtures";

const owned = (theme: string, droppedAssetId: string) => ({ droppedAssetId, s3Url: placeholderUrl(theme) });
const lockerInfo = (base?: string) => ({
  topLayerInfo: { "Locker Base": base ? [{ imageName: base }] : [], "Top Shelf": [], "Bottom Shelf": [], Door: [] },
  bottomLayerInfo: {},
});

test.describe("admin-only actions", () => {
  test("only admins see the settings button", async ({ page, world }) => {
    await world.seed({ isAdmin: false, asset: buildAsset("locker") });
    await page.goto(world.url("/locker"));
    await expect(page.getByRole("button", { name: "Claim Locker" })).toBeVisible();
    await expect(page.locator("button.icon-with-rounded-border")).toHaveCount(0);

    await world.seed({ isAdmin: true, asset: buildAsset("locker") });
    await page.reload();
    await expect(page.locator("button.icon-with-rounded-border")).toBeVisible();
  });

  for (const shouldDelete of [false, true]) {
    test(`a player can't ${shouldDelete ? "pick up" : "clear"} every build`, async ({ page, world }) => {
      await world.seed({
        isAdmin: false,
        asset: buildAsset("locker", { uniqueName: "lockerSystem-1", topLayerURL: placeholderUrl("locker") }),
        worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
      });
      const before = await world.state();

      const response = await page.request.post(world.api("/dropped-assets/clear-all"), { data: { shouldDelete } });

      expect(response.ok()).toBe(false);
      expect(JSON.stringify(await response.json())).toContain("Only admins");
      const after = await world.state();
      expect(after.assets).toEqual(before.assets);
      expect(after.dataObject).toEqual(before.dataObject);
    });
  }
});

test.describe("other players' builds", () => {
  test("a player can't decorate a locker someone else owns", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
    });
    const before = await world.state();

    const response = await page.request.post(world.api("/dropped-assets/edit"), {
      data: { imageInfo: lockerInfo("lockerBase_1.png"), requiredTopLayerCategories: ["Locker Base"] },
    });

    expect(await response.json()).toEqual({ isAssetAlreadyTaken: true });
    expect((await world.state()).assets).toEqual(before.assets);
  });

  test("a player can't empty a locker someone else owns", async ({ page, world }) => {
    test.fail(true, "EXP-434: /dropped-assets/clear has no owner/admin check");
    await world.seed({
      isAdmin: false,
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
    });

    // The drawer of someone else's locker, opened by clicking it: credentials carry its assetId.
    const response = await page.request.post(world.api("/dropped-assets/clear", { ownerProfileId: "profile-other" }), {
      data: { isClearAssetFromUnclaimedAsset: false },
    });

    expect((await world.asset()).topLayerURL, "sign was emptied").toBe(placeholderUrl("locker"));
    expect((await world.worldData()).locker["profile-other"]).toEqual(owned("locker", KEY_ASSET_ID));
    expect(response.ok()).toBe(false);
  });

  test("a player can't pick up a snowman someone else built", async ({ page, world }) => {
    test.fail(true, "EXP-434: /dropped-assets/pickup deletes whatever assetId it is given");
    await world.seed({
      isAdmin: false,
      asset: buildAsset("snowman", { uniqueName: "snowmanSystem-profile-other" }),
      worldData: { snowman: { "profile-other": owned("snowman", KEY_ASSET_ID) } },
    });

    const response = await page.request.post(world.api("/dropped-assets/pickup", { themeName: "snowman" }), {
      data: { isClearAssetFromUnclaimedAsset: false },
    });

    expect(await world.asset(), "snowman was deleted").toBeTruthy();
    expect(response.ok()).toBe(false);
  });

  test("a player can't hold two lockers at once", async ({ page, world }) => {
    test.fail(true, "EXP-434: /claim doesn't check the player already owns a locker; the first stays claimed but orphaned");
    await world.seed({
      asset: buildAsset("locker"),
      extraAssets: { mine: buildAsset("locker", { id: "mine", topLayerURL: placeholderUrl("locker") }) },
      worldData: { locker: { [world.profileId]: owned("locker", "mine") } },
    });

    await page.request.post(world.api("/dropped-assets/claim"));

    const state = await world.state();
    const claimedByMe = Object.values<any>(state.assets).filter((a) => a.topLayerURL === placeholderUrl("locker"));
    expect(claimedByMe, "signs still showing as claimed").toHaveLength(1);
  });
});

test.describe("server-side validation", () => {
  test("saving a locker without a base is rejected", async ({ page, world }) => {
    test.fail(true, "EXP-434: handleEditDroppedAsset ignores validateImageInfo's result");
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { [world.profileId]: owned("locker", KEY_ASSET_ID) } },
    });
    // No "Locker Base" at all, but a shelf item so the request isn't empty.
    const withoutBase = { "Top Shelf": [{ imageName: "topShelf_1.png" }], "Bottom Shelf": [], Door: [] };

    const response = await page.request.post(world.api("/dropped-assets/edit"), {
      data: { imageInfo: { topLayerInfo: withoutBase, bottomLayerInfo: {} }, requiredTopLayerCategories: ["Locker Base"] },
    });

    expect(await world.events("fire-toast"), "save went through").toEqual([]);
    expect(response.ok()).toBe(false);
  });

  test("a snowman without a body is not dropped", async ({ page, world }) => {
    test.fail(true, "EXP-434: /dropped-assets/drop never checks required parts");
    await world.seed();

    const response = await page.request.post(world.api("/dropped-assets/drop", { themeName: "snowman" }), {
      data: { imageInfo: { topLayerInfo: { Body: [], Arms: [{ imageName: "arms_1.png" }], Head: [], Accessories: [] } } },
    });

    expect(await world.events("drop-asset"), "snowman was dropped").toEqual([]);
    expect(response.ok()).toBe(false);
  });

  test("a drop without imageInfo is rejected without changing the world", async ({ page, world }) => {
    await world.seed();

    const response = await page.request.post(world.api("/dropped-assets/drop", { themeName: "snowman" }), { data: {} });

    expect(response.ok()).toBe(false);
    expect(await world.events("drop-asset")).toEqual([]);
    expect(await world.worldData()).toEqual({});
  });
});

test("claiming and saving never send the interactive secret to the browser", async ({ page, world }) => {
  test.fail(true, "EXP-429: /claim and /edit return the raw SDK DroppedAsset (cleanReturnPayload never runs)");
  await world.seed({ asset: buildAsset("locker") });
  const bodies: string[] = [];
  page.on("response", async (response) => {
    if (response.url().includes("/api/")) bodies.push(await response.text().catch(() => ""));
  });
  await page.goto(world.url("/locker"));

  await page.getByRole("button", { name: "Claim Locker" }).click();
  await pickVariation(page, "Locker Base", "lockerBase_0.png", "lockerBase_1.png");
  await page.getByRole("button", { name: "Save" }).click();
  await expect.poll(() => world.events("fire-toast")).toHaveLength(1);

  for (const body of bodies) {
    for (const marker of [INTERACTIVE_SECRET, "interactiveSecret", "InteractiveJWT"]) expect(body).not.toContain(marker);
  }
});
