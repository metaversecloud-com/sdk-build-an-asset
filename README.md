<div align="center">
<img src="https://global-uploads.webflow.com/62e7004a0f9b3a63b980ac3c/62e70c84dd3aac06fb2ac2b6_topia-logo-blue-2x.png" style="width: 120px; margin-bottom: 20px" alt="Topia logo">
</div>

# Build-an-Asset

## Introduction / Summary

Build-an-Asset lets visitors customize a layered image asset — a snowman, a pumpkin, a locker, or a desk — from an in-world drawer. The client composites PNG layers server-side (via Jimp), uploads the result to S3, and either **drops a new dropped asset** at the visitor's location (pickup themes) or **rewrites a pre-placed sign in place** (empty themes). Ownership is tracked on the world data object per theme, so a visitor can revisit, edit, move to, or clear their own asset later.

## Key Features

### Canvas elements & interactions

- **Pickup themes (snowman, pumpkin):** the visitor enters the customizer directly; on save, a new web-image dropped asset is dropped at their current position (`+60px x-offset`) with a unique name of `{themeName}System-{profileId}`. If the visitor already has a dropped asset for that theme, the previous one is deleted.
- **Empty themes (locker, desk):** pre-placed "unclaimed" signs live in the scene, each linking to `/{themeName}` via `clickableLink`. When a visitor clicks a sign, the app claims it for that profile, then swaps the sign's web-image layers in place on save. The dropped asset itself is never moved or deleted (unless an admin picks it up).

### Drawer content

- Layered customization UI driven entirely by the per-theme config in [`client/src/constants.ts`](client/src/constants.ts) — categories (hats, scarves, bases, walls, etc.), layer order, splash sizing, required categories.
- Real-time preview using the same layer stack that the server composites on save.
- `Move to my asset` button (owners only) — teleports the visitor to the dropped asset via `/dropped-assets/move-to`.
- `Clear` button (owners + admins) — pickup themes delete the asset; empty themes revert the sign to `unclaimedAsset.png`.

### Admin features

- **Access:** any visitor whose `isAdmin` is true gets admin controls in the drawer.
- **Single clear:** admins can clear a sign they don't own (returns it to the unclaimed state).
- **Clear all:** iterates every dropped asset with unique-name prefix `{themeName}System-` and either resets each sign's image to unclaimed or (with `shouldDelete: true`) actually deletes them. Wipes the theme's slice of the world data object.

### Themes

Themes are selected by URL path (`/{themeName}`) — no env var or asset lookup. All four themes are always available; a scene simply drops the appropriate signs (empty themes) or wires the key asset's `clickableLink` to open `/{themeName}` (pickup themes).

| Theme     | Flavor | `namePlural` | Behavior on save                                                                                             |
| --------- | ------ | ------------ | ------------------------------------------------------------------------------------------------------------ |
| `snowman` | pickup | Snowmen      | Drops a new web-image asset at the visitor's position.                                                       |
| `pumpkin` | pickup | Pumpkins     | Drops a new web-image asset at the visitor's position.                                                       |
| `locker`  | empty  | Lockers      | Rewrites a pre-placed unclaimed locker sign in place.                                                        |
| `desk`    | empty  | Desks        | Rewrites a pre-placed unclaimed desk sign in place. Uses a `bottomLayerOrder` (wall/floor behind top layer). |

Adding a fifth theme is a data-only change: add an entry to [`client/src/constants.ts`](client/src/constants.ts) and drop matching PNGs at `/{themeName}/…` in the S3 bucket.

## Required Assets with Unique Names

| Unique Name                     | Placed by | Description                                                                                                                                                                                    |
| ------------------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `{themeName}System-{profileId}` | The app   | Every dropped asset the app creates uses this pattern (both pickup drops and claimed signs).                                                                                                   |
| Unclaimed sign (empty themes)   | Manually  | For `locker` / `desk`: pre-drop unclaimed signs in the scene with `clickableLink = /{themeName}`. No fixed unique name required — the app receives the clicked `assetId` via the iframe query. |

Bulk operations (`Clear all`, `Pickup all`) match by prefix: `fetchDroppedAssetsWithUniqueName({ isPartial: true, uniqueName: "{themeName}System-" })`.

## Technical Architecture

### Data Objects

#### World

The only data-object surface this app writes. Keyed by theme name, then by profileId.

```ts
{
  [themeName]: {
    [profileId]: {
      droppedAssetId: string;   // The visitor's dropped asset in this theme
      s3Url: string;            // Composite image location in S3
    };
  };
}
```

