// Empty themes (locker, desk): pre-placed unclaimed signs that a player claims and decorates in place.
// The sign itself is never moved or deleted; emptying it puts the unclaimed image back.
import {
  KEY_ASSET_ID,
  TopiaWorld,
  buildAsset,
  expect,
  pickItem,
  pickVariation,
  placeholderUrl,
  test,
  unclaimedUrl,
} from "../../fixtures";

const owned = (theme: string, droppedAssetId: string) => ({ droppedAssetId, s3Url: placeholderUrl(theme) });
const claimedLink = (theme: string, ownerProfileId: string) =>
  `http://localhost:3001/${theme}/claimed?visitor-name=Owner&ownerProfileId=${ownerProfileId}`;

/** World where the player stands at an unclaimed locker sign (the key asset). */
const seedUnclaimedLocker = (world: TopiaWorld, extra: Parameters<TopiaWorld["seed"]>[0] = {}) =>
  world.seed({ asset: buildAsset("locker", { clickableLink: "http://localhost:3001/locker" }), ...extra });

test.describe("opening a sign", () => {
  test("an unclaimed locker invites the player to claim it and initializes the world record", async ({ page, world }) => {
    await seedUnclaimedLocker(world);
    await page.goto(world.url("/locker"));

    await expect(page.getByRole("heading", { name: "Decorate your Locker" })).toBeVisible();
    await expect(page.getByText("Click 'Claim Locker' to claim and decorate your Locker.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim Locker" })).toBeEnabled();
    expect(await world.worldData()).toEqual({ locker: {} });
    expect(await world.events("analytics")).toContainEqual(
      expect.objectContaining({ analyticName: "locker-starts", profileId: world.profileId }),
    );
  });

  test("opening a new theme keeps the other themes' records", async ({ page, world }) => {
    const snowman = { "profile-other": owned("snowman", "s1") };
    await seedUnclaimedLocker(world, { worldData: { snowman } });
    await page.goto(world.url("/locker"));

    await expect(page.getByRole("button", { name: "Claim Locker" })).toBeVisible();
    expect(await world.worldData()).toEqual({ snowman, locker: {} });
  });

  test("a player who already has a locker is offered to move there or empty it", async ({ page, world }) => {
    await seedUnclaimedLocker(world, {
      extraAssets: { mine: buildAsset("locker", { id: "mine", position: { x: 900, y: 50 } }) },
      worldData: { locker: { [world.profileId]: owned("locker", "mine") } },
    });
    await page.goto(world.url("/locker"));

    await expect(page.getByRole("heading", { name: "You already have a Locker!" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Claim Locker" })).toHaveCount(0);

    await page.getByRole("button", { name: "Move to locker" }).click();
    await expect.poll(() => world.events("move")).toContainEqual(expect.objectContaining({ moveTo: { x: 900, y: 50 } }));
    // From the sign the drawer closes after the move.
    await expect.poll(() => world.events("close-iframe")).toHaveLength(1);
  });
});

test.describe("claiming and decorating", () => {
  test("claiming swaps the sign to the claimed image and opens the editor", async ({ page, world }) => {
    await seedUnclaimedLocker(world);
    await page.goto(world.url("/locker"));

    await page.getByRole("button", { name: "Claim Locker" }).click();

    await expect(page.getByRole("heading", { name: "Build your Locker!" })).toBeVisible();
    await expect(page).toHaveURL(/\/locker\/edit\?/);
    const state = await world.state();
    expect(state.assets[KEY_ASSET_ID]).toMatchObject({
      topLayerURL: placeholderUrl("locker"),
      bottomLayerURL: "",
      clickableLink: `http://localhost:3001/locker/claimed?visitor-name=e2e-player&ownerProfileId=${world.profileId}`,
      clickableLinkTitle: "locker",
    });
    expect(state.dataObject.locker[world.profileId]).toEqual(owned("locker", KEY_ASSET_ID));
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "locker-builds" }));
    expect(state.events).toContainEqual(
      expect.objectContaining({ type: "particles", particleId: "particle-4", position: { x: 300, y: 400 } }),
    );
  });

  test("a locker needs a base before it can be saved", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { [world.profileId]: owned("locker", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/locker/edit"));

    await expect(page.getByText("A Locker Base is required.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
    await pickVariation(page, "Locker Base", "lockerBase_0.png", "lockerBase_3.png");
    await expect(page.getByRole("button", { name: "Save" })).toBeEnabled();
  });

  test("saving a decorated locker updates the sign, its link and the owner record", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { [world.profileId]: owned("locker", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/locker/edit"));

    await pickVariation(page, "Locker Base", "lockerBase_0.png", "lockerBase_3.png");
    await pickVariation(page, "Top Shelf", "topShelf_0.png", "topShelf_2.png");
    await pickVariation(page, "Door", "door_4.png", "door_5.png");
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(() => world.events("fire-toast")).toContainEqual(
      expect.objectContaining({
        title: "✅ Success",
        text: "The locker has been decorated. Your changes have been saved!",
        groupId: "locker",
      }),
    );
    const state = await world.state();
    const link = new URL(state.assets[KEY_ASSET_ID].clickableLink);
    expect(link.pathname).toBe("/locker/claimed");
    expect(Object.fromEntries(link.searchParams)).toMatchObject({
      LockerBase1: "lockerBase_3.png",
      TopShelf1: "topShelf_2.png",
      Door1: "door_5.png",
      "visitor-name": "e2e-player",
      ownerProfileId: world.profileId,
    });
    expect(state.assets[KEY_ASSET_ID]).toMatchObject({ topLayerURL: placeholderUrl("locker"), bottomLayerURL: "" });
    expect(state.dataObject.locker[world.profileId]).toEqual(owned("locker", KEY_ASSET_ID));
    expect(state.events).toContainEqual(expect.objectContaining({ type: "particles", particleId: "particle-5" }));
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "locker-updates" }));
  });

  test("a desk saves its wall and floor as the bottom layer", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("desk", { topLayerURL: placeholderUrl("desk") }),
      worldData: { desk: { [world.profileId]: owned("desk", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/desk/edit"));

    for (const required of ["Wall", "Floor", "Desk"]) await expect(page.getByText(`A ${required} is required.`)).toBeVisible();
    await pickVariation(page, "Wall", "wallBeige.png", "wallTeal.png");
    await pickVariation(page, "Floor", "floorCarpetBlue.png", "floorTileBlue.png");
    await expect(page.getByRole("button", { name: "Save" })).toBeDisabled();
    const deskImage = "deskLshapeA3.png";
    await pickVariation(page, "Desk", "deskLshapeA1.png", deskImage);
    await page.getByRole("button", { name: "Save" }).click();

    await expect.poll(() => world.events("fire-toast")).toHaveLength(1);
    const asset = await world.asset();
    expect(asset).toMatchObject({ bottomLayerURL: placeholderUrl("desk"), topLayerURL: placeholderUrl("desk") });
    expect(Object.fromEntries(new URL(asset.clickableLink).searchParams)).toMatchObject({
      Wall1: "wallTeal.png",
      Floor1: "floorTileBlue.png",
      Desk1: deskImage,
    });
  });

  test("a locker someone else claimed first is refused", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker"), clickableLink: claimedLink("locker", "profile-other") }),
      worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
    });
    const before = await world.state();

    const response = await page.request.post(world.api("/dropped-assets/claim"));

    expect(await response.json()).toEqual({ isAssetAlreadyTaken: true });
    const after = await world.state();
    expect(after.assets).toEqual(before.assets);
    expect(after.dataObject).toEqual(before.dataObject);
  });

  test("a player who claims a taken locker is told so instead of being sent to the editor", async ({ page, world }) => {
    test.fail(true, "EXP-434: Home ignores isAssetAlreadyTaken from /claim and opens the editor anyway");
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker") }),
      worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/locker"));

    await page.getByRole("button", { name: "Claim Locker" }).click();

    await expect(page.getByRole("heading", { name: "This locker is already taken" })).toBeVisible({ timeout: 3000 });
  });
});

