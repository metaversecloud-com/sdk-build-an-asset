import { APIRequestContext, test as base, expect } from "@playwright/test";
import { INTERACTIVE_KEY, MOCK_TOPIA_URL } from "./constants";

export const KEY_ASSET_ID = "key-asset";
export const SCENE_DROP_ID = "scene-1";
export const VISITOR_ID = 42;
/** Theme the API helpers send by default (the browser sends the theme from the page path). */
export const DEFAULT_THEME = "locker";

// 1x1 transparent PNG served for every S3 image the client loads, so the browser never reaches AWS.
const STUB_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
  "base64",
);

export type SeedOptions = {
  isAdmin?: boolean;
  /** Visitor is standing inside the asset's zone. */
  inZone?: boolean;
  /** false = the dropped asset the app was opened from doesn't exist in the world. */
  withAsset?: boolean;
  /** Extra dropped-asset fields (assetName, topLayerURL, uniqueName, ...). */
  asset?: Record<string, unknown>;
  /** The dropped asset's data object. */
  assetData?: Record<string, unknown>;
  /** The world's data object. */
  worldData?: Record<string, unknown>;
  /** The visitor's data object. */
  visitorData?: Record<string, unknown>;
  /** Badges the visitor already owns. */
  badges?: string[];
  /** Further dropped assets in the world, keyed by id. */
  extraAssets?: Record<string, Record<string, unknown>>;
  /** Extra visitor fields (moveTo, ...). */
  visitor?: Record<string, unknown>;
};

/** One isolated Topia world in mock-topia, plus helpers to open the app inside it. */
export class TopiaWorld {
  readonly displayName = "E2E Player";

  constructor(
    readonly urlSlug: string,
    readonly profileId: string,
    private request: APIRequestContext,
  ) {}