Written on claim (empty themes) and drop (pickup themes). Set to `null` on clear, and reset to `{}` on `Clear all`.

#### Key Asset / Visitor

Not used. Ownership is tracked entirely via the world data object.

### S3 Layout

- Bucket read: `https://${S3_BUCKET}.s3.amazonaws.com/`.
- Per-theme reference assets: `/{themeName}/{category}_{index}.png` (e.g. `snowman/body_0.png`, `locker/lockerBase_0.png`) plus `/{themeName}/claimedAsset.png` and `/{themeName}/unclaimedAsset.png` sentinel images.
- User composites: `/{themeName}/userUploads/{profileId}-{Date.now()}.png` (uploaded by `generateS3URL`).
- Deletion guard (`deleteFromS3.ts`): S3 deletes are skipped when the request host is `localhost` and only fire for paths containing `userUploads/` — static reference assets can't be accidentally deleted.
- Localhost bypass: on local dev, `generateS3Url` returns the shared `claimedAsset.png` placeholder instead of uploading (assumes no S3 PUT permissions locally).

## API Endpoints

All routes mount under `/api`.

| Method | Route                       | Description                                                                                                                                                                        |
| ------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET`  | `/system/health`            | App version + env-var status.                                                                                                                                                      |
| `GET`  | `/world-and-visitor`        | Fetches the world data object (initializes `{[themeName]: {}}` if missing), returns `visitorIsAdmin` + `worldDataObject`. Fires `{theme}-starts` analytic.                         |
| `POST` | `/dropped-assets/claim`     | Empty themes: validates the sign isn't taken, swaps the sign's web image to `{themeName}/claimedAsset.png`, records ownership.                                                     |
| `POST` | `/dropped-assets/clear`     | Empty themes: reverts the sign to `unclaimedAsset.png`, nulls the ownership entry, fires `{theme}-unclaims`.                                                                       |
| `POST` | `/dropped-assets/clear-all` | Admin-only. Iterates all `{themeName}System-*` dropped assets and resets or deletes them; wipes `worldDataObject[themeName]`.                                                      |
| `POST` | `/dropped-assets/drop`      | Pickup themes: composites the layers, uploads to S3, drops a new webImageAsset at the visitor's position, deletes any previous drop for that profileId, updates world dataObject.  |
| `POST` | `/dropped-assets/edit`      | Both flavors: updates the claimed asset with new top/bottom layer S3 uploads, validates required categories, refreshes `clickableLink`, fires a toast + `firework1_gold` particle. |
| `POST` | `/dropped-assets/move-to`   | Teleports the visitor to their own dropped asset's position (from `worldDataObject[theme][profileId].droppedAssetId`).                                                             |
| `POST` | `/dropped-assets/pickup`    | Closes the iframe. If `isClearAssetFromUnclaimedAsset`, deletes all drops matching `{themeName}System-{profileId}`; otherwise deletes the current dropped asset only.              |

Every request goes through the `cleanReturnPayload` middleware before responding.

## Analytics

All analytics are per-theme so a single deployment cleanly separates snowman/pumpkin/locker/desk usage in dashboards.

| Event                     | Fired when                                                           | Where                                  |
| ------------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| `{theme}-starts`          | A visitor opens the drawer for the first time this session.          | `GET /world-and-visitor`.              |
| `{theme}-builds`          | A new dropped asset is created (pickup themes) or a sign is claimed. | `POST /dropped-assets/drop`, `/claim`. |
| `{theme}-updates`         | An existing dropped asset is edited.                                 | `POST /dropped-assets/edit`.           |
| `{theme}-unclaims`        | A visitor clears their claimed sign (empty themes).                  | `POST /dropped-assets/clear`.          |
| `{theme}-resets`          | Admin runs `Clear all` in reset (not delete) mode.                   | `POST /dropped-assets/clear-all`.      |
| `{theme}-pickupAllAssets` | Admin runs `Clear all` with `shouldDelete: true`.                    | `POST /dropped-assets/clear-all`.      |
| `{theme}-pickupUserAsset` | Visitor removes their own dropped asset via the pickup flow.         | `POST /dropped-assets/pickup`.         |

If the Google Sheets vars are set, `{theme}-starts` events are also appended to the configured Sheet via `addNewRowToGoogleSheets`.

## Required Assets with Unique Names

The app uses the following unique name patterns for managing dropped assets:

| Unique Name Pattern               | Description           |
| --------------------------------- | --------------------- |
| `${themeName}System-${profileId}` | Claimed/dropped asset |

## Environment Variables

Create a `.env` at the app root and (for the client) a `client/.env`. See `.env-example` for a template.

### Root `.env` (server)

| Variable                    | Description                                                                               | Required |
| --------------------------- | ----------------------------------------------------------------------------------------- | -------- |
| `INTERACTIVE_KEY`           | Topia interactive app key. Also verified against `interactivePublicKey` on every request. | Yes      |
| `INTERACTIVE_SECRET`        | Topia interactive app secret.                                                             | Yes      |
| `API_KEY`                   | Topia API key passed to SDK `initialize()`.                                               | Yes      |
| `INSTANCE_DOMAIN`           | Topia API domain (`api.topia.io` for production, `api-stage.topia.io` for staging).       | Yes      |
| `INSTANCE_PROTOCOL`         | `https` for production/staging, `http` only for local.                                    | Yes      |
| `S3_BUCKET`                 | S3 bucket used for both reference assets and user composites.                             | Yes      |
| `IMG_ASSET_ID`              | Asset template id used when creating web-image drops. Defaults to `webImageAsset`.        | No       |
| `PORT`                      | Server port. Defaults to `3000`.                                                          | No       |
| `NODE_ENV`                  | Node environment (`production` toggles static-serving).                                   | No       |
| `COMMIT_HASH`               | Surfaced in `/system/health` for deploy tracking.                                         | No       |
| `GOOGLESHEETS_CLIENT_EMAIL` | Google service-account email for optional analytics logging.                              | No       |
| `GOOGLESHEETS_PRIVATE_KEY`  | Google service-account private key.                                                       | No       |
| `GOOGLESHEETS_SHEET_ID`     | Sheet id to log `{theme}-starts` events to. If unset, Sheets logging is skipped.          | No       |
| `GOOGLESHEETS_SHEET_RANGE`  | Sheet range (defaults to `Sheet1`).                                                       | No       |

### Client `client/.env`

| Variable         | Description                                                 | Required |
| ---------------- | ----------------------------------------------------------- | -------- |
| `VITE_S3_BUCKET` | S3 bucket the client fetches reference/preview images from. | Yes      |

### Where to find `INTERACTIVE_KEY` and `INTERACTIVE_SECRET`

- [Topia Production Account Dashboard](https://topia.io/t/dashboard/integrations)

## Getting Started

```bash
# from the app root
npm install
cd client && npm install && cd ..