test.describe("emptying a locker", () => {
  test("from the sign, a player empties the locker they own elsewhere and can claim this one", async ({ page, world }) => {
    await seedUnclaimedLocker(world, {
      extraAssets: {
        mine: buildAsset("locker", {
          id: "mine",
          topLayerURL: placeholderUrl("locker"),
          clickableLink: claimedLink("locker", world.profileId),
        }),
      },
      worldData: { locker: { [world.profileId]: owned("locker", "mine") } },
    });
    await page.goto(world.url("/locker"));

    await page.getByRole("button", { name: "Empty Locker" }).click();
    await expect(page.getByText("If you clear this Locker, it will be emptied and unclaimed.")).toBeVisible();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByRole("button", { name: "Claim Locker" })).toBeVisible();
    const state = await world.state();
    expect(state.assets.mine).toMatchObject({
      topLayerURL: unclaimedUrl("locker"),
      bottomLayerURL: "",
      clickableLink: "http://localhost:3001/locker",
    });
    expect(state.dataObject.locker[world.profileId]).toBeNull();
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "locker-unclaims" }));
  });

  test("the owner empties their locker from its page", async ({ page, world }) => {
    await world.seed({
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker"), clickableLink: claimedLink("locker", world.profileId) }),
      worldData: { locker: { [world.profileId]: owned("locker", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/locker/claimed", { "visitor-name": "e2e-player", ownerProfileId: world.profileId }));

    await expect(page.getByRole("button", { name: "Edit locker" })).toBeVisible();
    await page.getByRole("button", { name: "Empty Locker" }).click();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect(page.getByRole("button", { name: "Claim Locker" })).toBeVisible();
    expect(await world.asset()).toMatchObject({ topLayerURL: unclaimedUrl("locker") });
    expect((await world.worldData()).locker[world.profileId]).toBeNull();
  });

  test("an admin empties another player's locker", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      asset: buildAsset("locker", { topLayerURL: placeholderUrl("locker"), clickableLink: claimedLink("locker", "profile-other") }),
      worldData: { locker: { "profile-other": owned("locker", KEY_ASSET_ID) } },
    });
    await page.goto(world.url("/locker/claimed", { "visitor-name": "Other", ownerProfileId: "profile-other" }));

    await expect(page.getByRole("button", { name: "Empty Locker" })).toHaveCount(0);
    await page.locator("button.icon-with-rounded-border").click();
    await page.getByRole("button", { name: "Empty this Locker" }).click();
    await page.getByRole("button", { name: "Yes" }).click();

    await expect.poll(async () => (await world.worldData()).locker["profile-other"]).toBeNull();
    expect(await world.asset()).toMatchObject({ topLayerURL: unclaimedUrl("locker"), clickableLink: "http://localhost:3001/locker" });
  });

  test("an admin clears every locker without deleting the signs", async ({ page, world }) => {
    await world.seed({
      isAdmin: true,
      asset: buildAsset("locker", { uniqueName: "lockerSystem-1", topLayerURL: placeholderUrl("locker") }),
      extraAssets: {
        two: buildAsset("locker", { id: "two", uniqueName: "lockerSystem-2", topLayerURL: placeholderUrl("locker") }),
        desk: buildAsset("desk", { id: "desk", uniqueName: "deskSystem-1", topLayerURL: placeholderUrl("desk") }),
      },
      worldData: {
        locker: { "profile-a": owned("locker", KEY_ASSET_ID), "profile-b": owned("locker", "two") },
        desk: { "profile-a": owned("desk", "desk") },
      },
    });
    await page.goto(world.url("/locker"));

    await page.locator("button.icon-with-rounded-border").click();
    await page.getByRole("button", { name: "Clear all Lockers" }).click();
    await page.getByRole("button", { name: "Clear All", exact: true }).click();

    await expect.poll(async () => (await world.worldData()).locker).toEqual({});
    const state = await world.state();
    for (const id of [KEY_ASSET_ID, "two"]) {
      expect(state.assets[id]).toMatchObject({ topLayerURL: unclaimedUrl("locker"), clickableLink: "http://localhost:3001/locker" });
    }
    expect(state.assets.desk.topLayerURL).toBe(placeholderUrl("desk"));
    expect(state.dataObject.desk).toEqual({ "profile-a": owned("desk", "desk") });
    expect(state.events.filter((e) => e.type === "delete-asset")).toEqual([]);
    expect(state.events).toContainEqual(expect.objectContaining({ type: "analytics", analyticName: "locker-resets" }));
  });
});
