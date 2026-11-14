// Pickup themes (snowman, pumpkin): the player builds in the drawer and the app drops a new web-image
// asset next to them. Admins can pick builds up one at a time or all at once.
import { KEY_ASSET_ID, buildAsset, expect, pickItem, pickVariation, placeholderUrl, test } from "../../fixtures";

const snowmanOf = (profileId: string) => `snowmanSystem-${profileId}`;

test.describe("building a snowman", () => {
  test("the save button stays disabled until a body is chosen", async ({ page, world }) => {
    await world.seed();
    await page.goto(world.url("/snowman"));

    await expect(page.getByRole("heading", { name: "Build your Snowman!" })).toBeVisible();
    await expect(page.getByText("A Body is required.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Add Snowman" })).toBeDisabled();

    await pickVariation(page, "Body", "body_0.png", "body_1.png");

    await expect(page.getByText("A Body is required.")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Add Snowman" })).toBeEnabled();
    expect(Object.keys((await world.state()).assets)).toEqual([KEY_ASSET_ID]);
  });

  test("drops the snowman next to the player and records who owns it", async ({ page, world }) => {
    await world.seed({ visitor: { moveTo: { x: 100, y: 200 } } });
    await page.goto(world.url("/snowman"));

    await pickVariation(page, "Body", "body_0.png", "body_2.png");
    await pickItem(page, "Arms", "arms_3.png");
    await pickItem(page, "Head", "head_1.png");
    await expect(page.locator("img.preview")).toHaveCount(3);
    await page.getByRole("button", { name: "Add Snowman" }).click();

    await expect.poll(async () => (await world.worldData()).snowman?.[world.profileId]).toBeTruthy();
    const state = await world.state();
    const { droppedAssetId, s3Url } = state.dataObject.snowman[world.profileId];
    expect(s3Url).toBe(placeholderUrl("snowman"));
    expect(state.assets[droppedAssetId]).toMatchObject({
      assetId: "webImageAsset",
      uniqueName: snowmanOf(world.profileId),
      position: { x: 160, y: 200 },
      layer1: placeholderUrl("snowman"),
      isInteractive: true,
      interactivePublicKey: "e2e-public-key",
      clickType: "link",
      clickableLinkTitle: "snowman",
      isOpenLinkInDrawer: true,
    });
    const link = new URL(state.assets[droppedAssetId].clickableLink);
    expect(link.pathname).toBe("/snowman/claimed");
    expect(Object.fromEntries(link.searchParams)).toMatchObject({
      Body1: "body_2.png",
      Arms1: "arms_3.png",
      Head1: "head_1.png",
      "visitor-name": "e2e-player",
      ownerProfileId: world.profileId,
    });
    expect(state.events).toContainEqual(
      expect.objectContaining({ type: "particles", particleId: "particle-4", position: { x: 160, y: 200 } }),
    );
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "snowman-builds" }));
  });

  test("building again replaces the player's previous snowman", async ({ page, world }) => {
    await world.seed({
      extraAssets: { "old-snowman": buildAsset("snowman", { id: "old-snowman", uniqueName: snowmanOf(world.profileId) }) },
      worldData: { snowman: { [world.profileId]: { droppedAssetId: "old-snowman", s3Url: placeholderUrl("snowman") } } },
    });
    await page.goto(world.url("/snowman"));

    await pickVariation(page, "Body", "body_0.png", "body_0.png");
    await page.getByRole("button", { name: "Add Snowman" }).click();

    await expect.poll(async () => (await world.asset("old-snowman")) ?? null).toBeNull();
    const state = await world.state();
    const mine = Object.values<any>(state.assets).filter((a) => a.uniqueName === snowmanOf(world.profileId));
    expect(mine).toHaveLength(1);
    expect(state.dataObject.snowman[world.profileId].droppedAssetId).toBe(mine[0].id);
    expect(state.events).toContainEqual({ type: "delete-asset", assetId: "old-snowman" });
  });

  test("another player's snowman is left alone", async ({ page, world }) => {
    await world.seed({
      extraAssets: { "their-snowman": buildAsset("snowman", { id: "their-snowman", uniqueName: snowmanOf("profile-other") }) },
    });
    await page.goto(world.url("/snowman"));

    await pickVariation(page, "Body", "body_0.png", "body_1.png");
    await page.getByRole("button", { name: "Add Snowman" }).click();

    await expect.poll(async () => (await world.worldData()).snowman?.[world.profileId]).toBeTruthy();
    expect(await world.asset("their-snowman")).toBeTruthy();
  });
});