  async seed({
    isAdmin = false,
    inZone = true,
    withAsset = true,
    asset = {},
    assetData = {},
    worldData = {},
    visitorData = {},
    badges = [],
    extraAssets = {},
    visitor = {},
  }: SeedOptions = {}) {
    const assets: Record<string, any> = { ...extraAssets };
    if (withAsset) {
      assets[KEY_ASSET_ID] = {
        id: KEY_ASSET_ID,
        assetName: "E2E Asset",
        position: { x: 500, y: 500 },
        uniqueName: "e2e-asset",
        sceneDropId: SCENE_DROP_ID,
        topLayerURL: "https://example.invalid/e2e-asset.png",
        ...asset,
        dataObject: assetData,
      };
    }

    const response = await this.request.post(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`, {
      data: {
        dataObject: worldData,
        assets,
        visitors: {
          [VISITOR_ID]: {
            isAdmin,
            profileId: this.profileId,
            displayName: this.displayName,
            landmarkZonesString: inZone ? Object.keys(assets).join(",") : "",
            privateZoneId: "",
            moveTo: { x: 100, y: 200 },
            ...visitor,
            dataObject: visitorData,
            inventory: badges.map((name) => ({
              id: `owned-${name}`,
              item_id: `owned-${name}`,
              status: "ACTIVE",
              item: { name, type: "BADGE", image_url: "" },
            })),
          },
        },
      },
    });
    if (!response.ok()) throw new Error(`Seeding mock world failed: ${response.status()}`);
  }

  async state() {
    const response = await this.request.get(`${MOCK_TOPIA_URL}/__mock/worlds/${this.urlSlug}`);
    return (await response.json()) as {
      dataObject: Record<string, any>;
      assets: Record<string, any>;
      visitors: Record<string, any>;
      events: Array<Record<string, any>>;
      unhandled: string[];
    };
  }

  async assetData(assetId = KEY_ASSET_ID) {
    return (await this.state()).assets[assetId]?.dataObject;
  }

  async worldData() {
    return (await this.state()).dataObject;
  }

  async asset(assetId = KEY_ASSET_ID) {
    return (await this.state()).assets[assetId];
  }

  async visitorData() {
    return (await this.state()).visitors[VISITOR_ID].dataObject;
  }

  async events(type?: string) {
    const { events } = await this.state();
    return type ? events.filter((e) => e.type === type) : events;
  }

  /** Session credentials Topia appends to the app's iframe URL. */
  credentials(overrides: Record<string, string> = {}) {
    return new URLSearchParams({
      assetId: KEY_ASSET_ID,
      displayName: this.displayName,
      identityId: "identity-1",
      interactiveNonce: "e2e-nonce",
      interactivePublicKey: INTERACTIVE_KEY,
      profileId: this.profileId,
      sceneDropId: SCENE_DROP_ID,
      uniqueName: "e2e-asset",
      urlSlug: this.urlSlug,
      themeName: DEFAULT_THEME,
      username: "e2e-player",
      visitorId: String(VISITOR_ID),
      ...overrides,
    });
  }

  /** App page URL as Topia opens it in the iframe. */
  url(path = "/", overrides: Record<string, string> = {}) {
    return `${path}?${this.credentials(overrides)}`;
  }

  /** App API path carrying the session credentials, as the client's backendAPI sends them. */
  api(path: string, overrides: Record<string, string> = {}) {
    return `/api${path}?${this.credentials(overrides)}`;
  }
}

export const test = base.extend<{ world: TopiaWorld; s3Requests: string[] }>({
  s3Requests: async ({}, use) => use([]),
  // The client loads theme layers and icons straight from S3; answer them locally with a stub image.
  page: async ({ page, s3Requests }, use) => {
    await page.route(/^https:\/\/[^/]*amazonaws\.com\//, (route) => {
      s3Requests.push(route.request().url());
      return route.fulfill({ status: 200, contentType: "image/png", body: STUB_PNG });
    });
    await use(page);
  },
  world: async ({ request }, use, testInfo) => {
    const id = `${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`.replace(/[^a-zA-Z0-9-]/g, "");
    const world = new TopiaWorld(`world-${id}`, `profile-${id}`, request);
    await use(world);

    // Fail the test if the app called a public-API endpoint the mock doesn't implement (e.g. after an
    // @rtsdk/topia upgrade): it would otherwise pass against a 501 the real API never returns.
    expect((await world.state()).unhandled, "public-API calls mock-topia doesn't implement").toEqual([]);
    const outside = await (await request.get(`${MOCK_TOPIA_URL}/__mock/unhandled`)).json();
    expect(outside, "public-API calls mock-topia doesn't implement").toEqual([]);
  },
});

export { expect } from "@playwright/test";

// ---- Build an Asset helpers ----

/** Where generateS3Url points when the request host is localhost (always, under test). */
export const placeholderUrl = (theme: string) => `https://e2e-no-bucket.s3.amazonaws.com/${theme}/claimedAsset.png`;
/** Image the app puts back on an emptied sign. */
export const unclaimedUrl = (theme: string) => `https://e2e-no-bucket.s3.amazonaws.com/${theme}/unclaimedAsset.png`;

/** A pre-placed sign (empty themes) or a dropped build (pickup themes) in the world. */
export const buildAsset = (theme: string, fields: Record<string, unknown> = {}) => ({
  assetName: `${theme} sign`,
  position: { x: 300, y: 400 },
  sceneDropId: SCENE_DROP_ID,
  topLayerURL: unclaimedUrl(theme),
  bottomLayerURL: "",
  ...fields,
});

/** Opens the accordion of a category and clicks the card showing `imageName`. */
export const pickItem = async (page: import("@playwright/test").Page, category: string, imageName: string) => {
  const section = page.locator("details.accordion-item").filter({ has: page.getByText(`Select ${category}`, { exact: true }) });
  if (!(await section.evaluate((el) => (el as HTMLDetailsElement).open))) await section.locator("summary").click();
  await section.locator("button.card").filter({ has: page.locator(`img[src$="/${imageName}"]`) }).click();
};

/** Opens a variations card (by its first image) and picks one variation in the modal. */
export const pickVariation = async (
  page: import("@playwright/test").Page,
  category: string,
  cardImage: string,
  variation: string,
) => {
  await pickItem(page, category, cardImage);
  const modal = page.locator(".modal").filter({ has: page.getByRole("heading", { name: "Select Item" }) });
  await modal.locator("button.card").filter({ has: page.locator(`img[src$="/${variation}"]`) }).click();
  await modal.getByRole("button", { name: "OK" }).click();
};