# create .env at the app root and client/.env (see Environment Variables above)
cp .env-example .env

# run the dev server
npm run dev
```

Open one of:

- `http://localhost:3001/snowman`
- `http://localhost:3001/pumpkin`
- `http://localhost:3001/locker`
- `http://localhost:3001/desk`

## For Developers

### Built With

#### Client

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)

#### Server

![Node.js](https://img.shields.io/badge/node.js-%2343853D.svg?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/express-%23000000.svg?style=for-the-badge&logo=express&logoColor=white)

### App-specific notes

- **URL is the theme:** `client/src/utils/themes.ts` reads `window.location.pathname.split("/")[1]` — the entire client is theme-agnostic and the drawer's iframe URL determines which theme's config drives the UI. Pre-placed signs must set `clickableLink` to `/{themeName}` (empty themes); pickup key assets should link to `/{themeName}/edit`.
- **`clickableLink` regeneration:** on every edit, the app rebuilds the sign's `clickableLink` to encode current `imageInfo` as query params (`generateImageInfoParam`). That lets `/{themeName}/claimed` render the built asset without hitting the server.
- **Public `ClaimedAsset` page:** anyone visiting `/{themeName}/claimed?…` sees the built asset with the owner's display name. Non-owners see a static view; owners see Edit / Move / Clear buttons.
- **Ownership check:** `isDroppedAssetClaimed` prevents cross-visitor collisions — a second visitor claiming an already-taken sign gets `{ isAssetAlreadyTaken: true }` back.
- **Particle effects:** `whiteStar_burst` on drop/claim, `firework1_gold` on edit.
- **Auth guard:** every request runs `getCredentials`, which enforces `INTERACTIVE_KEY === interactivePublicKey` — mismatched keys are rejected.

### Helpful links

- [SDK Developer docs](https://metaversecloud-com.github.io/mc-sdk-js/index.html)
- View it in action: [Dev](https://topia.io/build-an-asset-dev), [Prod](https://topia.io/build-an-asset-prod)
- [Notion One Pager](https://app.notion.com/p/topiaio/Build-an-Asset-64518134dae840958b1bdd7982c3c423?assetsVersion=23.13.20260804.1234&clientBuildTarget=client)