test("builds a pumpkin with eyes and a mouth", async ({ page, world }) => {
  await world.seed();
  await page.goto(world.url("/pumpkin"));

  await expect(page.getByRole("heading", { name: "Build your Pumpkin!" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Pumpkin" })).toBeDisabled();
  await pickVariation(page, "Body", "body_1_orange.png", "body_1_orange.png");
  await pickItem(page, "Eyes", "eyes_2.png");
  await pickItem(page, "Mouth", "mouth_4.png");
  // Eyes allow one pick: a second choice replaces the first.
  await pickItem(page, "Eyes", "eyes_5.png");
  await page.getByRole("button", { name: "Add Pumpkin" }).click();

  await expect.poll(async () => (await world.worldData()).pumpkin?.[world.profileId]).toBeTruthy();
  const state = await world.state();
  const asset = state.assets[state.dataObject.pumpkin[world.profileId].droppedAssetId];
  expect(asset.uniqueName).toBe(`pumpkinSystem-${world.profileId}`);
  const params = new URL(asset.clickableLink).searchParams;
  expect(params.getAll("Eyes1")).toEqual(["eyes_5.png"]);
  expect(params.has("Eyes2")).toBe(false);
  expect(params.get("Mouth1")).toBe("mouth_4.png");
});

test.describe("a built snowman's page", () => {
  const claimedParams = (ownerProfileId: string) => ({
    Body1: "body_1.png",
    Arms1: "arms_2.png",
    "visitor-name": "Snow%20Owner",
    ownerProfileId,
  });

  test("visitors see whose it is, without owner controls", async ({ page, world }) => {
    await world.seed({ asset: { uniqueName: snowmanOf("profile-other") } });
    await page.goto(world.url("/snowman/claimed", claimedParams("profile-other")));

    await expect(page.getByText("This snowman belongs to")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Snow Owner!" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Edit snowman" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Move to snowman" })).toHaveCount(0);
  });

  test("the owner reopens the editor with their current parts selected", async ({ page, world }) => {
    await world.seed({ asset: { uniqueName: snowmanOf(world.profileId) } });
    await page.goto(world.url("/snowman/claimed", claimedParams(world.profileId)));

    await page.getByRole("button", { name: "Edit snowman" }).click();

    await expect(page.getByRole("heading", { name: "Build your Snowman!" })).toBeVisible();
    await expect(page.locator("img.preview")).toHaveCount(2);
    await expect(page.locator('img.preview[src$="/body_1.png"]')).toHaveCount(1);
    await expect(page.locator('img.preview[src$="/arms_2.png"]')).toHaveCount(1);
    await expect(page.getByRole("button", { name: "Add Snowman" })).toBeEnabled();
  });

  test("the owner walks over to their snowman", async ({ page, world }) => {
    await world.seed({
      asset: { uniqueName: snowmanOf(world.profileId), position: { x: 640, y: 320 } },
      worldData: { snowman: { [world.profileId]: { droppedAssetId: KEY_ASSET_ID, s3Url: placeholderUrl("snowman") } } },
    });
    await page.goto(world.url("/snowman/claimed", claimedParams(world.profileId)));

    await page.getByRole("button", { name: "Move to snowman" }).click();

    await expect.poll(() => world.events("move")).toContainEqual(
      expect.objectContaining({ moveTo: { x: 640, y: 320 }, teleport: false, visitorId: "42" }),
    );
    expect(await world.events("close-iframe")).toEqual([]);
  });
});

test.describe("admin pickup", () => {
  test("an admin picks up one snowman from its page", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      asset: { uniqueName: snowmanOf("profile-other") },
      worldData: { snowman: { "profile-other": { droppedAssetId: KEY_ASSET_ID, s3Url: placeholderUrl("snowman") } } },
    });
    await page.goto(world.url("/snowman/claimed", { "visitor-name": "Other", ownerProfileId: "profile-other" }));

    await page.locator("button.icon-with-rounded-border").click();
    await page.getByRole("button", { name: "Pickup this Snowman" }).click();
    await expect(page.getByText("If you pick up this Snowman, it will be removed from this world.")).toBeVisible();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect.poll(async () => (await world.asset()) ?? null).toBeNull();
    expect(await world.events("close-iframe")).toHaveLength(1);
    expect(await world.events("analytics")).toContainEqual(
      expect.objectContaining({ analyticName: "snowman-pickupUserAsset" }),
    );
  });

  test("picking up a snowman also releases its owner's record", async ({ page, world }) => {
    test.fail(true, "EXP-434: pickup deletes the asset but leaves worldDataObject[theme][owner] pointing at it");
    await world.seed({
      isAdmin: true,
      asset: { uniqueName: snowmanOf("profile-other") },
      worldData: { snowman: { "profile-other": { droppedAssetId: KEY_ASSET_ID, s3Url: placeholderUrl("snowman") } } },
    });

    const response = await page.request.post(world.api("/dropped-assets/pickup", { themeName: "snowman" }), {
      data: { isClearAssetFromUnclaimedAsset: false },
    });

    expect(response.ok()).toBe(true);
    expect(await world.asset()).toBeUndefined();
    expect((await world.worldData()).snowman["profile-other"] ?? null).toBeNull();
  });

  test("an admin picks up every snowman at once", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      asset: { uniqueName: snowmanOf("profile-a") },
      extraAssets: {
        b: buildAsset("snowman", { id: "b", uniqueName: snowmanOf("profile-b") }),
        pumpkin: buildAsset("pumpkin", { id: "pumpkin", uniqueName: "pumpkinSystem-profile-a" }),
        tree: { id: "tree", assetName: "Tree", uniqueName: "tree", position: { x: 0, y: 0 } },
      },
      worldData: {
        snowman: {
          "profile-a": { droppedAssetId: KEY_ASSET_ID, s3Url: placeholderUrl("snowman") },
          "profile-b": { droppedAssetId: "b", s3Url: placeholderUrl("snowman") },
        },
        pumpkin: { "profile-a": { droppedAssetId: "pumpkin", s3Url: placeholderUrl("pumpkin") } },
      },
    });
    await page.goto(world.url("/snowman/claimed", { "visitor-name": "A", ownerProfileId: "profile-a" }));

    await page.locator("button.icon-with-rounded-border").click();
    await page.getByRole("button", { name: "Pickup all Snowmen" }).click();
    await page.getByRole("button", { name: "Pickup All", exact: true }).click();

    await expect.poll(async () => Object.keys((await world.state()).assets).sort()).toEqual(["pumpkin", "tree"]);
    const state = await world.state();
    expect(state.dataObject.snowman).toEqual({});
    expect(Object.keys(state.dataObject.pumpkin)).toEqual(["profile-a"]);
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "snowman-pickupAllAssets" }));
    expect(state.events.filter((e) => e.type === "close-iframe")).toHaveLength(1);
  });
});
